import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function DashboardScreen() {
  const accountId = useAuthStore((state) => state.accountId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>E-PAOSY Dashboard</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.label}>ID Compte</Text>
        <Text style={styles.value}>{accountId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
  balanceCard: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 15 },
  label: { color: '#E8F5E9', fontSize: 14 },
  value: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});