import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function DriverHeader() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=Karim+D&background=2c2f30&color=fff' }} 
            style={styles.avatar} 
          />
        </View>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.driverName}>Karim D.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    borderWidth: 2, 
    borderColor: '#595c5d', 
    overflow: 'hidden' 
  },
  avatar: { 
    width: '100%', 
    height: '100%' 
  },
  greeting: {
    fontSize: 14,
    color: '#abadae',
    fontWeight: '700',
  },
  driverName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
});
