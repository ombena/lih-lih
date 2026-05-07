import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors, OasisSelect, KineticButton, SurfaceCard } from './UIPrimitives';
import { useRegionSync } from '../hooks/useRegionSync';
import { MapPin, ChevronLeft, Check } from 'lucide-react-native';

interface LocationGateProps {
  onLocationSelected: (wilaya: string, baladia: string) => void;
}

export default function LocationGate({ onLocationSelected }: LocationGateProps) {
  const { activeRegions, isLoading } = useRegionSync();
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedBaladia, setSelectedBaladia] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<'wilaya' | 'baladia' | null>(null);

  const wilayas = Object.keys(activeRegions);
  const baladias = selectedWilaya ? activeRegions[selectedWilaya] : [];

  const handleSelect = (item: string) => {
    if (pickerMode === 'wilaya') {
      setSelectedWilaya(item);
      setSelectedBaladia(null);
    } else {
      setSelectedBaladia(item);
    }
    setPickerMode(null);
  };

  const isComplete = selectedWilaya && selectedBaladia;

  return (
    <View style={styles.container}>
      <SurfaceCard style={styles.card}>
        <View style={styles.header}>
          <MapPin color={Colors.primary} size={32} />
          <Text style={styles.title}>Où livrer ?</Text>
          <Text style={styles.subtitle}>Sélectionnez votre zone pour voir les restaurants disponibles.</Text>
        </View>

        <OasisSelect
          label="Wilaya"
          placeholder="Sélectionnez une wilaya"
          value={selectedWilaya}
          onPress={() => setPickerMode('wilaya')}
          disabled={isLoading}
        />

        <OasisSelect
          label="Commune (Baladia)"
          placeholder="Sélectionnez une commune"
          value={selectedBaladia}
          onPress={() => setPickerMode('baladia')}
          disabled={!selectedWilaya || isLoading}
        />

        <KineticButton
          title="Confirmer la zone"
          onPress={() => selectedWilaya && selectedBaladia && onLocationSelected(selectedWilaya, selectedBaladia)}
          disabled={!isComplete}
          style={styles.button}
        />
      </SurfaceCard>

      <Modal visible={!!pickerMode} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPickerMode(null)}>
              <ChevronLeft color={Colors.onSurface} size={28} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {pickerMode === 'wilaya' ? 'Choisir une Wilaya' : 'Choisir une Commune'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <FlatList
            data={pickerMode === 'wilaya' ? wilayas : baladias}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.pickerItem} 
                onPress={() => handleSelect(item)}
              >
                <Text style={[
                  styles.pickerItemText,
                  ((pickerMode === 'wilaya' && item === selectedWilaya) || 
                   (pickerMode === 'baladia' && item === selectedBaladia)) && styles.pickerItemActive
                ]}>
                  {item}
                </Text>
                {((pickerMode === 'wilaya' && item === selectedWilaya) || 
                  (pickerMode === 'baladia' && item === selectedBaladia)) && (
                  <Check color={Colors.primary} size={20} />
                )}
              </TouchableOpacity>
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
    padding: 16,
    width: '100%',
  },
  card: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.onSurface,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
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
  modalTitle: {
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
