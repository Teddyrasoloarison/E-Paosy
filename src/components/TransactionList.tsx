import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { format } from 'date-fns';
import { TransactionItem, TransactionFilters } from '../types/transaction';
import EditTransactionModal from './EditTransactionModal';

export default function TransactionList() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);

  const { transactions, isLoading } = useTransactions(filters);
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
          <TouchableOpacity
            style={[styles.filterChip, !filters.type && styles.filterChipActive]}
            onPress={() => updateFilter({ type: undefined })}
          >
            <Text style={[styles.filterText, !filters.type && styles.whiteText]}>Tous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filters.type === 'IN' && styles.filterChipActive]}
            onPress={() => updateFilter({ type: 'IN' })}
          >
            <Text style={[styles.filterText, filters.type === 'IN' && styles.whiteText]}>Revenus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filters.type === 'OUT' && styles.filterChipActive]}
            onPress={() => updateFilter({ type: 'OUT' })}
          >
            <Text style={[styles.filterText, filters.type === 'OUT' && styles.whiteText]}>Dépenses</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {wallets.map(w => (
            <TouchableOpacity
              key={w.id}
              style={[styles.filterChip, filters.walletId === w.id && styles.filterChipActive]}
              onPress={() => updateFilter({ walletId: filters.walletId === w.id ? undefined : w.id })}
            >
              <Text style={[styles.filterText, filters.walletId === w.id && styles.whiteText]}>{w.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- LISTE --- */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune transaction trouvée</Text>}
        renderItem={({ item }) => {
          
          // 🔍 ANALYSE DE L'OBJET REÇU
          // Si tu vois "Clés présentes: amount, description, date" mais PAS "type", 
          // c'est que ton backend ne l'envoie pas dans le JSON.
          // debug: montrer l'objet complet pour diagnostiquer les valeurs reçues
          console.log("transaction item:", item);
          console.log(`ID: ${item.id} | Clés: ${Object.keys(item).join(', ')} | Type brute: ${item.type}`);

          // Vérification du type uniquement : ne pas se fier au signe du montant
          const hasType = item.type !== undefined && item.type !== null;
          if (!hasType) {
            console.warn(`Transaction ${item.id} sans type reçu, affichage par défaut en dépense`);
          }
          const isIncome = hasType && item.type.toString().trim().toUpperCase() === 'IN';

          // valeur absolue pour l'affichage, on ne veut jamais montrer deux signes
          const displayAmount = Math.abs(Number(item.amount)).toLocaleString();

          return (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedTransaction(item)}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.desc}>{item.description || 'Sans description'}</Text>
                  <Text style={styles.date}>
                    {item.date ? format(new Date(item.date), 'dd MMM yyyy à HH:mm') : '---'}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[
                    styles.amount,
                    { color: isIncome ? '#2ab92f' : '#df2113' }
                  ]}>
                    {isIncome ? '+' : '-'} {displayAmount} Ar
                  </Text>

                  <View style={styles.labels}>
                    {item.labels && item.labels.slice(0, 2).map(l => (
                      <View key={l.id} style={[styles.badge, { backgroundColor: l.color || '#999' }]}>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterSection: { paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  filterScroll: { paddingHorizontal: 15, alignItems: 'center' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 8 },
  filterChipActive: { backgroundColor: '#1B5E20' },
  filterText: { color: '#666', fontSize: 13 },
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
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});