import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, SurfaceCard, StatusBadge, OrderJourneyTimeline } from './UIPrimitives';
import { Store, Hash, CreditCard, ShieldCheck } from 'lucide-react-native';

export default function ActiveOrderCard({ order }: { order: any }) {
  const isPickedUp = order.status === 'Picked_Up' || order.status === 'Arriving';
  
  return (
    <SurfaceCard style={styles.card}>
      {/* Header: Store Name & ID */}
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <Store color={Colors.primary} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.storeName}>{order.store?.name || 'Restaurant'}</Text>
        </View>
        <View style={styles.orderIdBadge}>
          <Hash size={20} color={Colors.onSurfaceVariant} />
          <Text style={styles.orderIdText}>{order.id}</Text>
        </View>
      </View>

      {/* Progress Timeline */}
      <OrderJourneyTimeline status={order.status} />
      
      <View style={styles.divider} />

      {/* The OTP Security Block - HIGHLIGHTED */}
      <View style={styles.otpBlock}>
        <View style={styles.otpHeader}>
          <ShieldCheck color={Colors.onPrimary} size={18} />
          <Text style={styles.otpTitle}>Code de Livraison (PIN)</Text>
        </View>
        <Text style={styles.otpCode}>{order.delivery_pin}</Text>
        <Text style={styles.otpDisclaimer}>
          Donnez ce code au livreur uniquement lorsque vous recevez votre commande.
        </Text>
      </View>

      {/* Price Summary */}
      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Articles ({order.items?.length || 0})</Text>
          <Text style={styles.priceValue}>{order.food_total} DA</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Frais de livraison</Text>
          <Text style={styles.priceValue}>
            {isPickedUp ? `${order.delivery_fee} DA` : 'Calculé par le livreur'}
          </Text>
        </View>
        {order.grand_total && (
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>{order.grand_total} DA</Text>
          </View>
        )}
      </View>
      
      <View style={styles.statusFooter}>
        <StatusBadge status={order.status} />
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.onSurface,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  orderIdText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginVertical: 15,
  },
  otpBlock: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpTitle: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  otpCode: {
    color: Colors.onPrimary,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginVertical: 4,
  },
  otpDisclaimer: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  footer: {
    marginTop: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  priceValue: {
    fontSize: 14,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.onSurface,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusFooter: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  }
});
