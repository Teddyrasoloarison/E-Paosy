import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';

export default function TransactionScreen() {
  return (
    <DashboardShell title="Transaction" subtitle="Suivi des transactions">
      <View style={styles.card}>
        <Text style={styles.title}>Page Transaction</Text>
        <Text style={styles.text}>
          Consultez ici l'historique et les details de toutes vos transactions.
        </Text>
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFEADF',
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1B5E20', marginBottom: 8 },
  text: { color: '#58725F', lineHeight: 20 },
});
