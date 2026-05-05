import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useMultiStoreCheckout } from '../hooks/useMultiStoreCheckout';
import { Colors, SurfaceCard, OasisInput } from '../components/UIPrimitives';
import { useCartStore } from '../store/useCartStore';
import { MapPin, ShoppingCart, Trash2, MessageSquare } from 'lucide-react-native';
import { SwipeToCheckoutButton } from '../components/SwipeToCheckoutButton';

export default function CartScreen() {
  const {
    groupedOrders,
    submitAllOrders,
    instructions,
    updateInstructions,
    isReady,
    isSubmitting,
    defaultPreset
  } = useMultiStoreCheckout();
  const removeItem = useCartStore((state) => state.removeItem);
  const cartItems = useCartStore((state) => state.items);

  const calculateStoreTotal = (items: any[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const grandTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <ShoppingCart color={Colors.surfaceContainerHigh} size={64} style={{ marginBottom: 16 }} />
        <Text style={styles.emptyTitle}>Votre panier est vide</Text>
        <Text style={styles.emptyText}>Commencez à ajouter des articles depuis vos restaurants préférés !</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Mon Panier</Text>

        {/* Delivery Destination */}
        <SurfaceCard style={styles.deliveryCard}>
          <View style={styles.deliveryHeader}>
            <MapPin color={Colors.primary} size={20} />
            <Text style={styles.deliveryTitle}>Livraison à</Text>
          </View>
          {defaultPreset ? (
            <Text style={styles.deliveryAddress}>{defaultPreset.preset_name} - {defaultPreset.baladia}</Text>
          ) : (
            <Text style={styles.deliveryAddressError}>Aucune adresse sélectionnée</Text>
          )}
        </SurfaceCard>

        {/* Store Groups */}
        {Object.entries(groupedOrders).map(([storeId, storeData]) => {
          const sId = parseInt(storeId);
          return (
            <SurfaceCard key={storeId} style={styles.storeGroupCard}>
              <View style={styles.storeGroupHeader}>
                <Text style={styles.storeGroupName}>{storeData.store_name}</Text>
                <Text style={styles.storeTotal}>{calculateStoreTotal(storeData.items)} DA</Text>
              </View>

              {storeData.items.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemQtyContainer}>
                    <Text style={styles.itemQty}>{item.quantity}x</Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{item.price} DA</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteButton}>
                    <Trash2 color={Colors.error} size={20} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.instructionContainer}>
                <OasisInput
                  placeholder="Instructions spéciales (ex: pas d'oignons...)"
                  value={instructions[sId] || ''}
                  onChangeText={(text: string) => updateInstructions(sId, text)}
                  leftIcon={<MessageSquare color={Colors.onSurfaceVariant} size={18} />}
                />
              </View>
            </SurfaceCard>
          );
        })}

        {/* Global Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.disclaimer}>
            Note: Ce panier contient des commandes de plusieurs restaurants. Les frais de livraison seront calculés par restaurant à l'arrivée.
          </Text>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total des articles</Text>
            <Text style={styles.grandTotalValue}>{grandTotal} DA</Text>
          </View>
        </View>
        <View style={styles.checkoutBar}>
          <SwipeToCheckoutButton
            onConfirm={submitAllOrders}
            isReady={isReady}
          />
        </View>
      </ScrollView>

      {/* Sticky Checkout Bar */}


      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Envoi de vos commandes...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Space for BottomNavBar and CheckoutBar
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 24,
    marginTop: 16,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    fontSize: 16,
  },
  deliveryCard: {
    padding: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderColor: Colors.primaryContainer,
    borderWidth: 1,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  deliveryAddress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.onSurface,
  },
  deliveryAddressError: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
  storeGroupCard: {
    padding: 0,
    overflow: 'hidden',
    marginTop: 16,
  },
  storeGroupHeader: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  storeGroupName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  storeTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  itemQtyContainer: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  itemQty: {
    fontWeight: 'bold',
    color: Colors.onSurface,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  instructionContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  summaryContainer: {
    marginTop: 24,
    padding: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 80, // Above bottom nav
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
    alignItems: 'center', // Center the swipe button
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  }
});
