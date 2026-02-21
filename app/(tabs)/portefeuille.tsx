import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';

export default function PortefeuilleScreen() {
  return (
    <DashboardShell title="Portefeuille" subtitle="Vue portefeuille">
      <View style={styles.card}>
        <Text style={styles.title}>Page Portefeuille</Text>
        <Text style={styles.text}>
          Visualisez le detail de vos ressources et la repartition de votre portefeuille.
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
