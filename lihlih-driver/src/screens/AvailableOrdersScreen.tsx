import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import {
  Settings,
  Banknote,
  CheckCircle2,
  RefreshCw,
  Flame,
  Navigation,
  ChevronRight,
  MapPin,
  Receipt,
  ShoppingBag,
  Briefcase,
  Radar,
} from "lucide-react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import * as Location from 'expo-location';
import DriverHeader from '../components/DriverHeader';
import { KineticSwitch, KineticSlider } from "../components/UIPrimitives";
import { OasisPulse, OasisLoadingOverlay } from "../components/KineticLoader";
import { OasisOTPInput } from "../components/OasisOTPInput";

const { height } = Dimensions.get("window");

import { useBountyBoard } from "../hooks/useBountyBoard";
import { StoreOrderSheet } from "../components/StoreOrderSheet";
import { useMissionStore } from "../hooks/useMissionStore";

// Use local IP for testing or process.env
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:3000/api';

export default function AvailableOrdersScreen() {
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const { addMission, fetchMissions } = useMissionStore();

  // OTP Modal State
  const [isOTPVisible, setIsOTPVisible] = useState(false);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Request location permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
      }
    })();
  }, []);

  // Local state for Master Online and Range Controller
  const [isOnline, setIsOnline] = useState(true);
  const [maxRange, setMaxRange] = useState(1.5);
  const [isGpsPulseActive, setIsGpsPulseActive] = useState(true);

  // Hook receives the new toggle states
  const { stores, countdown, isSyncing, locationError, coords } = useBountyBoard(isOnline, maxRange, isGpsPulseActive);

  // Auto-deactivate GPS pulse when going offline to save battery
  useEffect(() => {
    if (!isOnline) {
      setIsGpsPulseActive(false);
    }
  }, [isOnline]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "70%"], []);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      // The sheet is fully closed. Wipe the old data to prevent ghosts!
      setSelectedStore(null);
      setIsLoadingDetails(false);
    }
  };

  const openSheet = async (store: any) => {
    // 1. Set the new store and loading state FIRST
    setSelectedStore({ ...store, orders_list: [] });
    setIsLoadingDetails(true);

    // 2. Wait for the next UI frame so React paints the Loader, THEN expand
    requestAnimationFrame(() => {
      bottomSheetRef.current?.expand();
    });

    try {
      const fetchPromise = await fetch(`${API_BASE_URL}/stores/${store.id}/active-orders?available_only=true`);

      if (fetchPromise.ok) {
        const data = await fetchPromise.json();
        const mappedOrders = data.map((o: any) => ({
          id: o.id.toString(),
          items: o.items ? o.items.map((i: any) => `${i.quantity}x ${i.food_name}`).join(', ') : 'Articles inconnus',
          address: `Livraison (Lat: ${Number(o.dropoff_lat).toFixed(3)}, Lng: ${Number(o.dropoff_lng).toFixed(3)})`,
        }));
        setSelectedStore({ ...store, orders_list: mappedOrders });
      }
    } catch (error) {
      console.error("Failed to fetch store details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleClaimPress = (orderId: string) => {
    setClaimingOrderId(orderId);
    setClaimError(null);
    setIsOTPVisible(true);
  };

  const onPinSubmit = async (pin: string, deliveryFee: number) => {
    setIsClaiming(true);
    setClaimError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${claimingOrderId}/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: 1, // Hardcoded for now
          pin_code: pin,
          delivery_fee: deliveryFee
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Add to local store for "Mon Sac"
        addMission(data.order);
        
        // Force a re-sync of active missions from server to be 100% sure
        fetchMissions(1);

        // Success! Remove the order from the local list
        if (selectedStore) {
          const updatedOrders = selectedStore.orders_list.filter((o: any) => o.id !== claimingOrderId);
          setSelectedStore({ ...selectedStore, orders_list: updatedOrders });
          
          // If no more orders, close the sheet
          if (updatedOrders.length === 0) {
            bottomSheetRef.current?.close();
          }
        }
        
        setIsOTPVisible(false);
        setClaimingOrderId(null);
        // We could also show a success toast here
      } else {
        setClaimError(data.error || 'Échec de la réclamation');
      }
    } catch (error) {
      console.error('Claim error:', error);
      setClaimError('Erreur de connexion au serveur');
    } finally {
      setIsClaiming(false);
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <DriverHeader />
        </View>

        <KineticSwitch
          value={isOnline}
          onValueChange={async (val) => {
            if (val) {
              // Smooth activation sequence
              setSelectedStore(null);
              setIsLoadingDetails(true);
              setIsOnline(true);
              setIsGpsPulseActive(true);
              await new Promise(resolve => setTimeout(resolve, 1500));
              setIsLoadingDetails(false);
            } else {
              setIsOnline(false);
            }
          }}
        />

        <View
          style={[styles.headerControlsRow, { opacity: isOnline && !isLoadingDetails ? 1 : 0.4 }]}
          pointerEvents={isOnline && !isLoadingDetails ? "auto" : "none"}
        >
          <View style={styles.controlsRow}>
            <View style={styles.countdownBadge}>
              <RefreshCw color="#abadae" size={12} />
              <Text style={styles.countdownText}>
                ACTU. {countdown}S
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.gpsToggle,
                isGpsPulseActive ? styles.gpsToggleActive : styles.gpsToggleInactive,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => setIsGpsPulseActive(!isGpsPulseActive)}
            >
              <MapPin color={isGpsPulseActive ? "#FFF" : "#abadae"} size={12} />
              <Text style={[styles.gpsToggleText, isGpsPulseActive && { color: '#FFF' }]}>
                GPS Direct
              </Text>
            </Pressable>
          </View>

          <View style={[styles.coordsBox, { opacity: coords ? 1 : 0.4 }]}>
            <Text style={styles.coordsText}>
              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "0.00000, 0.00000"}
            </Text>
          </View>
        </View>

        <View
          style={[styles.sliderContainer, { opacity: isOnline ? 1 : 0.4 }]}
          pointerEvents={isOnline ? "auto" : "none"}
        >
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Rayon de recherche</Text>
            <Text style={styles.sliderValue}>
              {maxRange < 1 ? `${(maxRange * 1000).toFixed(0)} M` : `${maxRange.toFixed(1)} KM`}
            </Text>
          </View>
          <KineticSlider
            min={0.1}
            max={3}
            step={0.1}
            value={maxRange}
            onValueChange={setMaxRange}
          />
        </View>
      </View>


      {/* BOUNTY BOARD LIST */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
      >
        {isOnline && !isLoadingDetails && stores.length > 0 && (
          stores.map((store) => (
            <Pressable
              key={store.id}
              style={({ pressed }) => [
                styles.storeCard,
                store.is_surge && styles.storeCardSurge,
                { opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => openSheet(store)}
            >
              <View style={styles.storeCardLeft}>
                {store.is_surge && (
                  <View style={styles.surgeTag}>
                    <Flame color="#ff7855" size={12} fill="#ff7855" />
                    <Text style={styles.surgeTagText}>ZONE CHAUDE</Text>
                  </View>
                )}
                <Text style={styles.storeCardName}>{store.name}</Text>
                <View style={styles.distanceBadge}>
                  <Navigation color="#ff7855" size={12} fill="#ff7855" />
                  <Text style={styles.distanceText}>{store.distance} KM</Text>
                </View>
              </View>

              <View style={styles.storeCardRight}>
                <View style={styles.storeCardMetrics}>
                  <Text style={styles.readyLabel}>PRÊTES</Text>
                  <Text
                    style={[
                      styles.readyValue,
                      store.is_surge && { color: "#ff7855" },
                    ]}
                  >
                    {store.active_orders}
                  </Text>
                </View>
                <View style={styles.chevronBox}>
                  <ChevronRight color="#FFF" size={20} />
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>


      {/* BOTTOM SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableContentPanningGesture={false}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        {selectedStore && (
          <StoreOrderSheet 
            key={selectedStore.id}
            selectedStore={selectedStore} 
            isLoadingDetails={isLoadingDetails}
            onClaimPress={handleClaimPress}
          />
        )}
      </BottomSheet>

      {/* PIN MODAL */}
      <OasisOTPInput 
        isVisible={isOTPVisible}
        isLoading={isClaiming}
        error={claimError}
        onClose={() => setIsOTPVisible(false)}
        onSubmit={onPinSubmit}
      />
      {/* GLOBAL FIXED RADAR (FOR OFFLINE / EMPTY / ACTIVATING) */}
      {(!isOnline || (isLoadingDetails && !selectedStore) || (isOnline && stores.length === 0)) && (
        <View style={styles.globalRadarContainer} pointerEvents="none">
          <OasisPulse isActive={isOnline} size={140} />
        </View>
      )}

      {/* GLOBAL ACTIVATION OVERLAY ONLY */}
      {isLoadingDetails && !selectedStore && (
        <OasisLoadingOverlay />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  globalRadarContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '45%',
    zIndex: 1000,
  },
  sheetLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  sheetLoaderText: {
    color: '#abadae',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 20,
    letterSpacing: 2,
  },
  container: { flex: 1, backgroundColor: "#121415" },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  driverInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2c2f30",
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  driverName: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  statusText: {
    color: "#22C55E",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2c2f30",
    justifyContent: "center",
    alignItems: "center",
  },
  metricsContainer: { flexDirection: "row", gap: 12 },
  headerMetricCard: {
    flex: 1,
    backgroundColor: "#2c2f30",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  metricCardLabel: {
    color: "#abadae",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  metricCardValue: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  metricCardCurrency: { fontSize: 12, color: "#595c5d" },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subHeaderTitle: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  emptySubtitle: { color: "#595c5d", fontSize: 14, fontWeight: "700" },
  storeCard: {
    backgroundColor: "#1a1c1d",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storeCardSurge: {
    backgroundColor: "#241815",
  },
  storeCardLeft: { flex: 1 },
  surgeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  surgeTagText: {
    color: "#ff7855",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  storeCardName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2c2f30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  distanceText: {
    color: "#abadae",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  storeCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingLeft: 16,
    marginLeft: 16,
  },
  storeCardMetrics: { alignItems: "center" },
  readyLabel: {
    color: "#595c5d",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  readyValue: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  chevronBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2c2f30",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#1a1c1d",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  navItem: { alignItems: "center", gap: 4 },
  navItemInactive: { alignItems: "center", gap: 4, opacity: 0.4 },
  navText: { fontSize: 10, fontWeight: "900", letterSpacing: 1, color: "#FFF" },
  navBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ae2900",
    borderWidth: 2,
    borderColor: "#1a1c1d",
  },
  sheetBackground: {
    backgroundColor: "#1a1c1d",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  sheetIndicator: { backgroundColor: "#2c2f30", width: 48 },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    gap: 4,
    justifyContent: 'center',
  },
  gpsToggleActive: {
    backgroundColor: '#ae2900',
  },
  gpsToggleInactive: {
    backgroundColor: '#2c2f30',
  },
  gpsToggleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#abadae',
    textTransform: 'uppercase',
  },
  sliderContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    color: '#abadae',
    fontSize: 13,
    fontWeight: '600',
  },
  sliderValue: {
    color: '#ff7855',
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2c2f30",
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },
  countdownText: {
    color: "#abadae",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  coordsBox: {
    backgroundColor: '#1a1c1d',
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
  },
  coordsText: {
    color: '#595c5d',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
