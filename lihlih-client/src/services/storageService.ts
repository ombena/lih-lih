import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@lihlih_client_data';

type Listener = (data: ClientData) => void;
const listeners = new Set<Listener>();

export const subscribeToClientData = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export interface Profile {
  name: string;
  phone_number: string;
}

export interface Preset {
  id: string;
  preset_name: string;
  wilaya: string;
  baladia: string;
  street: string;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface ClientData {
  profile: Profile;
  presets: Preset[];
}

const DEFAULT_DATA: ClientData = {
  profile: { name: '', phone_number: '' },
  presets: []
};

export const getClientData = async (): Promise<ClientData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : DEFAULT_DATA;
  } catch (e) {
    console.error('Failed to fetch client data', e);
    return DEFAULT_DATA;
  }
};

export const saveClientData = async (data: ClientData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    listeners.forEach(listener => listener(data));
  } catch (e) {
    console.error('Failed to save client data', e);
  }
};

export const updateProfile = async (profile: Profile): Promise<void> => {
  const data = await getClientData();
  data.profile = profile;
  await saveClientData(data);
};

export const addPreset = async (preset: Preset): Promise<void> => {
  const data = await getClientData();
  // If it's the first preset, make it default automatically
  if (data.presets.length === 0) {
    preset.is_default = true;
  }
  
  // If this preset is set to default, unset others
  if (preset.is_default) {
    data.presets.forEach(p => p.is_default = false);
  }
  
  data.presets.push(preset);
  await saveClientData(data);
};

export const updatePreset = async (updatedPreset: Preset): Promise<void> => {
  const data = await getClientData();
  
  if (updatedPreset.is_default) {
    data.presets.forEach(p => p.is_default = false);
  }
  
  const index = data.presets.findIndex(p => p.id === updatedPreset.id);
  if (index !== -1) {
    data.presets[index] = updatedPreset;
    await saveClientData(data);
  }
};

export const deletePreset = async (id: string): Promise<void> => {
  const data = await getClientData();
  data.presets = data.presets.filter(p => p.id !== id);
  // If we deleted the default, make the first one default (if any left)
  if (data.presets.length > 0 && !data.presets.some(p => p.is_default)) {
    data.presets[0].is_default = true;
  }
  await saveClientData(data);
};

export const setDefaultPreset = async (id: string): Promise<void> => {
  const data = await getClientData();
  data.presets.forEach(p => {
    p.is_default = (p.id === id);
  });
  await saveClientData(data);
};
