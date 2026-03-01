import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useThemeStore } from '../store/useThemeStore';
import { TransactionFilters, TransactionItem } from '../types/transaction';
import EditTransactionModal from './EditTransactionModal';
import ConfirmModal from './ConfirmModal';

// Mapping des types vers les icônes et couleurs
const TRANSACTION_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  'IN': { icon: 'arrow-down-circle', color: '#22C55E' },
  'OUT': { icon: 'arrow-up-circle', color: '#EF4444' },
};

export default function TransactionList() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionItem | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { transactions, isLoading, deleteTransaction } = useTransactions(filters);
  const { wallets } = useWallets();

  // Sort transactions by creation date (newest first - based on id)
  const sortedTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => b.id.localeCompare(a.id));
  }, [transactions]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.walletId) count++;
    return count;
  }, [filters]);

  const updateFilter = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleDeletePress = (item: TransactionItem) => {
    setTransactionToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(
        { walletId: transactionToDelete.walletId, transactionId: transactionToDelete.id },
        {
          onSuccess: () => {
            setDeleteModalVisible(false);
            setTransactionToDelete(null);
          },
          onError: (err) => {
            console.error("Erreur suppression:", err);
            setDeleteModalVisible(false);
          }
        }
      );
    }
  };

  const handleEditPress = (item: TransactionItem) => {
    setSelectedTransaction(item);
  };

  const handleFilterSelect = (filterType: string, value: string | undefined) => {
    if (filterType === 'type') {
      updateFilter({ type: value as 'IN' | 'OUT' | undefined });
    } else if (filterType === 'walletId') {
      updateFilter({ walletId: value });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Floating Filter Button */}
      <View style={styles.floatingFilterContainer}>
        <TouchableOpacity 
          style={[
            styles.floatingFilterButton, 
            { backgroundColor: theme.primary },
            activeFiltersCount > 0 && styles.floatingFilterButtonActive
          ]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.filterButtonContent}>
            <Ionicons name="options" size={22} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>Filtrer</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={sortedTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="receipt-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune transaction</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Ajoutez votre premiere transaction
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          // Get transaction type config
          const typeStr = String(item.type || '').trim().toUpperCase();
          const config = TRANSACTION_TYPE_CONFIG[typeStr] || TRANSACTION_TYPE_CONFIG['OUT'];
          const isIncome = typeStr === 'IN';
          const displayAmount = Math.abs(Number(item.amount)).toLocaleString();
          
          // Get wallet info
          const wallet = wallets.find(w => w.id === item.walletId);
          const walletName = wallet?.name || 'Portefeuille';
          const walletColor = wallet?.color || theme.primary;
          const isWalletActive = wallet?.isActive ?? true;
          
          // Style for deactivated wallet - same as WalletList
          const walletIconColor = isWalletActive ? walletColor : theme.textTertiary;

          return (
            <TouchableOpacity 
              style={[
                styles.transactionCard, 
                { backgroundColor: theme.surface, borderColor: theme.border },
                !isWalletActive && { opacity: 0.6 }
              ]}
              onPress={() => handleEditPress(item)}
              activeOpacity={0.7}
            >
              {/* Type Icon */}
              <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                <Ionicons 
                  name={config.icon as any} 
                  size={24} 
                  color={config.color} 
                />
              </View>

              <View style={styles.info}>
                <Text style={[styles.description, { color: theme.text }]} numberOfLines={1}>
                  {item.description || 'Sans description'}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.date, { color: theme.textSecondary }]}>
                    {item.date ? format(new Date(item.date), 'dd MMM yyyy') : '---'}
                  </Text>
                  <View style={[styles.walletBadge, { backgroundColor: walletIconColor + '15' }]}>
                    <Ionicons name="wallet-outline" size={10} color={walletIconColor} />
                    <Text style={[styles.walletName, { color: walletIconColor }]}>{walletName}</Text>
                    {!isWalletActive && (
                      <Text style={[styles.inactiveTag, { color: theme.error }]}> - Inactif</Text>
                    )}
                  </View>
                </View>
                
                {/* Label if exists - show only first label since only one is allowed */}
                {item.labels && item.labels.length > 0 && (
                  <View style={[styles.labelBadge, { backgroundColor: item.labels[0].color + '20' }]}>
                    <View style={[styles.labelDot, { backgroundColor: item.labels[0].color }]} />
                    <Text style={[styles.labelText, { color: item.labels[0].color }]}>
                      {item.labels[0].name}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.rightSection}>
                <Text style={[styles.amount, { color: isIncome ? theme.success : theme.error }]}>
                  {isIncome ? '+' : '-'}{displayAmount} Ar
                </Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                    onPress={() => handleEditPress(item)}
                  >
                    <Ionicons name="pencil-outline" size={16} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                    onPress={() => handleDeletePress(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable 
          style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => setFilterModalVisible(false)}
        >
          <Pressable 
            style={[styles.filterModalContent, { backgroundColor: theme.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.filterModalHeader}>
              <View style={styles.filterModalHandle} />
              <View style={styles.filterModalTitleRow}>
                <View style={[styles.filterIconContainer, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="options" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.filterModalTitle, { color: theme.text }]}>Filtres</Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={[styles.clearAllText, { color: theme.error }]}>Tout effacer</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Type de transaction</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      { backgroundColor: theme.background },
                      !filters.type && { backgroundColor: theme.primary }
                    ]}
                    onPress={() => handleFilterSelect('type', undefined)}
                  >
                    <Ionicons name="apps" size={18} color={!filters.type ? '#FFFFFF' : theme.textSecondary} />
                    <Text style={[styles.filterOptionText, { color: !filters.type ? '#FFFFFF' : theme.text }]}>Tous</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      { backgroundColor: theme.background },
                      filters.type === 'IN' && { backgroundColor: theme.success }
                    ]}
                    onPress={() => handleFilterSelect('type', filters.type === 'IN' ? undefined : 'IN')}
                  >
                    <Ionicons name="arrow-down-circle" size={18} color={filters.type === 'IN' ? '#FFFFFF' : theme.success} />
                    <Text style={[styles.filterOptionText, { color: filters.type === 'IN' ? '#FFFFFF' : theme.text }]}>Revenus</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      { backgroundColor: theme.background },
                      filters.type === 'OUT' && { backgroundColor: theme.error }
                    ]}
                    onPress={() => handleFilterSelect('type', filters.type === 'OUT' ? undefined : 'OUT')}
                  >
                    <Ionicons name="arrow-up-circle" size={18} color={filters.type === 'OUT' ? '#FFFFFF' : theme.error} />
                    <Text style={[styles.filterOptionText, { color: filters.type === 'OUT' ? '#FFFFFF' : theme.text }]}>Dépenses</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Wallet Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Portefeuille</Text>
                <View style={styles.walletFilterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.walletFilterOption,
                      { backgroundColor: theme.background },
                      !filters.walletId && { backgroundColor: theme.primary }
                    ]}
                    onPress={() => handleFilterSelect('walletId', undefined)}
                  >
                    <Ionicons name="wallet" size={18} color={!filters.walletId ? '#FFFFFF' : theme.textSecondary} />
                    <Text style={[styles.filterOptionText, { color: !filters.walletId ? '#FFFFFF' : theme.text }]}>Tous</Text>
                  </TouchableOpacity>
                  
                  {wallets.map(w => (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        styles.walletFilterOption,
                        { backgroundColor: theme.background },
                        filters.walletId === w.id && { backgroundColor: w.color || theme.primary }
                      ]}
                      onPress={() => handleFilterSelect('walletId', filters.walletId === w.id ? undefined : w.id)}
                    >
                      <Ionicons name="wallet" size={18} color={filters.walletId === w.id ? '#FFFFFF' : w.color || theme.textSecondary} />
                      <Text style={[styles.filterOptionText, { color: filters.walletId === w.id ? '#FFFFFF' : theme.text }]}>{w.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <View style={[styles.activeFiltersContainer, { backgroundColor: theme.primary + '10' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                  <Text style={[styles.activeFiltersText, { color: theme.primary }]}>
                    {activeFiltersCount} filtre(s) actif(s)
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: theme.primary }]}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {selectedTransaction && (
        <EditTransactionModal
          visible={!!selectedTransaction}
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Supprimer la transaction"
        message={`Êtes-vous sûr de vouloir supprimer cette transaction "${transactionToDelete?.description || 'Sans description'}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setTransactionToDelete(null);
        }}
        isDestructive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { 
    paddingTop: 70,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  floatingFilterContainer: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 100,
  },
  floatingFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingFilterButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  filterBadge: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { 
    flex: 1, 
    marginLeft: 14,
  },
  description: { 
    fontSize: 15, 
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  date: { 
    fontSize: 12, 
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  walletName: {
    fontSize: 10,
    fontWeight: '600',
  },
  inactiveTag: {
    fontSize: 9,
    fontWeight: '700',
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: { 
    fontSize: 16, 
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  filterModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCCCCC',
    alignSelf: 'center',
    marginBottom: 16,
  },
  filterModalHeader: {
    marginBottom: 20,
  },
  filterModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  walletFilterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  walletFilterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  activeFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
