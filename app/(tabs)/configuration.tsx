import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';

export default function ConfigurationScreen() {
  return (
    <DashboardShell title="Configuration" subtitle="Parametres de votre compte">
      <View style={styles.card}>
        <Text style={styles.title}>Page Configuration</Text>
        <Text style={styles.text}>
          Personnalisez vos preferences et reglez les parametres de securite.
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
