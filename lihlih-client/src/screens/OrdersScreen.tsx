import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Colors, KineticButton } from '../components/UIPrimitives';
import { API_URL } from '../services/api';
import ActiveOrderCard from '../components/ActiveOrderCard';
import { useOrderSocket } from '../hooks/useOrderSocket';
import { ShoppingBag, Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const CLIENT_ID = 1; // Hardcoded for MVP

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  
  // 1. Initialize Real-time Sync
  useOrderSocket(CLIENT_ID);

  // 2. Fetch Active Orders
  const { 
    data: orders, 
    isLoading, 
    isRefetching, 
    refetch 
  } = useQuery({
    queryKey: ['active_orders', CLIENT_ID],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/orders/client/${CLIENT_ID}/active`);
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Chargement de vos commandes...</Text>
      </View>
    );
  }

  const handleArchiveOrder = async (orderId: number) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/archive`);
      refetch();
    } catch (error) {
      console.error('Error archiving order:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Commandes en Cours</Text>
        <Text style={styles.subtitle}>Suivez vos livraisons en temps réel</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ActiveOrderCard 
            order={item} 
            onArchive={handleArchiveOrder} 
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            colors={[Colors.primary]} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShoppingBag size={80} color={Colors.surfaceContainerHigh} strokeWidth={1} />
            <Text style={styles.emptyTitle}>Aucune commande active</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas de commande en cours pour le moment.
            </Text>
            <KineticButton 
              title="Découvrir les restaurants" 
              onPress={() => navigation.navigate('Discovery')}
              style={{ marginTop: 20 }}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.onSurface,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.onSurfaceVariant,
    fontSize: 14,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.onSurface,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  }
});
