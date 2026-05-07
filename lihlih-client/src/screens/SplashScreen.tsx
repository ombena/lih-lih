import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Dimensions, StatusBar, Alert } from 'react-native';
import axios from 'axios';
import { Colors } from '../components/UIPrimitives';
import { getClientData, getCachedDirectory, saveDirectoryCache, getLocalDirectoryVersion, StoreSummary } from '../services/storageService';
import { API_URL } from '../services/api';
import { calculateNearbyStores } from '../utils/edgeMath';
import { fetchActiveRegions } from '../services/systemAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: (allStores: StoreSummary[], nearbyStores: any[]) => void;
  onNavigateToLogin: () => void;
}

export default function SplashScreen({ onFinish, onNavigateToLogin }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // The Command Center Sequence
    const bootSequence = async () => {
      try {
        // 1. Identity Verification
        const clientData = await getClientData();
        const phone = clientData.profile.phone_number;

        if (!phone) {
          // New user or no phone saved
          setTimeout(() => onNavigateToLogin(), 2000);
          return;
        }

        // 1.5 Sync Active Regions (OTA)
        try {
          const regions = await fetchActiveRegions();
          await AsyncStorage.setItem('@lihlih_active_regions', JSON.stringify(regions));
        } catch (regionErr) {
          console.warn("Failed to sync active regions, using cache");
        }

        try {
          await axios.get(`${API_URL}/auth/me`, { params: { phone_number: phone } });
        } catch (authErr: any) {
          if (authErr.response?.status === 404 || authErr.response?.status === 401) {
            onNavigateToLogin();
            return;
          }
          // If it's a network error, we might want to continue in offline mode
          console.warn("Auth check network error, continuing offline");
        }

        // 2. Directory Sync (Version Control)
        const localVersion = await getLocalDirectoryVersion();
        let stores: StoreSummary[] = [];
        
        try {
          const versionRes = await axios.get(`${API_URL}/stores/version`);
          const serverVersion = versionRes.data.version;

          if (serverVersion !== localVersion || localVersion === 0) {
            const dirRes = await axios.get(`${API_URL}/stores/directory`);
            stores = dirRes.data;
            await saveDirectoryCache(stores, serverVersion);
          } else {
            stores = await getCachedDirectory();
          }
        } catch (syncErr) {
          console.warn("Sync failed, using cache");
          stores = await getCachedDirectory();
        }

        // 3. Edge Computing (Strict Filtering Logic)
        const activePreset = clientData.presets.find(p => p.is_default) || clientData.presets[0];
        
        if (!activePreset || !activePreset.lat || !activePreset.lng) {
          // If no address is set, the feed must be empty per requirement
          onFinish(stores, []);
          return;
        }

        const processedStores = calculateNearbyStores(
          stores, 
          activePreset.lat, 
          activePreset.lng, 
          activePreset.wilaya, 
          activePreset.baladia
        );

        // Success! Transition to UI with filtered feed
        setTimeout(() => onFinish(stores, processedStores), 1500);

      } catch (globalErr) {
        console.error("Boot sequence failed:", globalErr);
        onFinish([], []); // Fallback to normal loading
      }
    };

    bootSequence();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Image 
          source={require('../../assets/lihlih_logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.Text style={styles.tagline}>
          Livraison Rapide • Saveurs Locales
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary, // #ae2900
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 40,
  },
  tagline: {
    marginTop: 24,
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
