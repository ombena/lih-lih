import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { distance, point } from '@turf/turf';

// Use the local network IP for testing on physical devices, or process.env
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:3000/api'; 
const STORE_DIR_KEY = '@lihlih_store_directory';

export interface StoreDirectoryItem {
  id: number;
  name: string;
  lat: number;
  lng: number;
  is_open: boolean;
}

export interface PulseItem {
  store_id: number;
  active_orders: number;
  is_surge: boolean;
}

export interface BountyStore {
  id: number;
  name: string;
  distance: number; // in km
  active_orders: number;
  is_surge: boolean;
  orders_list?: any[]; // Kept for UI compatibility, filled lazily
}

export function useBountyBoard(isOnline: boolean, maxRange: number = 10, isGpsPulseActive: boolean = true) {
  const [stores, setStores] = useState<BountyStore[]>([]);
  const [countdown, setCountdown] = useState(10);
  const [isSyncing, setIsSyncing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const coordsRef = useRef<{ lat: number, lng: number } | null>(null);
  
  const localStoreDirectory = useRef<Record<number, StoreDirectoryItem>>({});
  const localDirectoryVersion = useRef<number>(0);
  const DIR_VERSION_KEY = '@lihlih_dir_version';

  // Sync ref with state
  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  // 1. Initialize Store Directory Cache on boot
  useEffect(() => {
    const initializeDirectory = async () => {
      setIsSyncing(true);
      try {
        // Try to load from cache first
        const [cached, cachedVer] = await Promise.all([
          AsyncStorage.getItem(STORE_DIR_KEY),
          AsyncStorage.getItem(DIR_VERSION_KEY)
        ]);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          const map: Record<number, StoreDirectoryItem> = {};
          parsed.forEach((s: StoreDirectoryItem) => { map[s.id] = s; });
          localStoreDirectory.current = map;
        }
        if (cachedVer) {
          localDirectoryVersion.current = parseInt(cachedVer);
        }

        // Fetch from API (Delta Sync ready)
        const response = await fetch(`${API_BASE_URL}/stores/directory`);
        if (response.ok) {
          const data: StoreDirectoryItem[] = await response.json();
          // Update cache
          await AsyncStorage.setItem(STORE_DIR_KEY, JSON.stringify(data));
          // Update ref
          const map: Record<number, StoreDirectoryItem> = {};
          data.forEach(s => { map[s.id] = s; });
          localStoreDirectory.current = map;
        }
      } catch (error) {
        console.error('Error syncing store directory:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    initializeDirectory();
  }, []);

  // 2. The 5-Second Pulse Loop
  useEffect(() => {
    if (!isOnline) {
      setStores([]);
      return;
    }

    const fetchPulseAndMerge = async () => {
      try {
        let driverPoint;
        if (isGpsPulseActive) {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const newCoords = { lat: location.coords.latitude, lng: location.coords.longitude };
            setCoords(newCoords);
            driverPoint = point([newCoords.lng, newCoords.lat]);
          } catch (locErr) {
            console.warn("Hardware GPS failed, using last known:", locErr);
            if (coordsRef.current) {
              driverPoint = point([coordsRef.current.lng, coordsRef.current.lat]);
            } else {
              driverPoint = point([2.873, 33.799]);
              setCoords({ lat: 33.799, lng: 2.873 });
            }
          }
        } else {
          // Use last known coordinates from Ref
          if (coordsRef.current) {
            driverPoint = point([coordsRef.current.lng, coordsRef.current.lat]);
          } else {
            driverPoint = point([2.873, 33.799]);
            setCoords({ lat: 33.799, lng: 2.873 });
          }
        }

        const response = await fetch(`${API_BASE_URL}/orders/pulse`);
        if (!response.ok) throw new Error('Pulse fetch failed');
        const data = await response.json();
        const pulseData: PulseItem[] = data.pulse;
        
        const mergedStores: BountyStore[] = [];
        for (const pulse of pulseData) {
          const storeCache = localStoreDirectory.current[pulse.store_id];
          if (!storeCache || !storeCache.lat || !storeCache.lng) continue;

          const storePoint = point([Number(storeCache.lng), Number(storeCache.lat)]);
          const distKm = distance(driverPoint, storePoint, { units: 'kilometers' });

          mergedStores.push({
            id: storeCache.id,
            name: storeCache.name,
            distance: parseFloat(distKm.toFixed(1)),
            active_orders: pulse.active_orders,
            is_surge: pulse.is_surge,
            orders_list: [],
          });
        }

        mergedStores.sort((a, b) => a.distance - b.distance);
        setStores(mergedStores);
      } catch (error) {
        console.error('Pulse loop error:', error);
      }
    };

    // Run immediately
    fetchPulseAndMerge();
    setCountdown(10);

    // Heartbeat Interval (Always runs if Online)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchPulseAndMerge();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnline, isGpsPulseActive]); // Removed maxRange and isSyncing to prevent resetting interval

  // Filter the processed stores by maxRange locally to allow instant UI updates
  const filteredStores = stores.filter(store => store.distance <= maxRange);

  return { stores: filteredStores, countdown, isSyncing, locationError, coords };
}
