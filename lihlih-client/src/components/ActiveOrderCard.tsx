import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, SurfaceCard, StatusBadge, OrderJourneyTimeline } from './UIPrimitives';
import { Store, Hash, CreditCard, ShieldCheck, CheckCircle2, Archive, X } from 'lucide-react-native';

export default function ActiveOrderCard({ order, onArchive }: { order: any, onArchive?: (id: number) => void }) {
  const isPickedUp = order.status === 'Picked_Up' || order.status === 'Arriving' || order.status === 'Delivered';
  const isDelivered = order.status === 'Delivered';
  
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
      <View style={[styles.otpBlock, isDelivered && styles.otpBlockSuccess]}>
        <View style={styles.otpHeader}>
          {isDelivered ? (
            <CheckCircle2 color={Colors.onPrimary} size={18} />
          ) : (
            <ShieldCheck color={Colors.onPrimary} size={18} />
          )}
          <Text style={styles.otpTitle}>
            {isDelivered ? 'Commande Livrée avec Succès' : 'Code de Livraison (PIN)'}
          </Text>
        </View>
        <Text style={styles.otpCode}>{isDelivered ? 'VALIDÉ' : order.delivery_pin}</Text>
        <Text style={styles.otpDisclaimer}>
          {isDelivered 
            ? 'Merci d\'avoir choisi LihLih ! Bon appétit.' 
            : 'Donnez ce code au livreur uniquement lorsque vous recevez votre commande.'}
        </Text>
      </View>

      {order.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions spéciales :</Text>
          <Text style={styles.instructionsText}>"{order.instructions}"</Text>
        </View>
      )}

      {isDelivered && (
        <TouchableOpacity 
          style={styles.archiveBtn} 
          onPress={() => onArchive?.(order.id)}
        >
          <Archive size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.archiveBtnText}>Archiver cette commande</Text>
        </TouchableOpacity>
      )}

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
  },
  otpBlockSuccess: {
    backgroundColor: Colors.success,
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    marginBottom: 15,
    gap: 8,
  },
  archiveBtnText: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  instructionsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.onSurface,
    fontWeight: '600',
    fontStyle: 'italic',
  }
});
