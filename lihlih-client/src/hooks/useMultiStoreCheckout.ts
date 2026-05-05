import { useMemo, useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { getClientData, ClientData } from '../services/storageService';
import { Alert } from 'react-native';
import { createOrder } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export const useMultiStoreCheckout = () => {
  const navigation = useNavigation<any>();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructions, setInstructions] = useState<Record<number, string>>({});

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    const data = await getClientData();
    setClientData(data);
  };

  const updateInstructions = (storeId: number, text: string) => {
    setInstructions(prev => ({ ...prev, [storeId]: text }));
  };

  const defaultPreset = clientData?.presets.find(p => p.is_default);

  // Group items by store_id
  const groupedOrders = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      if (!acc[item.store_id]) {
        acc[item.store_id] = {
          store_name: item.store_name,
          items: []
        };
      }
      acc[item.store_id].items.push(item);
      return acc;
    }, {} as Record<number, { store_name: string; items: typeof cartItems }>);
  }, [cartItems]);

  const submitAllOrders = async () => {
    if (!defaultPreset || !clientData?.profile.phone_number) {
      Alert.alert("Erreur", "Veuillez compléter votre profil et sélectionner une adresse de livraison.");
      return;
    }

    try {
      setIsSubmitting(true);
      // For MVP: Hardcoded client_id 1 (corresponds to seeded test client)
      const CLIENT_ID = 1; 

      // Prepare and send orders for each store group
      const promises = Object.entries(groupedOrders).map(([storeId, storeData]) => {
        const sId = parseInt(storeId);
        const orderPayload = {
          client_id: CLIENT_ID,
          store_id: sId,
          dropoff_lat: defaultPreset.lat,
          dropoff_lng: defaultPreset.lng,
          instructions: instructions[sId] || null, // Include instructions here
          items: storeData.items.map(item => ({
            item_id: item.id,
            quantity: item.quantity
          }))
        };
        return createOrder(orderPayload);
      });

      await Promise.all(promises);
      
      clearCart();
      navigation.navigate('Orders');
      
      Alert.alert(
        "Succès ✅", 
        "Vos commandes ont été envoyées ! Suivez-les en temps réel."
      );
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Une erreur est survenue.";
      Alert.alert("Erreur de commande", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitAllOrders,
    groupedOrders,
    instructions,
    updateInstructions,
    isReady: cartItems.length > 0 && !!defaultPreset && !isSubmitting,
    isSubmitting,
    defaultPreset
  };
};
