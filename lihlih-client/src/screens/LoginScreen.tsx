import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { OasisInput, KineticButton, Colors, SurfaceCard } from '../components/UIPrimitives';
import { updateProfile } from '../services/storageService';
import axios from 'axios';
import { API_URL } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (phone.length < 10 || !name) {
      Alert.alert('Erreur', 'Veuillez entrer un nom et un numéro valide.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Create or Login in backend
      await axios.post(`${API_URL}/auth/login`, {
        phone_number: phone,
        name: name
      });

      // Save locally
      await updateProfile({ name, phone_number: phone });
      onLoginSuccess();
    } catch (error) {
      console.error("Login API Error:", error);
      Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue sur LihLih</Text>
        <Text style={styles.subtitle}>Entrez vos coordonnées pour commencer à commander.</Text>
        
        <SurfaceCard>
          <OasisInput 
            label="Nom complet" 
            value={name} 
            onChangeText={setName} 
            placeholder="Ex: Amine" 
          />
          <OasisInput 
            label="Numéro de téléphone" 
            value={phone} 
            onChangeText={setPhone} 
            placeholder="Ex: 0555112233" 
            keyboardType="phone-pad"
            maxLength={10}
          />
          <KineticButton 
            title={isLoading ? "Connexion..." : "Continuer"} 
            onPress={handleLogin} 
            disabled={isLoading}
          />
        </SurfaceCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.onSurface,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginBottom: 32,
    fontWeight: '600',
  }
});
