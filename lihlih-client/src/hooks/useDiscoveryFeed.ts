import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStoresByLocation } from '../services/api';
import { getClientData, ClientData } from '../services/storageService';

export const useDiscoveryFeed = () => {
  const [data, setData] = useState<ClientData | null>(null);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const d = await getClientData();
    setData(d);
  };

  const defaultPreset = data?.presets.find(p => p.is_default);

  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ['stores', defaultPreset?.wilaya, defaultPreset?.baladia],
    queryFn: () => fetchStoresByLocation(defaultPreset?.wilaya || '', defaultPreset?.baladia || ''),
    enabled: !!defaultPreset,
  });

  const filteredStores = useMemo(() => {
    if (!stores) return [];
    
    return stores.filter((store: any) => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
      const tags = store.tags;
      const matchesCategory = activeCategory === 'Tous' || 
        (Array.isArray(tags) 
          ? tags.includes(activeCategory) 
          : tags?.split(',').map((t: string) => t.trim()).includes(activeCategory));
      return matchesSearch && matchesCategory;
    });
  }, [stores, activeCategory, searchQuery]);

  return { 
    filteredStores, 
    isLoading, 
    refetch, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    defaultPreset
  };
};
