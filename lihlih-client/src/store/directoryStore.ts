import { create } from 'zustand';
import { StoreSummary } from '../services/storageService';
import { calculateNearbyStores } from '../utils/edgeMath';

interface DirectoryState {
  allStores: StoreSummary[];
  nearbyStores: any[];
  isLoaded: boolean;
  initDirectory: (allStores: StoreSummary[], nearbyStores: any[]) => void;
  recalculateNearby: (lat: number, lng: number, wilaya: string, baladia: string) => void;
}

export const useDirectoryStore = create<DirectoryState>((set, get) => ({
  allStores: [],
  nearbyStores: [],
  isLoaded: false,
  initDirectory: (allStores, nearbyStores) => set({ allStores, nearbyStores, isLoaded: true }),
  recalculateNearby: (lat, lng, wilaya, baladia) => {
    const { allStores } = get();
    if (allStores.length === 0) return;
    const nearby = calculateNearbyStores(allStores, lat, lng, wilaya, baladia);
    set({ nearbyStores: nearby });
  },
}));
