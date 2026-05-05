import { create } from 'zustand';

interface Order {
  id: string;
  status: string;
  client: {
    id: number;
    name: string;
    phone_number: string;
  };
  store: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  dropoff_lat: number;
  dropoff_lng: number;
  items: any[];
  food_total: number;
}

interface MissionState {
  activeMissions: Order[];
  isLoading: boolean;
  addMission: (order: Order) => void;
  removeMission: (orderId: string) => void;
  setMissions: (missions: Order[]) => void;
  fetchMissions: (driverId: number) => Promise<void>;
  clearMissions: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:3000/api';

export const useMissionStore = create<MissionState>((set) => ({
  activeMissions: [],
  isLoading: false,

  addMission: (order) => set((state) => {
    // Ensure ID comparison is type-safe
    if (state.activeMissions.some(m => String(m.id) === String(order.id))) return state;
    // Mark as local to prevent overwrite during sync
    return { activeMissions: [...state.activeMissions, { ...order, is_local: true }] };
  }),

  removeMission: (orderId) => set((state) => ({
    activeMissions: state.activeMissions.filter(m => String(m.id) !== String(orderId))
  })),

  setMissions: (missions) => set({ activeMissions: missions }),

  fetchMissions: async (driverId) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/orders/active-missions?driver_id=${driverId}`);
      if (response.ok) {
        const data = await response.json();
        set((state) => {
          // Merge logic: Keep local missions that might not have synced yet
          // but prioritize server data for everything else
          const serverIds = data.map((m: any) => String(m.id));
          const onlyLocal = state.activeMissions.filter(
            m => !serverIds.includes(String(m.id)) && (m as any).is_local
          );
          return { activeMissions: [...data, ...onlyLocal], isLoading: false };
        });
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
      set({ isLoading: false });
    }
  },

  clearMissions: () => set({ activeMissions: [] }),
}));
