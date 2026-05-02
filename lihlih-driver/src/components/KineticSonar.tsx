import React, { useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { distance, bearing, point } from '@turf/turf';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  useAnimatedProps,
  Easing,
  useDerivedValue,
  SharedValue
} from 'react-native-reanimated';
import { Colors } from './UIPrimitives';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const { width } = Dimensions.get('window');
const RADAR_SIZE = width - 60;
const CENTER = RADAR_SIZE / 2;
const TOTAL_RADAR_M = 10000; // 10km physical limit

export interface KineticSonarRef {
  triggerPing: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  recenter: () => void;
}

interface StoreNode {
  id: number;
  name: string;
  lat: number;
  lng: number;
  active_orders: number;
}

interface KineticSonarProps {
  driverLocation: { lat: number; lng: number };
  stores: StoreNode[];
  onNodePress: (store: StoreNode) => void;
  selectedStoreId?: number;
}

// ---------------------------------------------------------
// 1. INDIVIDUAL STORE NODE (Handles pulsing & selection)
// ---------------------------------------------------------
const SonarNode = ({ 
  x, y, orders, isSelected, onPress 
}: { 
  x: SharedValue<number>; y: SharedValue<number>; orders: number; isSelected: boolean; onPress: () => void;
}) => {
  const isHot = orders >= 5;
  const isWarm = orders >= 2 && orders < 5;
  const color = isHot ? Colors.primary : isWarm ? Colors.primaryContainer : Colors.outlineVariant;
  const baseRadius = isHot ? 10 : isWarm ? 7 : 5;

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isHot || isWarm) {
      pulseScale.value = withRepeat(withTiming(isHot ? 2.5 : 1.8, { duration: isHot ? 2000 : 3000, easing: Easing.out(Easing.quad) }), -1, false);
      pulseOpacity.value = withRepeat(withTiming(0, { duration: isHot ? 2000 : 3000 }), -1, false);
    }
    if (isSelected) {
      rotation.value = withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false);
    } else {
      rotation.value = 0;
    }
  }, [isHot, isWarm, isSelected]);

  const animatedPulseProps = useAnimatedProps(() => ({
    cx: x.value, cy: y.value, r: baseRadius * pulseScale.value, opacity: pulseOpacity.value
  }));

  const animatedCoreProps = useAnimatedProps(() => ({
    cx: x.value, cy: y.value, r: baseRadius
  }));

  const animatedSelectionProps = useAnimatedProps(() => ({
    // Perfect transform-origin simulation for SVG
    transform: [
      { translateX: x.value }, { translateY: y.value },
      { rotate: `${rotation.value}deg` },
      { translateX: -x.value }, { translateY: -y.value },
    ],
  }));

  const animatedSelectionCircleProps = useAnimatedProps(() => ({
    cx: x.value, cy: y.value,
  }));

  return (
    <G onPress={onPress}>
      {isSelected && (
        <AnimatedG animatedProps={animatedSelectionProps}>
          <AnimatedCircle animatedProps={animatedSelectionCircleProps} r={baseRadius + 8} stroke="#FFFFFF" strokeWidth={2} strokeDasharray="2, 4" fill="none" />
        </AnimatedG>
      )}
      {(isHot || isWarm) && <AnimatedCircle fill={color} animatedProps={animatedPulseProps} />}
      <AnimatedCircle fill={color} animatedProps={animatedCoreProps} />
      {isHot && <AnimatedCircle animatedProps={animatedSelectionCircleProps} r={baseRadius / 2.5} fill="#FFFFFF" />}
    </G>
  );
};


// ---------------------------------------------------------
// 2. CALCULATED NODE (Converts GPS to X/Y based on Zoom)
// ---------------------------------------------------------
const CalculatedNode = ({ store, driverLocation, currentRadius, isSelected, onNodePress }: any) => {
  const { distMeters, angleRad } = useMemo(() => {
    const from = point([driverLocation.lng, driverLocation.lat]);
    const to = point([store.lng, store.lat]);
    return {
      distMeters: distance(from, to, { units: 'meters' }),
      angleRad: (bearing(from, to) - 90) * (Math.PI / 180)
    };
  }, [driverLocation, store]);

  // FIX: Removed the clamp! Now nodes accurately render off-screen if they are far away.
  const x = useDerivedValue(() => {
    const screenRadius = (distMeters / currentRadius.value) * (CENTER - 10);
    return CENTER + screenRadius * Math.cos(angleRad);
  });

  const y = useDerivedValue(() => {
    const screenRadius = (distMeters / currentRadius.value) * (CENTER - 10);
    return CENTER + screenRadius * Math.sin(angleRad);
  });

  return <SonarNode x={x} y={y} orders={store.active_orders} isSelected={isSelected} onPress={() => onNodePress(store)} />;
};


