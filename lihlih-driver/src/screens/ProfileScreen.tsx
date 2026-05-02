import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { User, Phone, CreditCard, FileText, Truck, ShieldCheck, ChevronRight, LogOut, Database } from 'lucide-react-native';
import { SurfaceCard, OasisInput } from '../components/UIPrimitives';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [cachedStores, setCachedStores] = useState<any[]>([]);

  // Mock driver data based on Prisma Schema
  const [driverInfo, setDriverInfo] = useState({
    name: "Ahmed Benali",
    phone_number: "0661 22 33 44",
    plate_number: "12345 116 03",
    id_card_number: "10987654321",
    license_number: "PR-99887766",
  });

  useFocusEffect(
    useCallback(() => {
      const loadCache = async () => {
        const cached = await AsyncStorage.getItem('@lihlih_store_directory');
        if (cached) setCachedStores(JSON.parse(cached));
      };
      loadCache();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#ae2900" />
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text style={styles.editAvatarText}>EDIT</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.driverName}>{driverInfo.name}</Text>
          <View style={styles.statusBadge}>
            <ShieldCheck size={14} color="#228B22" />
            <Text style={styles.statusText}>CONDUCTEUR VÉRIFIÉ</Text>
          </View>
        </View>

        {/* INFO CARDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
          <SurfaceCard style={styles.card}>
            <OasisInput 
              label="NOM COMPLET" 
              value={driverInfo.name} 
              onChangeText={(t: string) => setDriverInfo({...driverInfo, name: t})}
            />
            <OasisInput 
              label="TÉLÉPHONE" 
              value={driverInfo.phone_number} 
              onChangeText={(t: string) => setDriverInfo({...driverInfo, phone_number: t})}
            />
          </SurfaceCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VÉHICULE & DOCUMENTS</Text>
          <SurfaceCard style={styles.card}>
            <View style={styles.docRow}>
              <View style={styles.docIconBox}>
                <Truck size={20} color="#ff7855" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>PLAQUE D'IMMATRICULATION</Text>
                <Text style={styles.docValue}>{driverInfo.plate_number}</Text>
              </View>
              <ChevronRight size={20} color="#2c2f30" />
            </View>

            <View style={styles.divider} />

            <View style={styles.docRow}>
              <View style={styles.docIconBox}>
                <CreditCard size={20} color="#ff7855" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>CARTE D'IDENTITÉ NATIONALE</Text>
                <Text style={styles.docValue}>{driverInfo.id_card_number}</Text>
              </View>
              <ChevronRight size={20} color="#2c2f30" />
            </View>

            <View style={styles.divider} />

            <View style={styles.docRow}>
              <View style={styles.docIconBox}>
                <FileText size={20} color="#ff7855" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>PERMIS DE CONDUIRE</Text>
                <Text style={styles.docValue}>{driverInfo.license_number}</Text>
              </View>
              <ChevronRight size={20} color="#2c2f30" />
            </View>
          </SurfaceCard>
        </View>

        {/* DEBUG: STORE CACHE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEBUG: RÉPERTOIRE BOUTIQUES</Text>
          <SurfaceCard style={styles.card}>
            {cachedStores.length === 0 ? (
              <Text style={styles.debugText}>Répertoire vide ou en cours de synchronisation...</Text>
            ) : (
              cachedStores.map((s) => (
                <View key={s.id} style={styles.debugRow}>
                  <Database size={14} color="#595c5d" />
                  <Text style={styles.debugText}>
                    ID {s.id}: <Text style={{color: '#FFF'}}>{s.name}</Text> ({s.lat}, {s.lng})
                  </Text>
                </View>
              ))
            )}
          </SurfaceCard>
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <LogOut size={20} color="#b31b25" />
          <Text style={styles.logoutText}>DÉCONNEXION</Text>
        </TouchableOpacity>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121415',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1c1d',
    borderWidth: 2,
    borderColor: '#2c2f30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff7855',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#121415',
  },
  editAvatarText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  driverName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 139, 34, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#228B22',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#595c5d',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#1a1c1d',
    padding: 16,
    borderRadius: 20,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 120, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
  },
  docLabel: {
    color: '#abadae',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  docValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#2c2f30',
    marginVertical: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(179, 27, 37, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(179, 27, 37, 0.2)',
  },
  logoutText: {
    color: '#b31b25',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  debugText: {
    color: '#595c5d',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  footerSpacer: {
    height: 100,
  }
});
