import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDiscoveryFeed } from '../hooks/useDiscoveryFeed';
import { Colors, OasisInput, SurfaceCard } from '../components/UIPrimitives';
import { Search, Star, ChefHat, CheckSquare, Package, Coins, Zap, ShoppingBag } from 'lucide-react-native';
import { formatSocialProofNumber } from '../utils/formatters';
import { useUnreviewedOrders } from '../hooks/useUnreviewedOrders';
import ReviewBottomSheet from '../components/ReviewBottomSheet';

const CLIENT_ID = 1; // MVP Hardcoded

const CATEGORIES = [
  "Tous",
  "Pizza",
  "Sandwichs",
  "Tacos",
  "Burgers",
  "Plats",
  "Salades",
  "Accompagnements",
  "Boissons",
  "Desserts",
  "Sauces",
  "Général"
];


const DEFAULT_STORE_IMAGE = require('../../assets/defaults/store-placeholder.png');

export default function DiscoveryScreen() {
  const {
    filteredStores,
    isLoading,
    refetch,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    defaultPreset
  } = useDiscoveryFeed();
  const navigation = useNavigation<any>();

  // PHASE 6: Feedback Loop Trigger
  const { data: unreviewedOrders } = useUnreviewedOrders(CLIENT_ID);
  const orderToReview = unreviewedOrders?.[0];

  const getPillarRating = (sum: number, count: number) => {
    if (!count || count === 0) return "-";
    return (sum / count).toFixed(1);
  };

  const renderStoreCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Store', { storeId: item.id, storeName: item.name })}
    >
      <SurfaceCard style={styles.storeCard}>
        <Image
          source={item.image_url ? { uri: item.image_url } : DEFAULT_STORE_IMAGE}
          style={styles.storeImage}
        />
        <View style={styles.storeInfo}>
          <View style={styles.storeMainInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{item.name}</Text>
              <View style={styles.socialProofContainer}>
                <ShoppingBag color={Colors.primary} size={14} />
                <Text style={styles.socialProofText}>
                  {formatSocialProofNumber(item.total_orders_count)} Commandes
                </Text>
              </View>
            </View>

          </View>

          <View style={styles.pillarMeta}>
            <View style={styles.pillarItem}>
              <ChefHat color={Colors.onSurfaceVariant} size={16} />
              <Text style={styles.pillarText}>{getPillarRating(item.sum_quality, item.review_count)}</Text>
            </View>
            <View style={styles.pillarItem}>
              <CheckSquare color={Colors.onSurfaceVariant} size={16} />
              <Text style={styles.pillarText}>{getPillarRating(item.sum_accuracy, item.review_count)}</Text>
            </View>
            <View style={styles.pillarItem}>
              <Package color={Colors.onSurfaceVariant} size={16} />
              <Text style={styles.pillarText}>{getPillarRating(item.sum_packaging, item.review_count)}</Text>
            </View>
            <View style={styles.pillarItem}>
              <Coins color={Colors.onSurfaceVariant} size={16} />
              <Text style={styles.pillarText}>{getPillarRating(item.sum_value, item.review_count)}</Text>
            </View>
            <View style={styles.pillarItem}>
              <Zap color={Colors.onSurfaceVariant} size={16} />
              <Text style={styles.pillarText}>{getPillarRating(item.sum_speed, item.review_count)}</Text>
            </View>
             <View style={[styles.ratingBadge, { marginLeft: 'auto' }]}>
            <Star color="#FFB800" size={24} fill="#FFB800" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          </View>
        </View>
        
      </SurfaceCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <OasisInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un store, fast food, pizzeria..."
          leftIcon={<Search color={Colors.onSurfaceVariant} size={20} />}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryPill, activeCategory === item && styles.categoryPillActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStoreCard}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun restaurant trouvé pour "{searchQuery}" dans cette zone.</Text>
            </View>
          ) : null
        }
      />

      {orderToReview && (
        <ReviewBottomSheet
          order={orderToReview}
          clientId={CLIENT_ID}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    right: 32,
    top: 36,
    zIndex: 1,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.onPrimary,
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  storeCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  storeImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceContainerLow,
  },
  storeInfo: {
    padding: 16,   
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
    flex: 1,
  },
  storeMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 24,
    fontWeight: '900',
    color: '#FFB800',
  },
  pillarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialProofContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  socialProofText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  pillarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '500',
  }
});
