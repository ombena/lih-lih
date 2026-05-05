import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Vibration,
  Platform
} from 'react-native';
import { X, Lock, Check, Delete } from 'lucide-react-native';
import { KineticRingLoader } from './KineticLoader';

const { width, height } = Dimensions.get('window');

interface OasisOTPInputProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (pin: string, deliveryFee: number) => void;
  isLoading: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
}

export const OasisOTPInput = ({
  isVisible,
  onClose,
  onSubmit,
  isLoading,
  error,
  title = "VÉRIFICATION COMPTOIR",
  subtitle = "Saisissez le PIN et les frais de livraison."
}: OasisOTPInputProps) => {
  const [pin, setPin] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [activeField, setActiveField] = useState<'pin' | 'fee'>('pin');

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setPin('');
      setDeliveryFee('');
      setActiveField('pin');
    }
  }, [isVisible]);

  // Premium Custom Keypad Logic (Instantaneous, no native bridge lag)
  const handleKeyPress = (key: string) => {
    // Optional: Add a tiny haptic feedback for premium feel if desired
    // if (Platform.OS === 'android') Vibration.vibrate(10);

    if (key === 'BACKSPACE') {
      if (activeField === 'pin') {
        setPin(prev => prev.slice(0, -1));
      } else {
        setDeliveryFee(prev => prev.slice(0, -1));
        // Optional: Auto-return to PIN if fee is empty and backspace is pressed
        if (deliveryFee.length === 0) setActiveField('pin');
      }
      return;
    }

    if (activeField === 'pin') {
      if (pin.length < 4) {
        const newPin = pin + key;
        setPin(newPin);
        // Premium feature: Auto-advance to Fee input once PIN is 4 digits
        if (newPin.length === 4) {
          setActiveField('fee');
        }
      }
    } else { // activeField === 'fee'
      if (deliveryFee.length < 5) { // Prevent impossibly high fees (max 99999)
        if (deliveryFee === '' && key === '0') return; // Prevent leading zeros
        setDeliveryFee(prev => prev + key);
      }
    }
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      onSubmit(pin, Number(deliveryFee) || 0);
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
              <Lock size={20} color="#ae2900" />
            </View>
            <View style={styles.headerTextContainer}>
               <Text style={styles.title}>{title}</Text>
               <Text style={styles.subtitle}>{subtitle}</Text>
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
            
            {/* PIN Group */}
            <Pressable 
              style={[styles.inputGroup, activeField === 'pin' && styles.activeInputGroup]}
              onPress={() => setActiveField('pin')}
            >
              <Text style={[styles.label, activeField === 'pin' && styles.activeLabel]}>CODE PIN</Text>
              <View style={styles.pinContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.pinDot,
                      pin.length > index && styles.pinDotFilled,
                      activeField === 'pin' && pin.length === index && styles.pinDotNext
                    ]}
                  >
                    {pin.length > index && (
                      <Text style={styles.pinChar}>{pin[index]}</Text>
                    )}
                  </View>
                ))}
              </View>
            </Pressable>

            {/* Fee Group */}
            <Pressable 
              style={[styles.inputGroup, activeField === 'fee' && styles.activeInputGroup]}
              onPress={() => setActiveField('fee')}
            >
              <Text style={[styles.label, activeField === 'fee' && styles.activeLabel]}>FRAIS (DA)</Text>
              <View style={[styles.feeBox, activeField === 'fee' && styles.feeBoxActive]}>
                <Text style={[styles.feeText, !deliveryFee && styles.feePlaceholder]}>
                  {deliveryFee ? `${deliveryFee}` : '0'}
                </Text>
              </View>
            </Pressable>

          </View>

          {/* Loading Overlay or Actions */}
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <KineticRingLoader size={40} />
              <Text style={styles.loaderText}>VÉRIFICATION SÉCURISÉE...</Text>
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
                  (pin.length < 4 || !deliveryFee) && styles.submitButtonDisabled,
                  pressed && styles.submitButtonPressed
                ]}
                disabled={pin.length < 4 || !deliveryFee}
              >
                <Check color={pin.length < 4 || !deliveryFee ? "#555" : "#FFF"} size={20} style={{ marginRight: 8 }} />
                <Text style={[
                  styles.submitText,
                  (pin.length < 4 || !deliveryFee) && styles.submitTextDisabled
                ]}>
                  VALIDER LA RÉCUPÉRATION
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
    justifyContent: 'flex-end', // Aligns modal to bottom for premium thumb reach
  },
  modalBody: {
    backgroundColor: '#1a1c1d',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40, // Increased bottom padding to lift the button
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
    backgroundColor: 'rgba(174, 41, 0, 0.1)',
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
  inputGroup: {
    width: '100%',
    backgroundColor: '#121415',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2c2f30',
    alignItems: 'center',
  },
  activeInputGroup: {
    borderColor: '#ae2900',
    backgroundColor: 'rgba(174, 41, 0, 0.03)',
  },
  label: {
    color: '#595c5d',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  activeLabel: {
    color: '#ff7855',
  },
  pinContainer: {
    flexDirection: 'row',
    gap: 12, // Increased gap for wider layout
  },
  pinDot: {
    width: 44, // Increased width
    height: 56, // Increased height
    borderRadius: 12,
    backgroundColor: '#1a1c1d',
    borderWidth: 1,
    borderColor: '#2c2f30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotFilled: {
    borderColor: '#ff7855',
    backgroundColor: '#ae2900',
  },
  pinDotNext: {
    borderColor: '#ae2900',
    borderWidth: 2,
  },
  pinChar: {
    color: '#FFF',
    fontSize: 24, // Larger font
    fontWeight: '900',
  },
  feeBox: {
    width: '100%',
    height: 56, // Fixed larger height to match PIN dots
    justifyContent: 'center',
    alignItems: 'center',
  },
  feeBoxActive: {
    // Optional additional styling for active fee box
  },
  feeText: {
    color: '#FFF',
    fontSize: 32, // Much larger and clearer text for fee
    fontWeight: '900',
  },
  feePlaceholder: {
    color: '#595c5d',
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
    height: 240, // Match keypad height approx
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loaderText: {
    color: '#ae2900',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  submitButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#ae2900',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#ae2900',
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