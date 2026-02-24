import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useWallets } from '../../src/hooks/useWallets';
import { useTransactions } from '../../src/hooks/useTransactions';
import DashboardShell from '@/components/dashboard-shell';

export default function DashboardScreen() {
  const username = useAuthStore((state) => state.username);
  const { wallets } = useWallets();
  const { transactions } = useTransactions();

  const totalBalance = wallets.reduce((sum, w) => sum + (w.amount || 0), 0);
  const transactionCount = transactions.length;

  return (
    <DashboardShell title="Dashboard" subtitle={`Bienvenue ${username ?? ''}`.trim()}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* statistics cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={20} color="#2E7D32" />
            <Text style={styles.statValue}>{totalBalance.toLocaleString('fr-FR')} Ar</Text>
            <Text style={styles.statText}>Solde total</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="swap-horizontal-outline" size={20} color="#2E7D32" />
            <Text style={styles.statValue}>{transactionCount}</Text>
            <Text style={styles.statText}>Transactions</Text>
          </View>
          {/* additional cards can be added here */}
        </View>

        {/* chart section - placeholder */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Analyse des dépenses</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>[Graphique à venir]</Text>
          </View>
        </View>

        {/* additional info section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoHeader}>Raccourcis & Informations</Text>
          <Text style={styles.infoText}>Ajoutez ici des liens rapides vers vos objectifs, étiquettes ou statistiques avancées.</Text>
        </View>
      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 30 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFEADF',
    padding: 14,
    gap: 4,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1B5E20' },
  statText: { fontSize: 13, color: '#5D7564' },

  /* chart styles */
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.1)' },
    }),
  },
  chartTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  chartPlaceholder: {
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: { color: '#9E9E9E' },

  /* info section */
  infoSection: { padding: 16, backgroundColor: '#E8F5E9', borderRadius: 14 },
  infoHeader: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#4A4A4A' },
});