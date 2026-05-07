import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchActiveRegions, ActiveRegions } from '../services/systemAPI';

const REGIONS_CACHE_KEY = '@lihlih_active_regions';

export const useRegionSync = () => {
  const [activeRegions, setActiveRegions] = useState<ActiveRegions>({});
  const [isLoading, setIsLoading] = useState(true);

  const syncRegions = async () => {
    try {
      setIsLoading(true);
      const remoteRegions = await fetchActiveRegions();
      await AsyncStorage.setItem(REGIONS_CACHE_KEY, JSON.stringify(remoteRegions));
      setActiveRegions(remoteRegions);
    } catch (error) {
      console.error("Failed to sync regions:", error);
      // Fallback to cache if available
      const cached = await AsyncStorage.getItem(REGIONS_CACHE_KEY);
      if (cached) {
        setActiveRegions(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(REGIONS_CACHE_KEY);
      if (cached) {
        setActiveRegions(JSON.parse(cached));
        setIsLoading(false);
      } else {
        await syncRegions();
      }
    } catch (error) {
      await syncRegions();
    }
  };

  useEffect(() => {
    loadFromCache();
  }, []);

  return { activeRegions, isLoading, syncRegions };
};
