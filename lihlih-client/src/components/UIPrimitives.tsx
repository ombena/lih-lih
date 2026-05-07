import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, Pressable } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ShoppingBag, ChefHat, Bike, CheckCircle2 } from 'lucide-react-native';

const Colors = {
  primary: '#ae2900',
  primaryContainer: '#ff7855',
  onPrimary: '#ffffff',
  surface: '#ffffff',
  surfaceContainerLow: '#f5f6f7',
  surfaceContainerHigh: '#e0e3e4',
  onSurface: '#2c2f30',
  onSurfaceVariant: '#595c5d',
  outline: '#757778',
  background: '#f5f6f7',
  error: '#b31b25',
  secondary: '#FFB800', // Gold/Yellow for badges & highlights
  success: '#228B22',
};

export const SurfaceCard = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.surfaceCard, style]}>
    {children}
  </View>
);

export const OasisInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default',
  bottomSheet = false,
  maxLength,
  leftIcon,
  style
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const InputComponent = bottomSheet ? BottomSheetTextInput : TextInput;
  
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[
        styles.inputWrapper, 
        isFocused && styles.inputFocused,
        leftIcon && { paddingLeft: 12 }
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <InputComponent
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
};

export const OasisTextArea = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  bottomSheet = false,
  numberOfLines = 4
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const InputComponent = bottomSheet ? BottomSheetTextInput : TextInput;
  
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <InputComponent
        style={[styles.input, styles.textArea, isFocused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.outline}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

export const OasisSelect = ({ 
  label, 
  value, 
  onPress, 
  placeholder, 
  icon,
  style,
  disabled
}: any) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <Pressable 
        style={({ pressed }) => [
          styles.inputWrapper, 
          disabled && { opacity: 0.5, backgroundColor: Colors.surfaceContainerHigh },
          pressed && { opacity: 0.7 }
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.selectContent}>
          {icon && <View style={styles.leftIcon}>{icon}</View>}
          <Text style={[
            styles.selectText, 
            !value && { color: Colors.outline }
          ]}>
            {value || placeholder}
          </Text>
        </View>
        <View style={styles.chevron}>
          <Text style={{ color: Colors.outline }}>▼</Text>
        </View>
      </Pressable>
    </View>
  );
};

export const KineticButton = ({ 
  title, 
  onPress, 
  icon, 
  variant = 'primary',
  style,
  disabled
}: { 
  title: string; 
  onPress: () => void; 
  icon?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  disabled?: boolean;
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary': return styles.buttonPrimary;
      case 'secondary': return styles.buttonSecondary;
      case 'outline': return styles.buttonOutline;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary': return styles.buttonTextPrimary;
      case 'secondary': return styles.buttonTextSecondary;
      case 'outline': return styles.buttonTextOutline;
    }
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.button, 
        getButtonStyle(), 
        style,
        disabled && { opacity: 0.5, backgroundColor: Colors.surfaceContainerHigh },
        pressed && { opacity: 0.8 }
      ]} 
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.buttonText, getTextStyle(), disabled && { color: Colors.outline }]}>{title}</Text>
    </Pressable>
  );
};

export const KineticRadio = ({ 
  selected, 
  onPress, 
  label 
}: { 
  selected: boolean; 
  onPress: () => void; 
  label: string;
}) => (
  <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.radioContainer, 
        pressed && { opacity: 0.7 }
      ]}
    >
    <View style={[styles.radioCircle, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioInnerCircle} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </Pressable>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Pending': return '#595c5d';
      case 'Preparing': return '#ae2900';
      case 'Waiting': return '#ffa600ff';
      case 'Accepted_by_Driver': return '#2c2f30';
      case 'Picked_Up': return '#ae2900';
      case 'Arriving': return '#ae2900';
      case 'Delivered': return Colors.success;
      case 'Archived': return '#595c5d';
      default: return '#595c5d';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'Pending': return 'En attente';
      case 'Preparing': return 'Préparation';
      case 'Waiting': return 'Prêt';
      case 'Accepted_by_Driver': return 'Livreur affecté';
      case 'Picked_Up': return 'En cours';
      case 'Arriving': return 'Arrive bientôt';
      case 'Delivered': return 'Livré';
      case 'Archived': return 'Archivé';
      default: return status;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() + '15' }]}>
      <View style={[styles.badgeDot, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.badgeText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
    </View>
  );
};

export const OrderJourneyTimeline = ({ status }: { status: string }) => {
  const steps = [
    { key: 'placed', label: 'Commande Reçue', statuses: ['Pending'], icon: ShoppingBag },
    { key: 'preparing', label: 'En Préparation', statuses: ['Preparing', 'Waiting'], icon: ChefHat },
    { key: 'transit', label: 'En Livraison', statuses: ['Accepted_by_Driver', 'Picked_Up', 'Arriving'], icon: Bike },
    { key: 'done', label: 'Commande Livrée', statuses: ['Delivered'], icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(step => step.statuses.includes(status));
  const activeIndex = currentStepIndex === -1 && status === 'Delivered' ? 3 : currentStepIndex;
  const currentLabel = steps[activeIndex]?.label || 'Suivi de commande';

  return (
    <View style={styles.timelineWrapper}>
      <Text style={styles.currentStatusTitle}>{currentLabel}</Text>
      
      <View style={styles.timelineContainer}>
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isDelivered = status === 'Delivered';
          const Icon = step.icon;
          const color = (isCompleted || isActive) 
            ? (isDelivered ? Colors.success : Colors.primary) 
            : Colors.surfaceContainerHigh;
          
          return (
            <React.Fragment key={step.key}>
              <View style={styles.timelineStep}>
                <View style={[
                  styles.iconWrapper,
                  (isCompleted || isActive) && (status === 'Delivered' ? styles.iconWrapperSuccess : styles.iconWrapperActive)
                ]}>
                  <Icon size={20} color={color} strokeWidth={isActive ? 2.5 : 2} />
                </View>
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  index < activeIndex && (status === 'Delivered' ? styles.timelineLineSuccess : styles.timelineLineCompleted)
                ]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  surfaceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.surfaceContainerHigh, // Muted border
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.onSurface,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  leftIcon: {
    marginRight: -4,
  },
  selectContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    fontSize: 16,
    color: Colors.onSurface,
  },
  chevron: {
    paddingRight: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextPrimary: {
    color: Colors.onPrimary,
  },
  buttonTextSecondary: {
    color: Colors.onSurface,
  },
  buttonTextOutline: {
    color: Colors.primary,
  },
  iconContainer: {
    marginRight: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  timelineWrapper: {
    marginVertical: 10,
    alignItems: 'center',
  },
  currentStatusTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.onSurface,
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  timelineStep: {
    alignItems: 'center',
    zIndex: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconWrapperSuccess: {
    borderColor: Colors.success,
    backgroundColor: Colors.surface,
    elevation: 4,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  timelineLine: {
    height: 3,
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginHorizontal: -5,
    zIndex: 1,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.primary,
  },
  timelineLineSuccess: {
    backgroundColor: Colors.success,
  }
});

export { Colors };
