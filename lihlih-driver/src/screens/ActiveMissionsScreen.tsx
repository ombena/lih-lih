import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
  Dimensions
} from 'react-native';
import {
  MapPin,
  Phone,
  Navigation,
  ShoppingBag,
  PackageCheck,
  CircleDashed,
  Lock
} from 'lucide-react-native';
import DriverHeader from '../components/DriverHeader';
import { useMissionStore } from '../hooks/useMissionStore';
import { DeliveryOTPInput } from '../components/DeliveryOTPInput';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:3000/api';

const { width } = Dimensions.get('window');

export default function ActiveMissionsScreen() {
  const { activeMissions, fetchMissions, isLoading } = useMissionStore();

  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = React.useState(false);
  const [completingOrderId, setCompletingOrderId] = React.useState<number | null>(null);
  const [completingGrandTotal, setCompletingGrandTotal] = React.useState<number>(0);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [completingError, setCompletingError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchMissions(1); // Hardcoded driver ID for now
  }, []);

  const openDeliveryModal = (orderId: number, grandTotal: number) => {
    setCompletingOrderId(orderId);
    setCompletingGrandTotal(grandTotal);
    setIsDeliveryModalVisible(true);
    setCompletingError(null);
  };

  const handleCompleteOrder = async (pin: string) => {
    if (!completingOrderId) return;
    setIsCompleting(true);
    setCompletingError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${completingOrderId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la validation.');
      }

      setIsDeliveryModalVisible(false);
      setCompletingOrderId(null);
      fetchMissions(1); // Refresh the list
    } catch (err: any) {
      setCompletingError(err.message);
    } finally {
      setIsCompleting(false);
    }
  };

  // Grouping logic: Orders grouped by Client ID
  const groupedMissions = useMemo(() => {
    const groups: any = {};
    activeMissions.forEach((order) => {
      if (!order.client || !order.client.id) return;
      
      const clientId = order.client.id;
      if (!groups[clientId]) {
        groups[clientId] = {
          client: order.client,
          dropoff_lat: order.dropoff_lat,
          dropoff_lng: order.dropoff_lng,
          orders: []
        };
      }
      groups[clientId].orders.push(order);
    });
    return Object.values(groups);
  }, [activeMissions]);

  const navigateToClient = (lat: number, lng: number, clientName: string) => {
    const label = encodeURIComponent(`Livraison: ${clientName}`);
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    if (url) Linking.openURL(url);
  };

  const callClient = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DriverHeader />

      <View style={styles.sectionHeader}>
        <PackageCheck color="#ae2900" size={20} />
        <Text style={styles.sectionTitle}>MON SAC ({activeMissions.length} COMMANDES)</Text>
      </View>

      {groupedMissions.length === 0 ? (
        <View style={styles.emptyState}>
          <CircleDashed color="#2c2f30" size={64} strokeWidth={1} />
          <Text style={styles.emptyTitle}>Sac vide</Text>
          <Text style={styles.emptySubtitle}>Récupérez des commandes sur le radar pour commencer.</Text>
        </View>
      ) : (
        groupedMissions.map((mission: any, idx) => (
          <View key={idx} style={styles.missionCard}>
            {/* Mission Header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.clientLabel}>CLIENT</Text>
                <Text style={styles.clientName}>{mission.client.name}</Text>
              </View>
              <Pressable 
                onPress={() => callClient(mission.client.phone_number)}
                style={styles.callBtn}
              >
                <Phone color="#FFF" size={16} fill="#FFF" />
              </Pressable>
            </View>

            {/* Address Box */}
            <View style={styles.addressBox}>
              <MapPin color="#ae2900" size={16} />
              <View style={styles.addressInfo}>
                <Text style={styles.addressTitle}>Adresse de livraison</Text>
                <Text style={styles.addressCoords}>
                  Lat: {Number(mission.dropoff_lat).toFixed(5)}, Lng: {Number(mission.dropoff_lng).toFixed(5)}
                </Text>
              </View>
            </View>

            {/* Orders in this mission */}
            <View style={styles.ordersContainer}>
              {mission.orders.map((order: any) => (
                <View key={order.id} style={styles.orderStrip}>
                  <View style={styles.orderStripInfo}>
                    <ShoppingBag color="#abadae" size={14} />
                    <Text style={styles.orderText}>
                      Commande #{order.id} • {order.items?.length || 0} articles
                    </Text>
                  </View>
                  <Pressable 
                    onPress={() => openDeliveryModal(order.id, Number(order.grand_total) || 0)}
                    style={({ pressed }) => [
                      styles.deliverBtn,
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <Lock color="#00C853" size={14} />
                    <Text style={styles.deliverBtnText}>LIVRER</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {/* Navigation Button */}
            <Pressable 
              onPress={() => navigateToClient(mission.dropoff_lat, mission.dropoff_lng, mission.client.name)}
              style={({ pressed }) => [
                styles.navBtn,
                { opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <Navigation color="#FFF" size={16} fill="#FFF" />
              <Text style={styles.navBtnText}>LANCER L'ITINÉRAIRE</Text>
            </Pressable>
          </View>
        ))
      )}

      <DeliveryOTPInput
        isVisible={isDeliveryModalVisible}
        onClose={() => setIsDeliveryModalVisible(false)}
        onSubmit={handleCompleteOrder}
        isLoading={isCompleting}
        error={completingError}
        grandTotal={completingGrandTotal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121415',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  missionCard: {
    backgroundColor: '#1a1c1d',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2c2f30',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  clientLabel: {
    color: '#595c5d',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  clientName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    backgroundColor: '#121415',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 2,
  },
  addressCoords: {
    color: '#abadae',
    fontSize: 11,
    fontWeight: '700',
  },
  ordersContainer: {
    marginBottom: 24,
    gap: 12,
  },
  orderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121415',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2c2f30',
  },
  orderStripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderText: {
    color: '#abadae',
    fontSize: 12,
    fontWeight: '700',
  },
  deliverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00C853',
    gap: 6,
  },
  deliverBtnText: {
    color: '#00C853',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  navBtn: {
    backgroundColor: '#ae2900',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  navBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  emptySubtitle: {
    color: '#595c5d',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 40,
  }
});
