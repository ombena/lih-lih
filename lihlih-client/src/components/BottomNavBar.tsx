import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Home, Search, ShoppingBag, User, ShoppingCart } from 'lucide-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from './UIPrimitives';

export default function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const getIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? Colors.primary : Colors.onSurfaceVariant;
    switch (routeName) {
      case 'Discovery': return <Home color={color} size={24} />;
      case 'Cart': return <ShoppingCart color={color} size={24} />;
      case 'Orders': return <ShoppingBag color={color} size={24} />;
      case 'Profile': return <User color={color} size={24} />;
      default: return <Home color={color} size={24} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'Discovery': return 'Découvrir';
      case 'Cart': return 'Panier';
      case 'Orders': return 'Commandes';
      case 'Profile': return 'Profil';
      default: return routeName;
    }
  };

  return (
    <View style={styles.navBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.navItem, isFocused && styles.navItemActive]}
            onPress={onPress}
          >
            {getIcon(route.name, isFocused)}
            <Text style={[styles.navText, isFocused && styles.navTextActive]}>
              {getLabel(route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingBottom: 24,
    paddingTop: 12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 237, 213, 0.5)',
  },
  navText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  navTextActive: {
    color: Colors.primary,
  }
});
