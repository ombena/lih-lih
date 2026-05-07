import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Modal, Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import { MapPin, Trash2, Plus, ChevronLeft, Check } from 'lucide-react-native';
import { SurfaceCard, OasisInput, KineticButton, KineticRadio, Colors, OasisSelect } from '../components/UIPrimitives';
import { getClientData, updateProfile, addPreset, deletePreset, setDefaultPreset, ClientData, Preset } from '../services/storageService';
import { useRegionSync } from '../hooks/useRegionSync';

export default function ProfileScreen() {
  const [data, setData] = useState<ClientData>({ profile: { name: '', phone_number: '' }, presets: [] });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const insets = useSafeAreaInsets();
  
  // Region Data
  const { activeRegions, isLoading: regionsLoading } = useRegionSync();
  const [pickerMode, setPickerMode] = useState<'wilaya' | 'baladia' | null>(null);

  // Modal State
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [modalPreset, setModalPreset] = useState<Partial<Preset>>({});
  
  const wilayas = Object.keys(activeRegions);
  const baladias = modalPreset.wilaya ? activeRegions[modalPreset.wilaya] : [];

  const handleRegionSelect = (item: string) => {
    if (pickerMode === 'wilaya') {
      setModalPreset({ ...modalPreset, wilaya: item, baladia: '' });
    } else {
      setModalPreset({ ...modalPreset, baladia: item });
    }
    setPickerMode(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const d = await getClientData();
    setData(d);
    setName(d.profile.name);
    setPhone(d.profile.phone_number);
  };

  const handlePhoneChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 0 && cleaned[0] !== '0') {
      cleaned = '0' + cleaned;
    }
    if (cleaned.length > 1 && !['5', '6', '7'].includes(cleaned[1])) {
      cleaned = cleaned.substring(0, 1);
    }
    setPhone(cleaned);
  };

  const handleSaveProfile = async () => {
    if (phone.length > 0 && phone.length < 10) {
      Alert.alert('Erreur', 'Le numéro de téléphone doit contenir exactement 10 chiffres.');
      return;
    }
    await updateProfile({ name, phone_number: phone });
    Alert.alert('Succès', 'Profil mis à jour !');
    loadData();
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultPreset(id);
    loadData();
  };

  const handleDeletePreset = async (id: string) => {
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        await deletePreset(id);
        loadData();
      }}
    ]);
  };

  const openAddModal = () => {
    setModalPreset({
      preset_name: '',
      wilaya: '',
      baladia: '',
      street: '',
    });
    bottomSheetModalRef.current?.present();
  };

  const handleCaptureGPS = async () => {
    try {
      // 1. Check if location services are enabled at the OS level
      const providerStatus = await Location.getProviderStatusAsync();
      if (!providerStatus.locationServicesEnabled) {
        Alert.alert(
          'Services désactivés', 
          'La localisation est désactivée sur votre appareil. Veuillez l\'activer dans les paramètres Android.'
        );
        return;
      }

      // 2. Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission GPS refusée. Veuillez l\'activer dans les paramètres de l\'application.');
        return;
      }
      
      // 3. Capture position (Balanced accuracy is better for emulators)
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setModalPreset({
        ...modalPreset,
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
      Alert.alert('GPS Capturé', 'Position enregistrée avec succès !');
    } catch (error: any) {
      console.error(error);
      const msg = error.message?.includes('unavailable') 
        ? 'La position est indisponible. Si vous êtes sur émulateur, vous DEVEZ envoyer un point GPS via les "Extended Controls" (...) -> Location -> SEND.'
        : 'Impossible de capter votre position.';
      Alert.alert('Erreur GPS', msg);
    }
  };

  const handleSavePreset = async () => {
    if (!modalPreset.preset_name || !modalPreset.lat || !modalPreset.lng || !modalPreset.wilaya || !modalPreset.baladia) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et capturer votre position GPS.');
      return;
    }

    await addPreset({
      preset_name: modalPreset.preset_name,
      wilaya: modalPreset.wilaya,
      baladia: modalPreset.baladia,
      street: modalPreset.street || '',
      lat: modalPreset.lat,
      lng: modalPreset.lng,
      is_default: false
    });
    
    bottomSheetModalRef.current?.dismiss();
    loadData();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        
        <SurfaceCard>
          <Text style={styles.sectionTitle}>Identité</Text>
          <OasisInput 
            label="Comment vous appelez-vous ?" 
            value={name} 
            onChangeText={setName} 
            placeholder="Ex: Amine" 
          />
          <OasisInput 
            label="Numéro de téléphone" 
            value={phone} 
            onChangeText={handlePhoneChange} 
            placeholder="Ex: 0666112233" 
            keyboardType="phone-pad"
            maxLength={10}
          />
          <KineticButton title="Sauvegarder" onPress={handleSaveProfile} />
        </SurfaceCard>

        <View style={styles.addressHeader}>
          <Text style={styles.sectionTitle}>Mes Adresses</Text>
          <Pressable 
            onPress={openAddModal} 
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Plus color={Colors.primary} size={20} />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </Pressable>
        </View>

        {data.presets.map((preset) => (
          <SurfaceCard key={preset.id} style={preset.is_default ? styles.defaultCard : {}}>
            <View style={styles.presetHeader}>
              <View style={styles.presetTitleContainer}>
                <MapPin color={Colors.primary} size={20} />
                <Text style={styles.presetName}>{preset.preset_name}</Text>
              </View>
              <View style={styles.presetActions}>
                <Pressable 
                  onPress={() => handleDeletePreset(preset.id)}
                  style={({ pressed }) => [
                    pressed && { opacity: 0.6 }
                  ]}
                >
                  <Trash2 color={Colors.error} size={20} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.presetDetails}>{preset.street}</Text>
            <Text style={styles.presetSubDetails}>{preset.baladia}, {preset.wilaya}</Text>
            
            <View style={styles.radioWrapper}>
              <KineticRadio 
                label="Définir par défaut" 
                selected={preset.is_default} 
                onPress={() => handleSetDefault(preset.id)} 
              />
            </View>
          </SurfaceCard>
        ))}

        {data.presets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucune adresse enregistrée.</Text>
          </View>
        )}
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['85%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheet}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        bottomInset={insets.bottom}
      >
        <View style={[styles.modalContent, { paddingBottom: 24 }]}>
          <Text style={styles.modalTitle}>Nouvelle Adresse</Text>
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
            <OasisInput 
              bottomSheet={true}
              label="Nom de l'adresse" 
              value={modalPreset.preset_name} 
              onChangeText={(text: string) => setModalPreset({...modalPreset, preset_name: text})} 
              placeholder="Ex: Maison, Travail..." 
            />
            
            <OasisSelect
              label="Wilaya"
              placeholder="Sélectionnez une wilaya"
              value={modalPreset.wilaya}
              onPress={() => setPickerMode('wilaya')}
              disabled={regionsLoading}
            />

            <OasisSelect
              label="Commune (Baladia)"
              placeholder="Sélectionnez une commune"
              value={modalPreset.baladia}
              onPress={() => setPickerMode('baladia')}
              disabled={!modalPreset.wilaya || regionsLoading}
            />

            <OasisInput 
              bottomSheet={true}
              label="Détails exacts (Rue, N° porte...)" 
              value={modalPreset.street} 
              onChangeText={(text: string) => setModalPreset({...modalPreset, street: text})} 
              placeholder="Ex: Rue 5 Juillet, Appt 12..." 
            />
            
            <View style={styles.gpsSection}>
              {modalPreset.lat ? (
                <Text style={styles.gpsValue}>✅ Position enregistrée ({modalPreset.lat.toFixed(2)}, {modalPreset.lng?.toFixed(2)})</Text>
              ) : (
                <KineticButton 
                  title="📍 Capturer ma position actuelle" 
                  variant="secondary"
                  onPress={handleCaptureGPS} 
                  style={{marginBottom: 16}}
                />
              )}
            </View>

            <KineticButton title="Enregistrer l'adresse" onPress={handleSavePreset} />
          </BottomSheetScrollView>
        </View>
      </BottomSheetModal>

      <Modal visible={!!pickerMode} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable 
              onPress={() => setPickerMode(null)}
              style={({ pressed }) => [
                pressed && { opacity: 0.6 }
              ]}
            >
              <ChevronLeft color={Colors.onSurface} size={28} />
            </Pressable>
            <Text style={styles.modalTitleText}>
              {pickerMode === 'wilaya' ? 'Choisir une Wilaya' : 'Choisir une Commune'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <FlatList
            data={pickerMode === 'wilaya' ? wilayas : baladias}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable 
                style={({ pressed }) => [
                  styles.pickerItem,
                  pressed && { backgroundColor: Colors.surfaceContainerHigh }
                ]} 
                onPress={() => handleRegionSelect(item)}
              >
                <Text style={[
                  styles.pickerItemText,
                  ((pickerMode === 'wilaya' && item === modalPreset.wilaya) || 
                   (pickerMode === 'baladia' && item === modalPreset.baladia)) && styles.pickerItemActive
                ]}>
                  {item}
                </Text>
                {((pickerMode === 'wilaya' && item === modalPreset.wilaya) || 
                  (pickerMode === 'baladia' && item === modalPreset.baladia)) && (
                  <Check color={Colors.primary} size={20} />
                )}
              </Pressable>
            )}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  defaultCard: {
    borderColor: Colors.primaryContainer,
    borderWidth: 2,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.onSurface,
    marginLeft: 8,
  },
  presetActions: {
    flexDirection: 'row',
  },
  presetDetails: {
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  presetSubDetails: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
  },
  radioWrapper: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    paddingTop: 12,
    marginTop: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
  },
  emptyStateText: {
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    marginBottom: 20,
  },
  gpsSection: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
  },
  gpsValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surface,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  listContent: {
    padding: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  pickerItemActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
