import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDiscoveryFeed } from '../hooks/useDiscoveryFeed';
import { Colors, OasisInput, SurfaceCard } from '../components/UIPrimitives';
import { Search, Star, ChefHat, CheckSquare, Package, Coins, Zap, ShoppingBag, MapPin } from 'lucide-react-native';
import { formatSocialProofNumber } from '../utils/formatters';
import { useUnreviewedOrders } from '../hooks/useUnreviewedOrders';
import ReviewBottomSheet from '../components/ReviewBottomSheet';
import { getClientData } from '../services/storageService';
import { useDirectoryStore } from '../store/directoryStore';

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

  console.log('DEBUG [DiscoveryScreen]:', {
    hasDefaultPreset: !!defaultPreset,
    storeCount: filteredStores?.length,
    isLoading,
    currentArea: defaultPreset ? `${defaultPreset.wilaya}, ${defaultPreset.baladia}` : 'None'
  });

  const { data: unreviewedOrders, refetch: refetchUnreviewed } = useUnreviewedOrders(CLIENT_ID);
  
  // Force refetch and LOG EVERYTHING for debugging
  useFocusEffect(
    React.useCallback(() => {
      console.log('--- DEBUG CACHE START ---');
      getClientData().then(data => {
        console.log('CLIENT DATA (AsyncStorage):', JSON.stringify(data, null, 2));
      });
      console.log('DIRECTORY STORE (Zustand):', {
        isLoaded: useDirectoryStore.getState().isLoaded,
        allStoresCount: useDirectoryStore.getState().allStores.length,
        nearbyStoresCount: useDirectoryStore.getState().nearbyStores.length,
        sampleStore: useDirectoryStore.getState().allStores[0]
      });
      console.log('--- DEBUG CACHE END ---');

      refetch();
      refetchUnreviewed();
    }, [refetch, refetchUnreviewed])
  );

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
                <Text style={styles.distanceText}>
                  • {item.distanceKm?.toFixed(1)} km
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

  if (!defaultPreset) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <MapPin color={Colors.surfaceContainerHigh} size={120} strokeWidth={1} />
        </View>
        <Text style={styles.emptyTitle}>Où êtes-vous ?</Text>
        <Text style={styles.emptySubtitle}>
          Veuillez configurer une adresse de livraison dans votre profil pour découvrir les restaurants à proximité.
        </Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionButtonText}>Configurer mon adresse</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <OasisInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher un restaurant..."
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
            <View style={[styles.emptyContainer, { marginTop: 40 }]}>
              <View style={styles.emptyIconContainer}>
                <ChefHat color={Colors.surfaceContainerHigh} size={120} strokeWidth={1} />
              </View>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptySubtitle}>
                Nous n'avons trouvé aucun restaurant {searchQuery ? `pour "${searchQuery}"` : ''} dans cette zone.
              </Text>
            </View>
          ) : null
        }
      />

      {orderToReview && (
        <ReviewBottomSheet
          key={orderToReview.id}
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
    marginBottom: 16,
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
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  pillarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  }
});
