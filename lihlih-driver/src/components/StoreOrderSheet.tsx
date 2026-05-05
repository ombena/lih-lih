import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { MapPin, ShoppingBag, Receipt, RefreshCw, Navigation, ArrowRight } from 'lucide-react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { OasisPulse, KineticRingLoader } from './KineticLoader';

interface StoreOrderSheetProps {
  selectedStore: any;
  isLoadingDetails: boolean;
  onClaimPress: (orderId: string) => void;
}

export const StoreOrderSheet = ({ selectedStore, isLoadingDetails, onClaimPress }: StoreOrderSheetProps) => {
  if (!selectedStore) return null;

  const navigateToStore = () => {
    const lat = selectedStore.lat;
    const lng = selectedStore.lng;
    const label = encodeURIComponent(selectedStore.name);
    
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  return (
    <View key={selectedStore.id} style={styles.sheetContent}>
      <View style={styles.sheetHeader}>
        <View>
          {selectedStore.is_surge && (
            <View style={styles.sheetSurgeTag}>
              <Text style={styles.sheetSurgeText}>FORTE DEMANDE</Text>
            </View>
          )}
          <Text style={styles.sheetStoreName}>{selectedStore.name}</Text>
          <View style={styles.sheetDistanceRow}>
            <MapPin color="#abadae" size={12} />
            <Text style={styles.sheetDistanceText}>
              À {selectedStore.distance} KM DE VOUS
            </Text>
          </View>
        </View>
        <View style={styles.bagsBox}>
          <Text style={styles.bagsValue}>
            {selectedStore.active_orders}
          </Text>
          <Text style={styles.bagsLabel}>SACS</Text>
        </View>
      </View>

      <Pressable 
        onPress={navigateToStore}
        style={({ pressed }) => [
          styles.navBtn,
          { opacity: pressed ? 0.8 : 1 }
        ]}
      >
        <Navigation color="#FFF" size={16} fill="#FFF" />
        <Text style={styles.navBtnText}>NAVIGUER VERS LE RESTAURANT</Text>
      </Pressable>

      <View style={styles.ordersListContainer}>
        <Text style={styles.ordersListTitle}>
          DÉTAILS DES COMMANDES
        </Text>
        {isLoadingDetails ? (
          <View style={styles.sheetLoaderContainer}>
             <KineticRingLoader size={50} />
          </View>
        ) : (
          <BottomSheetScrollView
            style={styles.ordersList}
            contentContainerStyle={styles.ordersListContent}
            showsVerticalScrollIndicator={false}
          >
            {selectedStore.orders_list?.map((order: any) => (
              <View key={order.id} style={styles.orderItem}>
                <View style={styles.orderItemHeader}>
                  <Text style={styles.orderId}>Commande #{order.id}</Text>
                  <Receipt color="#595c5d" size={16} />
                </View>
                <View style={styles.orderItemRow}>
                  <ShoppingBag
                    color="#abadae"
                    size={14}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={styles.orderItemDesc}>{order.items}</Text>
                </View>
                <View style={styles.orderItemRow}>
                  <MapPin
                    color="#ae2900"
                    size={14}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={styles.orderItemAddress}>
                    {order.address}
                  </Text>
                </View>

                <Pressable 
                  onPress={() => onClaimPress(order.id)}
                  style={({ pressed }) => [
                    styles.itemClaimBtn,
                    { opacity: pressed ? 0.8 : 1 }
                  ]}
                >
                  <Text style={styles.itemClaimBtnText}>ACCEPTER (SAISIR PIN)</Text>
                  <ArrowRight color="#FFF" size={14} />
                </Pressable>
              </View>
            ))}
          </BottomSheetScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContent: { padding: 24, flex: 1, height: '100%' },
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
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  sheetSurgeTag: {
    backgroundColor: "#ae2900",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  sheetSurgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sheetStoreName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -1,
  },
  sheetDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  sheetDistanceText: {
    color: "#abadae",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bagsBox: {
    backgroundColor: "#2c2f30",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: 70,
  },
  bagsValue: { color: "#FFF", fontSize: 24, fontWeight: "900", lineHeight: 24 },
  bagsLabel: {
    color: "#595c5d",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  ordersListContainer: { flex: 1, marginBottom: 24 },
  ordersListTitle: {
    color: "#595c5d",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  ordersList: { flex: 1 },
  ordersListContent: { paddingBottom: 20 },
  orderItem: {
    backgroundColor: "#121415",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2c2f30",
  },
  orderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  orderItemDesc: {
    color: "#abadae",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    lineHeight: 18,
  },
  orderItemAddress: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    lineHeight: 18,
  },
  pinBtn: {
    backgroundColor: "#ae2900",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  pinBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  navBtn: {
    backgroundColor: '#2c2f30',
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3a3d3e',
  },
  navBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  itemClaimBtn: {
    backgroundColor: '#ae2900',
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  itemClaimBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});
