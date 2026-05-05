import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Colors, SurfaceCard, KineticButton } from '../components/UIPrimitives';
import { ArrowLeft, Star, Clock, Plus, ShoppingCart, ChefHat, CheckSquare, Package, Coins, Zap, ShoppingBag } from 'lucide-react-native';
import { formatSocialProofNumber } from '../utils/formatters';
import { useCartStore } from '../store/useCartStore';
import axios from 'axios';

const API_URL = 'http://192.168.1.12:3000/api';

const DEFAULT_STORE_IMAGE = require('../../assets/defaults/store-placeholder.png');

export default function StoreScreen({ route, navigation }: any) {
  const { storeId, storeName } = route.params;
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/stores/${storeId}`);
      return response.data;
    },
  });

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      store_id: storeId,
      store_name: store.name,
      quantity: 1,
    });
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = cartItems.find(i => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const groupedMenu = store.menu_items.reduce((acc: any, item: any) => {
    const cat = item.category || 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const renderMenuItem = ({ item }: { item: any }) => (
    <SurfaceCard style={styles.menuItemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description || "Pas de description disponible."}
        </Text>
        <Text style={styles.itemPrice}>{Number(item.price)} DA</Text>
      </View>
      
      <View style={styles.actionContainer}>
        {getItemQuantity(item.id) > 0 ? (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{getItemQuantity(item.id)}</Text>
          </View>
        ) : null}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Plus color={Colors.onPrimary} size={24} />
        </TouchableOpacity>
      </View>
    </SurfaceCard>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={store.image_url ? { uri: store.image_url } : DEFAULT_STORE_IMAGE} 
          style={styles.heroImage} 
        />
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        
        <View style={styles.storeHeaderInfo}>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.storeName}>{store.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.9 }}>
              <ShoppingBag color="#FFF" size={16} />
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>
                {formatSocialProofNumber(store.total_orders_count)} Commandes
              </Text>
            </View>
          </View>


          {/* New Pillar Row */}
          <View style={[styles.metaRow, { marginTop: 12, opacity: 0.9 }]}>
            <View style={styles.metaBadge}>
              <ChefHat color="#FFF" size={16} />
              <Text style={[styles.metaText, { fontSize: 15 }]}>
                {store.review_count > 0 ? (store.sum_quality / store.review_count).toFixed(1) : '-'}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <CheckSquare color="#FFF" size={16} />
              <Text style={[styles.metaText, { fontSize: 15 }]}>
                {store.review_count > 0 ? (store.sum_accuracy / store.review_count).toFixed(1) : '-'}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Package color="#FFF" size={16} />
              <Text style={[styles.metaText, { fontSize: 15 }]}>
                {store.review_count > 0 ? (store.sum_packaging / store.review_count).toFixed(1) : '-'}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Coins color="#FFF" size={16} />
              <Text style={[styles.metaText, { fontSize: 15 }]}>
                {store.review_count > 0 ? (store.sum_value / store.review_count).toFixed(1) : '-'}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Zap color="#FFF" size={16} />
              <Text style={[styles.metaText, { fontSize: 15 }]}>
                {store.review_count > 0 ? (store.sum_speed / store.review_count).toFixed(1) : '-'}
              </Text>
            </View>

            <View style={[styles.metaBadge, { marginLeft: 'auto', alignItems: 'center' }]}>
              <Star color="#FFB800" size={32} fill="#FFB800" />
              <Text style={[styles.metaText, { fontSize: 24, fontWeight: '900' }]}>{store.rating}</Text>
            </View>
          </View>
        </View>
      </View>

  

      <FlatList
        data={Object.entries(groupedMenu)}
        keyExtractor={([category]) => category}
        contentContainerStyle={styles.menuList}
        renderItem={({ item: [category, items] }: any) => (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {items.map((menuItem: any) => (
              <View key={menuItem.id}>
                {renderMenuItem({ item: menuItem })}
              </View>
            ))}
          </View>
        )}
        ListFooterComponent={
          store.reviews && store.reviews.length > 0 ? (
            <View style={[styles.reviewsSection, { marginTop: 16, borderBottomWidth: 0 }]}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.reviewsTitle}>Les derniers avis clients</Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={store.reviews}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.reviewsHorizontalList}
                renderItem={({ item }) => (
                  <SurfaceCard style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.clientName}>{item.client?.name}</Text>
                      <View style={styles.ratingBadge}>
                        <Star color="#FFB800" size={14} fill="#FFB800" />
                        <Text style={styles.ratingText}>
                          {((item.rating_quality + item.rating_accuracy + item.rating_packaging + item.rating_value + item.rating_speed) / 5).toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reviewComment} numberOfLines={3}>
                      {item.comment || "Aucun commentaire laissé."}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </SurfaceCard>
                )}
              />
            </View>
          ) : null
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceContainerLow,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeHeaderInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  storeName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  menuList: {
    padding: 16,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.onSurface,
    marginBottom: 16,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  menuItemCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  actionContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quantityBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 1,
  },
  quantityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsSection: {
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  reviewsHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  reviewsHorizontalList: {
    paddingHorizontal: 16,
  },
  reviewCard: {
    width: 280,
    padding: 16,
    marginHorizontal: 8,
    backgroundColor: Colors.surfaceContainerLow,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFB800',
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.outline,
    fontWeight: '500',
  }
});