// ---------------------------------------------------------
// 3. MAIN RADAR COMPONENT (With Pan & Zoom)
// ---------------------------------------------------------
const KineticSonar = forwardRef<KineticSonarRef, KineticSonarProps>((
  { driverLocation, stores, onNodePress, selectedStoreId }, ref
) => {
  // Animation States
  const pingRadius = useSharedValue(0);
  const pingOpacity = useSharedValue(0);
  
  // Camera States
  const currentRadius = useSharedValue(2000); // Start showing 2km
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  // Expose Controls to Parent (For UI Buttons)
  useImperativeHandle(ref, () => ({
    triggerPing: () => {
      pingRadius.value = 0;
      pingOpacity.value = 0.8;
      const maxR = (TOTAL_RADAR_M / currentRadius.value) * (CENTER - 10);
      pingRadius.value = withTiming(maxR, { duration: 1500, easing: Easing.bezier(0.1, 0.8, 0.2, 1) });
      pingOpacity.value = withTiming(0, { duration: 1500 });
    },
    zoomIn: () => {
      if (currentRadius.value > 500) currentRadius.value = withTiming(currentRadius.value - 500);
    },
    zoomOut: () => {
      if (currentRadius.value < 10000) currentRadius.value = withTiming(currentRadius.value + 500);
    },
    recenter: () => {
      panX.value = withTiming(0);
      panY.value = withTiming(0);
    }
  }));

  // Panning Gesture (Drag to look around)
  const panGesture = useMemo(() => 
    Gesture.Pan()
      .onStart(() => {
        offsetX.value = panX.value;
        offsetY.value = panY.value;
      })
      .onUpdate((e) => {
        panX.value = offsetX.value + e.translationX;
        panY.value = offsetY.value + e.translationY;
      }), 
  []);

  // Moves the entire SVG content when dragging
  const animatedCameraProps = useAnimatedProps(() => ({
    transform: [{ translateX: panX.value }, { translateY: panY.value }]
  }));

  const animatedPingProps = useAnimatedProps(() => ({
    r: pingRadius.value,
    opacity: pingOpacity.value
  }));

  // Dynamic Crosshairs reaching the 10km edge
  const animatedCrosshairProps = useAnimatedProps(() => {
    const maxR = (TOTAL_RADAR_M / currentRadius.value) * (CENTER - 10);
    return {
      x1: CENTER, y1: CENTER - maxR, x2: CENTER, y2: CENTER + maxR
    };
  });
  const animatedCrosshairHProps = useAnimatedProps(() => {
    const maxR = (TOTAL_RADAR_M / currentRadius.value) * (CENTER - 10);
    return {
      x1: CENTER - maxR, y1: CENTER, x2: CENTER + maxR, y2: CENTER
    };
  });

  // Pre-generate 1km intervals up to 10km
  const RINGS = Array.from({ length: 10 }, (_, i) => (i + 1) * 1000);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={styles.radarWrapper}>
        <Svg width={RADAR_SIZE} height={RADAR_SIZE} style={styles.svg}>
          
          {/* CAMERA WRAPPER: Moves everything when dragged */}
          <AnimatedG animatedProps={animatedCameraProps}>
            
            {/* Draw 1km Rings out to 10km dynamically */}
            {RINGS.map((dist) => {
              const animatedRingProps = useAnimatedProps(() => {
                const r = (dist / currentRadius.value) * (CENTER - 10);
                return { r: Math.max(0, r) };
              });
              return (
                <AnimatedCircle key={`ring-${dist}`} cx={CENTER} cy={CENTER} stroke={Colors.onSurfaceVariant} strokeWidth={1} strokeDasharray="4, 6" fill="none" opacity={0.4} animatedProps={animatedRingProps} />
              );
            })}

            {/* Crosshairs */}
            <AnimatedLine stroke={Colors.onSurfaceVariant} strokeWidth={1} strokeDasharray="4, 6" opacity={0.3} animatedProps={animatedCrosshairProps} />
            <AnimatedLine stroke={Colors.onSurfaceVariant} strokeWidth={1} strokeDasharray="4, 6" opacity={0.3} animatedProps={animatedCrosshairHProps} />

            {/* Sonar Ping Ripple */}
            <AnimatedCircle cx={CENTER} cy={CENTER} stroke={Colors.primaryContainer} strokeWidth={3} fill="none" animatedProps={animatedPingProps} />

            {/* Driver Center Indicator */}
            <Circle cx={CENTER} cy={CENTER} r={6} fill="#FFFFFF" />
            <Circle cx={CENTER} cy={CENTER} r={14} fill="#FFFFFF" opacity={0.2} />

            {/* Plotting Stores */}
            {stores.map((store) => (
              <CalculatedNode 
                key={store.id} store={store} driverLocation={driverLocation}
                currentRadius={currentRadius} isSelected={selectedStoreId === store.id} onNodePress={onNodePress}
              />
            ))}
            
          </AnimatedG>
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
});

export default KineticSonar;

const styles = StyleSheet.create({
  radarWrapper: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: '#2c2f30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden' // Keeps everything inside the circle when panning
  },
  svg: {
    borderRadius: RADAR_SIZE / 2,
  }
});