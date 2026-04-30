import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Animated } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from './UIPrimitives';
import { useCartStore } from '../store/useCartStore';

export default function FloatingCartButton({ state }: { state?: any }) {
  const navigation = useNavigation<any>();
  const cartItems = useCartStore((state) => state.items);
  
  // Get current route name to hide on Cart screen
  const currentRouteName = state ? state.routes[state.index].name : null;

  if (cartItems.length === 0 || currentRouteName === 'Cart') {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.floatingCart}
      onPress={() => navigation.navigate('Cart')}
      activeOpacity={0.8}
    >
      <ShoppingCart color={Colors.onPrimary} size={28} />
      <View style={styles.cartCount}>
        <Text style={styles.cartCountText}>{cartItems.length}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingCart: {
    position: 'absolute',
    bottom: 100, // Positioned above the BottomNavBar
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 999,
  },
  cartCount: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFF',
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
