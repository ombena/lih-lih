import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getClientData, ClientData, subscribeToClientData } from '../services/storageService';
import { useDirectoryStore } from '../store/directoryStore';
import { API_URL } from '../services/api';

export const useDiscoveryFeed = () => {
  const [data, setData] = useState<ClientData | null>(null);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { nearbyStores, isLoaded, recalculateNearby, allStores } = useDirectoryStore();

  useEffect(() => {
    console.log('DEBUG [useDiscoveryFeed] Store State:', {
      isLoaded,
      allStoresCount: allStores?.length,
      nearbyStoresCount: nearbyStores?.length,
      hasData: !!data
    });
    // Initial load
    getClientData().then(setData);

    // Subscribe to changes (e.g. from ProfileScreen)
    const unsubscribe = subscribeToClientData((updatedData) => {
      setData(updatedData);
    });

    return () => unsubscribe();
  }, []);

  const defaultPreset = data?.presets.find(p => p.is_default);

  // Re-calculate nearby stores whenever the default address changes
  useEffect(() => {
    if (defaultPreset && isLoaded) {
      console.log('DEBUG [useDiscoveryFeed] Recalculating for:', {
        wilaya: defaultPreset.wilaya,
        baladia: defaultPreset.baladia,
        lat: defaultPreset.lat,
        lng: defaultPreset.lng
      });
      recalculateNearby(
        defaultPreset.lat, 
        defaultPreset.lng, 
        defaultPreset.wilaya, 
        defaultPreset.baladia
      );
    } else {
      console.log('DEBUG [useDiscoveryFeed] Skip recalculate:', { 
        hasPreset: !!defaultPreset, 
        isLoaded 
      });
    }
  }, [defaultPreset?.id, isLoaded, defaultPreset?.wilaya, defaultPreset?.baladia]);

  // Hydrate the nearby stores with real-time data from the server
  const { data: hydratedStores, isLoading: isHydrating, refetch } = useQuery({
    queryKey: ['hydrate_stores', nearbyStores.map(s => s.id)],
    queryFn: async () => {
      console.log('DEBUG [useDiscoveryFeed] Hydrating nearby stores:', nearbyStores.map(s => s.id));
      if (nearbyStores.length === 0) return [];
      try {
        const response = await axios.post(`${API_URL}/stores/hydrate`, {
          ids: nearbyStores.map(s => s.id)
        });
        console.log('DEBUG [useDiscoveryFeed] Hydration response count:', response.data.length);
        
        // Merge distance data from local store with hydrated data from server
        return response.data.map((hStore: any) => {
          const local = nearbyStores.find(s => s.id === hStore.id);
          return { ...hStore, distanceKm: local?.distanceKm };
        });
      } catch (err) {
        console.error('DEBUG [useDiscoveryFeed] Hydration failed:', err);
        throw err;
      }
    },
    enabled: isLoaded && !!defaultPreset,
  });

  useEffect(() => {
    console.log('DEBUG [useDiscoveryFeed] nearbyStores updated:', nearbyStores.length);
  }, [nearbyStores]);

  const filteredStores = useMemo(() => {
    if (!hydratedStores || !defaultPreset) return [];
    
    return hydratedStores.filter((store: any) => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
      const tags = store.tags;
      const matchesCategory = activeCategory === 'Tous' || 
        (Array.isArray(tags) 
          ? tags.includes(activeCategory) 
          : tags?.split(',').map((t: string) => t.trim()).includes(activeCategory));
      return matchesSearch && matchesCategory;
    });
  }, [hydratedStores, activeCategory, searchQuery]);

  return { 
    filteredStores, 
    isLoading: !isLoaded || isHydrating, 
    refetch, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    defaultPreset
  };
};
