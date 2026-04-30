import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MapPin, User } from 'lucide-react-native';
import { getClientData, subscribeToClientData, ClientData } from '../services/storageService';
import { Colors } from './UIPrimitives';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TopNavBar() {
  const [data, setData] = useState<ClientData | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToClientData((newData) => {
      setData(newData);
    });
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    const d = await getClientData();
    setData(d);
  };

  const defaultPreset = data?.presets.find(p => p.is_default);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.greetingSection}>
        <View style={styles.avatar}>
          <User color={Colors.primary} size={20} />
        </View>
        <Text style={styles.greetingText}>
          {data?.profile.name ? `Salut, ${data.profile.name}` : 'Bienvenue'}
        </Text>
      </View>

      <View style={styles.locationSection}>
        <MapPin color={Colors.primary} size={16} />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationLabel}>Livrer à</Text>
          <Text style={styles.locationValue} numberOfLines={1}>
            {defaultPreset ? defaultPreset.preset_name : 'Choisir une adresse'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: Colors.surfaceContainerLow,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexShrink: 1,
    maxWidth: '55%',
  },
  locationTextContainer: {
    marginLeft: 6,
    flexShrink: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  }
});
