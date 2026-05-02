import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MapPin, ShoppingBag, Receipt, RefreshCw } from 'lucide-react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { OasisPulse, KineticRingLoader } from './KineticLoader';

interface StoreOrderSheetProps {
  selectedStore: any;
  isLoadingDetails: boolean;
}

export const StoreOrderSheet = ({ selectedStore, isLoadingDetails }: StoreOrderSheetProps) => {
  if (!selectedStore) return null;

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
              </View>
            ))}
          </BottomSheetScrollView>
        )}
      </View>

      <Pressable style={({ pressed }) => [styles.pinBtn, { opacity: pressed ? 0.9 : 1 }]}>
        <Text style={styles.pinBtnText}>
          SAISIR LE CODE PIN AU COMPTOIR
        </Text>
      </Pressable>
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
});
