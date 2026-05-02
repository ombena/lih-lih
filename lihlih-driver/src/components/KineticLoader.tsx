import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  withDelay, 
  Easing 
} from 'react-native-reanimated';
import { Colors } from './UIPrimitives';

// 1. SONAR PULSE (Radar Radar)
export const OasisPulse = ({ 
  size = 60, 
  color = Colors.primary,
  isActive = true 
}: { 
  size?: number; 
  color?: string;
  isActive?: boolean;
}) => {
  const ripple1Scale = useSharedValue(0.5);
  const ripple1Opacity = useSharedValue(isActive ? 1 : 0);
  const ripple2Scale = useSharedValue(0.5);
  const ripple2Opacity = useSharedValue(isActive ? 1 : 0);
  const coreScale = useSharedValue(0.8);

  const activeColor = isActive ? color : '#2c2f30';

  React.useEffect(() => {
    if (isActive) {
      // Reset ripples to start state
      ripple1Scale.value = 0.5;
      ripple1Opacity.value = 1;
      ripple2Scale.value = 0.5;
      ripple2Opacity.value = 1;

      // Core heartbeat
      coreScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 750, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 750, easing: Easing.inOut(Easing.ease) })
        ), -1, true
      );

      // Ripple 1
      ripple1Scale.value = withRepeat(
        withTiming(3.5, { duration: 2500, easing: Easing.out(Easing.quad) }), 
        -1, false
      );
      ripple1Opacity.value = withRepeat(
        withTiming(0, { duration: 2500, easing: Easing.out(Easing.quad) }), 
        -1, false
      );
      
      // Ripple 2 (Delayed)
      ripple2Scale.value = withDelay(1250, 
        withRepeat(withTiming(3.5, { duration: 2500, easing: Easing.out(Easing.quad) }), -1, false)
      );
      ripple2Opacity.value = withDelay(1250, 
        withRepeat(withTiming(0, { duration: 2500, easing: Easing.out(Easing.quad) }), -1, false)
      );
    } else {
      // Stop and hide
      coreScale.value = 0.8;
      ripple1Scale.value = 0.5;
      ripple1Opacity.value = 0;
      ripple2Scale.value = 0.5;
      ripple2Opacity.value = 0;
    }
  }, [isActive]);

  const animCore = useAnimatedStyle(() => ({ transform: [{ scale: coreScale.value }] }));
  const animRipple1 = useAnimatedStyle(() => ({ 
    transform: [{ scale: ripple1Scale.value }], 
    opacity: ripple1Opacity.value 
  }));
  const animRipple2 = useAnimatedStyle(() => ({ 
    transform: [{ scale: ripple2Scale.value }], 
    opacity: ripple2Opacity.value 
  }));

  return (
    <View style={[styles.pulseContainer, { width: size, height: size }]}>
      <Animated.View style={[
        styles.pulseRing, 
        { borderColor: activeColor, backgroundColor: activeColor + '10', width: size, height: size, borderRadius: size/2 }, 
        animRipple1
      ]} />
      <Animated.View style={[
        styles.pulseRing, 
        { borderColor: activeColor, backgroundColor: activeColor + '10', width: size, height: size, borderRadius: size/2 }, 
        animRipple2
      ]} />
      <Animated.View style={[styles.pulseCenter, { backgroundColor: activeColor }, animCore]} />
    </View>
  );
};

// 2. KINETIC RING (Spinning Loader)
export const KineticRingLoader = ({ size = 40, color = Colors.primary }: { size?: number; color?: string }) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.bezier(0.6, 0.1, 0.4, 0.9) }), 
      -1, false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <View style={{ width: size, height: size }}>
      <View style={[StyleSheet.absoluteFill, styles.ringBg]} />
      <Animated.View style={[
        StyleSheet.absoluteFill, 
        styles.ringActive, 
        { borderTopColor: color, borderRightColor: Colors.primaryContainer }, 
        animStyle
      ]} />
    </View>
  );
};

// 3. OVERLAY COMPONENT
export const OasisLoadingOverlay = () => (
  <View style={styles.loadingOverlay} />
);

const styles = StyleSheet.create({
  pulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  pulseCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ringBg: {
    borderRadius: 999,
    borderWidth: 4,
    borderColor: Colors.surfaceContainerLow,
  },
  ringActive: {
    borderRadius: 999,
    borderWidth: 4,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 20, 21, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 40,
    letterSpacing: 2,
  }
});
