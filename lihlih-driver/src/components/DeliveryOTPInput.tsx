import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform
} from 'react-native';
import { X, Lock, Check, Delete } from 'lucide-react-native';
import { KineticRingLoader } from './KineticLoader';

interface DeliveryOTPInputProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  isLoading: boolean;
  error?: string | null;
  grandTotal: number;
}

export const DeliveryOTPInput = ({
  isVisible,
  onClose,
  onSubmit,
  isLoading,
  error,
  grandTotal
}: DeliveryOTPInputProps) => {
  const [pin, setPin] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setPin('');
    }
  }, [isVisible]);

  // Premium Custom Keypad Logic
  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      setPin(prev => prev.slice(0, -1));
      return;
    }

    if (pin.length < 4) {
      setPin(pin + key);
    }
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      onSubmit(pin);
    }
  };

  // The Custom Keypad Layout
  const keypadLayout = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'BACKSPACE']
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Prevent closing when tapping inside the modal body */}
        <Pressable style={styles.modalBody} onPress={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Lock size={20} color="#00C853" />
            </View>
            <View style={styles.headerTextContainer}>
               <Text style={styles.title}>Validation Client</Text>
               <Text style={styles.subtitle}>Saisissez le PIN fourni par le client</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={16} color="#FFF" />
            </Pressable>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Premium Input Display Area (Stacked Vertically) */}
          <View style={styles.inputsColumn}>
            
            {/* Grand Total Display (Read-Only) */}
            <View style={styles.totalGroup}>
              <Text style={styles.labelTotal}>À ENCAISSER</Text>
              <Text style={styles.totalValue}>{grandTotal} DA</Text>
            </View>

            {/* PIN Group */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CODE PIN CLIENT</Text>
              <View style={styles.pinContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.pinDot,
                      pin.length > index && styles.pinDotFilled,
                      pin.length === index && styles.pinDotNext
                    ]}
                  >
                    {pin.length > index && (
                      <Text style={styles.pinChar}>{pin[index]}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

          </View>

          {/* Loading Overlay or Actions */}
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <KineticRingLoader size={40} />
              <Text style={styles.loaderText}>CLÔTURE DE LA MISSION...</Text>
            </View>
          ) : (
            <>
              {/* Custom Integrated Keypad */}
              <View style={styles.keypadContainer}>
                {keypadLayout.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keypadRow}>
                    {row.map((key, keyIndex) => {
                      if (key === '') return <View key={keyIndex} style={styles.keypadKey} />;
                      
                      return (
                        <Pressable
                          key={keyIndex}
                          onPress={() => handleKeyPress(key)}
                          style={({ pressed }) => [
                            styles.keypadKey,
                            pressed && styles.keypadKeyPressed
                          ]}
                        >
                          {key === 'BACKSPACE' ? (
                            <Delete color="#abadae" size={24} />
                          ) : (
                            <Text style={styles.keypadText}>{key}</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  pin.length < 4 && styles.submitButtonDisabled,
                  pressed && styles.submitButtonPressed
                ]}
                disabled={pin.length < 4}
              >
                <Check color={pin.length < 4 ? "#555" : "#FFF"} size={20} style={{ marginRight: 8 }} />
                <Text style={[
                  styles.submitText,
                  pin.length < 4 && styles.submitTextDisabled
                ]}>
                  CONFIRMER LA LIVRAISON
                </Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalBody: {
    backgroundColor: '#1a1c1d',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    borderTopWidth: 1,
    borderColor: '#2c2f30',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2c2f30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#abadae',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  inputsColumn: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  totalGroup: {
    width: '100%',
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00C853',
    alignItems: 'center',
  },
  labelTotal: {
    color: '#00C853',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  totalValue: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
  },
  inputGroup: {
    width: '100%',
    backgroundColor: '#121415',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00C853',
    alignItems: 'center',
  },
  label: {
    color: '#00C853',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  pinContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  pinDot: {
    width: 44,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1a1c1d',
    borderWidth: 1,
    borderColor: '#2c2f30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotFilled: {
    borderColor: '#00C853',
    backgroundColor: '#00C853',
  },
  pinDotNext: {
    borderColor: '#00C853',
    borderWidth: 2,
  },
  pinChar: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  keypadContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  keypadKey: {
    flex: 1,
    height: 56,
    backgroundColor: '#2c2f30',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadKeyPressed: {
    backgroundColor: '#595c5d',
    transform: [{ scale: 0.95 }],
  },
  keypadText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  loaderContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loaderText: {
    color: '#00C853',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  submitButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#00C853',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#2c2f30',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  submitTextDisabled: {
    color: '#555',
  },
});
