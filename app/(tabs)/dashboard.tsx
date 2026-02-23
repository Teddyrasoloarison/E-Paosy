import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import DashboardShell from '@/components/dashboard-shell';

export default function DashboardScreen() {
  const accountId = useAuthStore((state) => state.accountId);
  const username = useAuthStore((state) => state.username);

  return (
    <DashboardShell title="Dashboard" subtitle={`Bienvenue ${username ?? ''}`.trim()}>
      <View style={styles.balanceCard}>
        <Text style={styles.cardLabel}>Compte actif</Text>
        <Text style={styles.accountValue}>{accountId ?? '--'}</Text>
        <Text style={styles.cardHint}>Surveillez vos operations et gardez le controle.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={20} color="#2E7D32" />
          <Text style={styles.statValue}>Ar</Text>
          <Text style={styles.statText}>Solde</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="swap-horizontal-outline" size={20} color="#2E7D32" />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statText}>Transactions</Text>
        </View>
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 5px 12px rgba(0, 0, 0, 0.12)' },
    }),
  },
  cardLabel: { color: '#E8F5E9', fontSize: 13, marginBottom: 8 },
  accountValue: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  cardHint: { color: '#E8F5E9', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFEADF',
    padding: 14,
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1B5E20' },
  statText: { fontSize: 13, color: '#5D7564' },
});