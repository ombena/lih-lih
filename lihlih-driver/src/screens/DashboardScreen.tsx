import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { DollarSign, TrendingUp, Award } from 'lucide-react-native';
import DriverHeader from '../components/DriverHeader';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DriverHeader />

      {/* Daily Metrics */}
      <View style={styles.metricsGrid}>
        <View style={[styles.card, styles.metricCard]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <DollarSign color="#22C55E" size={24} />
          </View>
          <Text style={styles.metricLabel}>GAINS DU JOUR</Text>
          <Text style={styles.metricValue}>1,450 DA</Text>
        </View>

        <View style={[styles.card, styles.metricCard]}>
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(221, 221, 249, 0.1)' }]}>
            <TrendingUp color="#ddddf9" size={24} />
          </View>
          <Text style={styles.metricLabel}>COURSES</Text>
          <Text style={styles.metricValue}>8</Text>
        </View>
      </View>

      {/* Secondary Metrics */}
      <View style={[styles.card, styles.longCard]}>
        <View style={styles.cardHeader}>
          <Award color="#ae2900" size={24} />
          <Text style={styles.cardTitle}>Performance Hebdomadaire</Text>
        </View>
        <View style={styles.performanceRow}>
          <View style={styles.pMetric}>
            <Text style={styles.pLabel}>Taux d'acceptation</Text>
            <Text style={styles.pValue}>98%</Text>
          </View>
          <View style={styles.pDivider} />
          <View style={styles.pMetric}>
            <Text style={styles.pLabel}>Note Client</Text>
            <Text style={styles.pValue}>4.9 ★</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity Placeholder */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Activité Récente</Text>
      </View>
      <View style={[styles.card, styles.activityCard]}>
        <Text style={styles.emptyText}>Aucune activité aujourd'hui</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121415',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100, // Make room for the bottom nav
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
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
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#1a1c1d',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2c2f30',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 10,
    color: '#abadae',
    marginBottom: 4,
    fontWeight: '900',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  longCard: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  pMetric: {
    alignItems: 'center',
  },
  pLabel: {
    fontSize: 12,
    color: '#abadae',
    marginBottom: 4,
    fontWeight: '700',
  },
  pValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  pDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#2c2f30',
  },
  sectionTitleRow: {
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  activityCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#2c2f30',
    backgroundColor: 'transparent',
  },
  emptyText: {
    color: '#595c5d',
    fontWeight: '700',
  }
});
