import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { TransactionItem, TransactionFilters } from '../types/transaction';
import EditTransactionModal from './EditTransactionModal';

export default function TransactionList() {
  // 1. État pour les filtres
  const [filters, setFilters] = useState<TransactionFilters>({});
  // 2. État pour la transaction à éditer
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);

  const { transactions, isLoading, refetch } = useTransactions(filters);
  const { wallets } = useWallets();

  const updateFilter = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (isLoading) return <View style={styles.center}><Text>Chargement...</Text></View>;

  return (
    <View style={styles.container}>
      {/* --- SECTION FILTRES --- */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {/* Filtre Type */}
          <TouchableOpacity 
            style={[styles.filterChip, !filters.type && styles.filterChipActive]}
            onPress={() => updateFilter({ type: undefined })}
          >
            <Text style={!filters.type && styles.whiteText}>Tous</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filters.type === 'IN' && styles.filterChipActive]}
            onPress={() => updateFilter({ type: 'IN' })}
          >
            <Text style={filters.type === 'IN' && styles.whiteText}>Revenus</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filters.type === 'OUT' && styles.filterChipActive]}
            onPress={() => updateFilter({ type: 'OUT' })}
          >
            <Text style={filters.type === 'OUT' && styles.whiteText}>Dépenses</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Filtre Wallets */}
          {wallets.map(w => (
            <TouchableOpacity 
              key={w.id}
              style={[styles.filterChip, filters.walletId === w.id && styles.filterChipActive]}
              onPress={() => updateFilter({ walletId: filters.walletId === w.id ? undefined : w.id })}
            >
              <Text style={filters.walletId === w.id && styles.whiteText}>{w.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- LISTE DES TRANSACTIONS --- */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune transaction trouvée</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => setSelectedTransaction(item)} // Ouvre l'édition
          >
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.date}>{format(new Date(item.date), 'dd MMM yyyy à HH:mm')}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amount, { color: item.type === 'IN' ? '#4CAF50' : '#F44336' }]}>
                  {item.type === 'IN' ? '+' : '-'} {item.amount.toLocaleString()} Ar
                </Text>
                <View style={styles.labels}>
                  {item.labels.slice(0, 2).map(l => (
                    <View key={l.id} style={[styles.badge, { backgroundColor: l.color }]}>
                      <Text style={styles.badgeText}>{l.name}</Text>
                    </View>
                  ))}
                  {item.labels.length > 2 && <Text style={styles.more}>+{item.labels.length - 2}</Text>}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* --- MODALE D'ÉDITION --- */}
      {selectedTransaction && (
        <EditTransactionModal 
          visible={!!selectedTransaction}
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterSection: { paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  filterScroll: { paddingHorizontal: 15, alignItems: 'center' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 8 },
  filterChipActive: { backgroundColor: '#1B5E20' },
  whiteText: { color: '#fff', fontWeight: 'bold' },
  divider: { width: 1, height: 20, backgroundColor: '#DDD', marginRight: 8 },
  card: { backgroundColor: '#fff', padding: 16, marginVertical: 6, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  desc: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  amount: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  date: { fontSize: 12, color: '#999' },
  labels: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  more: { fontSize: 10, color: '#999', marginLeft: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});