import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, PanResponder, Dimensions } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, useAnimatedProps, withRepeat, withDelay } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ShoppingBag, ChefHat, Bike, CheckCircle2 } from 'lucide-react-native';

const Colors = {
  primary: '#ae2900',
  primaryContainer: '#ff7855',
  onPrimary: '#ffffff',
  surface: '#1a1c1d',
  surfaceContainerLow: '#121415',
  surfaceContainerHigh: '#2c2f30',
  onSurface: '#ffffff',
  onSurfaceVariant: '#abadae',
  outline: '#2c2f30',
  outlineVariant: '#3c3f41',
  background: '#121415',
  error: '#b31b25',
  secondary: '#FFB800', 
  success: '#228B22',
  onSuccess: '#ffffff',
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
        { opacity: pressed && !disabled ? 0.8 : (disabled ? 0.5 : 1) }
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
    style={({ pressed }) => [styles.radioContainer, { opacity: pressed ? 0.7 : 1 }]} 
    onPress={onPress}
  >
    <View style={[styles.radioCircle, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioInnerCircle} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </Pressable>
);

export const KineticSwitch = ({ 
  value, 
  onValueChange, 
  labelOnline = "EN LIGNE", 
  labelOffline = "HORS LIGNE" 
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
  labelOnline?: string;
  labelOffline?: string;
}) => {
  const progress = useSharedValue(value ? 1 : 0);
  const containerWidth = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 250 });
  }, [value]);

  const thumbStyle = useAnimatedStyle(() => {
    const maxTranslate = containerWidth.value > 0 ? containerWidth.value - 12 - 58 : 0;
    return {
      transform: [{ translateX: progress.value * maxTranslate }],
    };
  });

  return (
    <Pressable 
      onPress={() => onValueChange(!value)}
      onLayout={(e) => { containerWidth.value = e.nativeEvent.layout.width; }}
      style={({ pressed }) => [
        styles.switchContainer,
        value ? styles.switchContainerActive : styles.switchContainerInactive,
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <View style={styles.switchTextContainer}>
        <Text style={[
          styles.switchText,
          value ? styles.switchTextActive : styles.switchTextInactive
        ]}>
          {value ? labelOnline : labelOffline}
        </Text>
      </View>
      <Animated.View style={[styles.switchThumb, thumbStyle, { backgroundColor: value ? '#FFF' : '#2c2f30' }]}>
        <View style={[styles.switchDot, { backgroundColor: value ? Colors.success : '#595c5d' }]} />
      </Animated.View>
    </Pressable>
  );
};

export const KineticSlider = ({ 
  min = 1, 
  max = 10, 
  step = 0.5, 
  value, 
  onValueChange 
}: {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onValueChange: (val: number) => void;
}) => {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const x = useSharedValue(0);
  const startX = useSharedValue(0);
  const isPressed = useSharedValue(false);
  const displayValue = useSharedValue(value);

  // Sync internal position when value changes externally
  React.useEffect(() => {
    if (containerWidth > 0 && !isPressed.value) {
      const progress = (value - min) / (max - min);
      x.value = progress * containerWidth;
      displayValue.value = value;
    }
  }, [value, containerWidth]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
      startX.value = x.value;
    })
    .onUpdate((e) => {
      if (containerWidth === 0) return;
      
      // Smooth continuous movement
      const newX = Math.max(0, Math.min(containerWidth, startX.value + e.translationX));
      x.value = newX;
      
      // Calculate display value (for the label)
      const progress = newX / containerWidth;
      const rawValue = min + progress * (max - min);
      displayValue.value = Math.round(rawValue / step) * step;
    })
    .onFinalize(() => {
      isPressed.value = false;
      const progress = x.value / containerWidth;
      const rawValue = min + progress * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      
      // Update UI state only at the end to keep it smooth
      runOnJS(onValueChange)(steppedValue);
      
      // Snap knob to the exact step position visually
      const finalProgress = (steppedValue - min) / (max - min);
      x.value = withTiming(finalProgress * containerWidth);
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value - 14 },
      { scale: withTiming(isPressed.value ? 1.3 : 1) }
    ],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: x.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isPressed.value ? 1 : 0),
    transform: [
      { translateY: withTiming(isPressed.value ? -45 : -20) },
      { translateX: x.value - 30 },
      { scale: withTiming(isPressed.value ? 1 : 0.5) }
    ],
  }));

  // Create a reactive text component for the label
  const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
  const animatedProps = useAnimatedProps(() => ({
    text: `${displayValue.value.toFixed(1)} km`,
  } as any));

  return (
    <View style={{ height: 60, justifyContent: 'flex-end', paddingBottom: 10 }}>
      <GestureDetector gesture={pan}>
        <View 
          style={styles.sliderContainer}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {/* Animated Value Label */}
          <Animated.View style={[styles.sliderLabel, labelStyle]}>
            <AnimatedTextInput
              underlineColorAndroid="transparent"
              editable={false}
              style={styles.sliderLabelText}
              animatedProps={animatedProps}
            />
            <View style={styles.sliderLabelArrow} />
          </Animated.View>

          <View style={styles.sliderTrack}>
            <Animated.View style={[styles.sliderFill, fillStyle]} />
          </View>
          <Animated.View style={[styles.sliderKnob, knobStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Pending': return '#595c5d';
      case 'Preparing': return '#ae2900';
      case 'Waiting': return '#ffa600ff';
      case 'Accepted_by_Driver': return '#2c2f30';
      case 'Picked_Up': return '#ae2900';
      case 'Arriving': return '#ae2900';
      case 'Delivered': return '#228B22';
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
          const Icon = step.icon;
          const color = (isCompleted || isActive) ? Colors.primary : Colors.surfaceContainerHigh;
          
          return (
            <React.Fragment key={step.key}>
              <View style={styles.timelineStep}>
                <View style={[
                  styles.iconWrapper,
                  (isCompleted || isActive) && styles.iconWrapperActive
                ]}>
                  <Icon size={20} color={color} strokeWidth={isActive ? 2.5 : 2} />
                </View>
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  index < activeIndex && styles.timelineLineCompleted
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
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.outline,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    height: 56,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceContainerLow,
  },
  leftIcon: {
    marginRight: -4,
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
  switchContainer: {
    width: '100%',
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  switchContainerActive: {
    backgroundColor: Colors.success,
  },
  switchContainerInactive: {
    backgroundColor: '#1a1c1d',
  },
  switchThumb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'absolute',
    left: 6,
    zIndex: 2,
  },
  switchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  switchTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  switchText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  switchTextActive: {
    color: Colors.onSuccess,
  },
  switchTextInactive: {
    color: '#abadae',
  },
  sliderContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#2c2f30',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.primaryContainer,
  },
  sliderKnob: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  sliderLabel: {
    position: 'absolute',
    width: 60,
    height: 30,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sliderLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  sliderLabelArrow: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
  },

});

export { Colors };
