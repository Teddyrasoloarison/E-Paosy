console.log('Type de useGoals:', typeof useGoals);
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useGoals } from '../hooks/useGoals';
import { Ionicons } from '@expo/vector-icons';

export default function GoalList() {
  const { data, isLoading, error } = useGoals();

  if (isLoading) return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />;

  return (
    <FlatList
      data={data?.values}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.name}>{item.name}</Text>
            <Ionicons name="flag" size={20} color="#4CAF50" />
          </View>
          
          <Text style={styles.amount}>{item.amount.toLocaleString()} Ar</Text>
          
          <View style={styles.footer}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.dateText}>
                {new Date(item.startingDate).toLocaleDateString()} - {new Date(item.endingDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Aucun objectif défini.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  amount: { fontSize: 22, fontWeight: '800', color: '#2E7D32', marginVertical: 4 },
  footer: { borderTopWidth: 1, borderTopColor: '#EEE', marginTop: 10, paddingTop: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#666', marginLeft: 6 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});