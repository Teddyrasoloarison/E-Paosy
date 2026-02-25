import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { format } from 'date-fns';
import { TransactionItem, TransactionFilters } from '../types/transaction';
import EditTransactionModal from './EditTransactionModal';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../store/useThemeStore';

export default function TransactionList() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { transactions, isLoading } = useTransactions(filters);
  const { wallets } = useWallets();

  // Sort transactions by creation date (newest first - based on id)
  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => b.id.localeCompare(a.id));
  }, [transactions]);

  const updateFilter = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* FILTERS SECTION */}
      <View style={[styles.filterSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.filterHeader}>
          <Ionicons name="filter" size={16} color={theme.textSecondary} />
          <Text style={[styles.filterTitle, { color: theme.textSecondary }]}>Filtres</Text>
          {(filters.type || filters.walletId) && (
            <TouchableOpacity onPress={() => setFilters({})}>
              <Text style={[styles.clearFilter, { color: theme.error }]}>Effacer</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip, 
              { backgroundColor: !filters.type ? theme.primary : theme.background },
              !filters.type && styles.filterChipActive
            ]}
            onPress={() => updateFilter({ type: undefined })}
          >
            <Ionicons name="apps" size={14} color={!filters.type ? '#FFFFFF' : theme.textSecondary} />
            <Text style={[
              styles.filterText, 
              { color: !filters.type ? '#FFFFFF' : theme.textSecondary }
            ]}>Tous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip, 
              filters.type === 'IN' && { backgroundColor: theme.success }
            ]}
            onPress={() => updateFilter({ type: filters.type === 'IN' ? undefined : 'IN' })}
          >
            <Ionicons name="arrow-down" size={14} color={filters.type === 'IN' ? '#FFFFFF' : theme.success} />
            <Text style={[
              styles.filterText, 
              { color: filters.type === 'IN' ? '#FFFFFF' : theme.textSecondary }
            ]}>Revenus</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip, 
              filters.type === 'OUT' && { backgroundColor: theme.error }
            ]}
            onPress={() => updateFilter({ type: filters.type === 'OUT' ? undefined : 'OUT' })}
          >
            <Ionicons name="arrow-up" size={14} color={filters.type === 'OUT' ? '#FFFFFF' : theme.error} />
            <Text style={[
              styles.filterText, 
              { color: filters.type === 'OUT' ? '#FFFFFF' : theme.textSecondary }
            ]}>Dépenses</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {wallets.map(w => (
            <TouchableOpacity
              key={w.id}
              style={[
                styles.filterChip, 
                { backgroundColor: filters.walletId === w.id ? theme.primary : theme.background },
                filters.walletId === w.id && styles.filterChipActive
              ]}
              onPress={() => updateFilter({ walletId: filters.walletId === w.id ? undefined : w.id })}
            >
              <Ionicons name="wallet" size={14} color={filters.walletId === w.id ? '#FFFFFF' : theme.textSecondary} />
              <Text style={[
                styles.filterText, 
                { color: filters.walletId === w.id ? '#FFFFFF' : theme.textSecondary }
              ]}>{w.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <FlatList
        data={sortedTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucune transaction trouvée</Text>
          </View>
        }
        renderItem={({ item }) => {
          const hasType = item.type !== undefined && item.type !== null;
          const isIncome = hasType && item.type.toString().trim().toUpperCase() === 'IN';
          const displayAmount = Math.abs(Number(item.amount)).toLocaleString();

          return (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} 
              onPress={() => setSelectedTransaction(item)}
              activeOpacity={0.7}
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.desc, { color: theme.text }]} numberOfLines={1}>
                    {item.description || 'Sans description'}
                  </Text>
                  <Text style={[styles.date, { color: theme.textTertiary }]}>
                    {item.date ? format(new Date(item.date), 'dd MMM yyyy à HH:mm') : '---'}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.amount, { color: isIncome ? theme.success : theme.error }]}>
                    {isIncome ? '+' : '-'} {displayAmount} Ar
                  </Text>

                  <View style={styles.labels}>
                    {item.labels && item.labels.slice(0, 2).map(l => (
                      <View key={l.id} style={[styles.badge, { backgroundColor: l.color || theme.primary }]}>
                        <Text style={styles.badgeText}>{l.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterSection: { paddingVertical: 12, borderBottomWidth: 1 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10, gap: 8 },
  filterTitle: { fontSize: 13, fontWeight: '600' },
  clearFilter: { fontSize: 13, fontWeight: '600', marginLeft: 'auto' },
  filterScroll: { paddingHorizontal: 15, alignItems: 'center', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'transparent' },
  filterChipActive: { borderColor: 'transparent' },
  filterText: { fontSize: 13, fontWeight: '500' },
  divider: { width: 1, height: 20, marginHorizontal: 4 },
  card: { 
    padding: 16, 
    marginVertical: 6, 
    marginHorizontal: 1,
    borderRadius: 14, 
    borderWidth: 1,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  desc: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  amount: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  date: { fontSize: 12 },
  labels: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15 }
});
