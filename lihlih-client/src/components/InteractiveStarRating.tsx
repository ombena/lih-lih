import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from './UIPrimitives';

interface Props {
  label: string;
  rating: number;
  onRatingChange: (value: number) => void;
}

export default function InteractiveStarRating({ label, rating, onRatingChange }: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.starRow}>
        {stars.map((s) => (
          <TouchableOpacity 
            key={s} 
            onPress={() => onRatingChange(s)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Star 
              size={32} 
              color={s <= rating ? Colors.secondary : Colors.surfaceContainerHigh} 
              fill={s <= rating ? Colors.secondary : 'transparent'} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    paddingHorizontal: 6,
  }
});
