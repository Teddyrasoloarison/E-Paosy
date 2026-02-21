import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';

export default function ObjectifScreen() {
  return (
    <DashboardShell title="Objectif" subtitle="Suivi de vos objectifs">
      <View style={styles.card}>
        <Text style={styles.title}>Page Objectif</Text>
        <Text style={styles.text}>
          Definissez vos objectifs financiers et suivez votre progression.
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
