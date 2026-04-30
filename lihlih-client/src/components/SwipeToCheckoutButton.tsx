import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { ChevronRight, Check } from 'lucide-react-native';
import { Colors } from './UIPrimitives';

const BUTTON_WIDTH = Dimensions.get('window').width - 32;
const BUTTON_HEIGHT = 64;
const SWIPE_MARGIN = 8;
const KNOB_SIZE = BUTTON_HEIGHT - SWIPE_MARGIN * 2;
const MAX_SWIPE = BUTTON_WIDTH - KNOB_SIZE - SWIPE_MARGIN * 2;

export const SwipeToCheckoutButton = ({ onConfirm, isReady }: { onConfirm: () => void, isReady: boolean }) => {
  const [confirmed, setConfirmed] = useState(false);
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      if (confirmed || !isReady) return;
      let nextX = context.value.x + event.translationX;
      nextX = Math.max(0, Math.min(nextX, MAX_SWIPE));
      translateX.value = nextX;
    })
    .onEnd(() => {
      if (confirmed || !isReady) return;
      if (translateX.value > MAX_SWIPE * 0.8) {
        // Trigger checkout!
        translateX.value = withSpring(MAX_SWIPE);
        runOnJS(handleConfirm)();
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const textOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - (translateX.value / MAX_SWIPE),
    };
  });

  return (
    <View style={[styles.container, !isReady && styles.disabled]}>
      <Animated.View style={[styles.textContainer, textOpacityStyle]}>
        <Text style={styles.text}>
          {isReady ? "Glisser pour commander" : "Panier ou Adresse manquante"}
        </Text>
      </Animated.View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.knob, knobStyle, confirmed && styles.knobConfirmed]}>
          {confirmed ? (
            <Check color={Colors.primary} size={24} />
          ) : (
            <ChevronRight color={isReady ? Colors.primary : Colors.outline} size={28} />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: Colors.primary,
    borderRadius: 32,
    justifyContent: 'center',
    padding: SWIPE_MARGIN,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabled: {
    backgroundColor: Colors.surfaceContainerHigh,
    shadowOpacity: 0,
    elevation: 0,
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: 24, // Offset for the knob
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  knobConfirmed: {
    backgroundColor: Colors.surfaceContainerLow,
  }
});