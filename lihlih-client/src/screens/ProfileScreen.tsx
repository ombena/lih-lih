import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import * as Clipboard from 'expo-clipboard';
import { MapPin, Trash2, Edit2, Plus } from 'lucide-react-native';
import { SurfaceCard, OasisInput, KineticButton, KineticRadio, Colors } from '../components/UIPrimitives';
import { getClientData, saveClientData, updateProfile, addPreset, updatePreset, deletePreset, setDefaultPreset, ClientData, Preset } from '../services/storageService';

export default function ProfileScreen() {
  const [data, setData] = useState<ClientData>({ profile: { name: '', phone_number: '' }, presets: [] });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const insets = useSafeAreaInsets();
  
  // Modal State
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [modalPreset, setModalPreset] = useState<Partial<Preset>>({});
  const [manualGps, setManualGps] = useState('');
  
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
    // Keep only numbers
    let cleaned = text.replace(/[^0-9]/g, '');
    
    // First digit must be 0
    if (cleaned.length > 0 && cleaned[0] !== '0') {
      cleaned = '0' + cleaned;
    }
    
    // Second digit must be 5, 6, or 7
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
      wilaya: 'Laghouat', // Default or could be empty
      baladia: 'Hassi Bahbah',
      street: '',
    });
    setManualGps('');
    bottomSheetModalRef.current?.present();
  };

  const handlePasteGPS = async () => {
    const text = await Clipboard.getStringAsync();
    setManualGps(text);
    
    // Parse Google Maps URLs with @lat,lng
    const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      setModalPreset(prev => ({ ...prev, lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }));
      return;
    }
    
    // Parse Google Maps URLs with ?q=lat,lng
    const qMatch = text.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      setModalPreset(prev => ({ ...prev, lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }));
      return;
    }
    
    // Parse raw coordinates like "33.1234, 4.1234"
    const rawMatch = text.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
    if (rawMatch) {
      setModalPreset(prev => ({ ...prev, lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) }));
      return;
    }
    
    Alert.alert('Erreur', 'Aucune coordonnée valide trouvée dans le presse-papiers.');
  };

  const handleCaptureGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erreur', 'Permission GPS refusée');
      return;
    }
    
    let location = await Location.getCurrentPositionAsync({});
    setModalPreset({
      ...modalPreset,
      lat: location.coords.latitude,
      lng: location.coords.longitude
    });
    Alert.alert('GPS Capturé', 'Vos coordonnées ont été enregistrées.');
  };

  const handleSavePreset = async () => {
    if (!modalPreset.preset_name || !modalPreset.lat || !modalPreset.lng) {
      Alert.alert('Erreur', 'Veuillez remplir le nom et capturer votre position GPS.');
      return;
    }

    const newPreset: Preset = {
      id: Crypto.randomUUID(),
      preset_name: modalPreset.preset_name,
      wilaya: modalPreset.wilaya || 'Laghouat',
      baladia: modalPreset.baladia || 'Hassi Bahbah',
      street: modalPreset.street || '',
      lat: modalPreset.lat,
      lng: modalPreset.lng,
      is_default: false
    };

    await addPreset(newPreset);
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
            <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
              <Plus color={Colors.primary} size={20} />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {data.presets.map((preset) => (
            <SurfaceCard key={preset.id} style={preset.is_default ? styles.defaultCard : {}}>
              <View style={styles.presetHeader}>
                <View style={styles.presetTitleContainer}>
                  <MapPin color={Colors.primary} size={20} />
                  <Text style={styles.presetName}>{preset.preset_name}</Text>
                </View>
                <View style={styles.presetActions}>
                  <TouchableOpacity onPress={() => handleDeletePreset(preset.id)}>
                    <Trash2 color={Colors.error} size={20} />
                  </TouchableOpacity>
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
          snapPoints={['80%']}
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
              <OasisInput 
                bottomSheet={true}
                label="Wilaya" 
                value={modalPreset.wilaya} 
                onChangeText={(text: string) => setModalPreset({...modalPreset, wilaya: text})} 
                placeholder="Ex: Laghouat" 
              />
              <OasisInput 
                bottomSheet={true}
                label="Baladia" 
                value={modalPreset.baladia} 
                onChangeText={(text: string) => setModalPreset({...modalPreset, baladia: text})} 
                placeholder="Ex: Hassi Bahbah" 
              />
              <OasisInput 
                bottomSheet={true}
                label="Détails exacts" 
                value={modalPreset.street} 
                onChangeText={(text: string) => setModalPreset({...modalPreset, street: text})} 
                placeholder="Ex: À côté de la mosquée..." 
              />
              
              <View style={styles.gpsSection}>
                <View style={styles.pasteRow}>
                  <View style={{ flex: 1 }}>
                    <OasisInput 
                      bottomSheet={true}
                      label="Coordonnées manuelles" 
                      value={manualGps} 
                      onChangeText={setManualGps} 
                      placeholder="Ex: 33.801, 2.846" 
                    />
                  </View>
                  <TouchableOpacity style={styles.pasteButton} onPress={handlePasteGPS}>
                    <Text style={styles.pasteButtonText}>📋 Coller</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.orDivider}>- OU -</Text>

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
  gpsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  gpsValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  orDivider: {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pasteRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  pasteButton: {
    backgroundColor: '#ddddf9',
    height: 52, // Match input height roughly
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pasteButtonText: {
    color: '#4d4e65',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
