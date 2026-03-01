import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import ConfirmModal from './ConfirmModal';
import { useProjectTransactions } from '../hooks/useProjectTransactions';
import { useThemeStore } from '../store/useThemeStore';
import { Project, ProjectTransaction } from '../types/project';
import EditProjectTransactionModal from './EditProjectTransactionModal';

interface Props {
  project: Project;
}

export default function ProjectTransactionList({ project }: Props) {
  const { data, isLoading, error, deleteTransaction } = useProjectTransactions(project.id);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<ProjectTransaction | null>(null);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const projectColor = project.color || theme.primary;

  // Get fresh transaction data from the query cache based on selected ID
  const selectedTransaction = useMemo(() => {
    if (!selectedTransactionId || !data) return null;
    return data.find(t => t.id === selectedTransactionId) || null;
  }, [selectedTransactionId, data]);

  // Clic sur la transaction -> Ouvre EditProjectTransactionModal
  const handleTransactionPress = useCallback((transaction: ProjectTransaction) => {
    setSelectedTransactionId(transaction.id);
  }, []);

  const handleDeleteTransaction = useCallback((transaction: ProjectTransaction) => {
    setTransactionToDelete(transaction);
  }, []);

  const confirmDelete = useCallback(() => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id, {
        onSuccess: () => {
          setTransactionToDelete(null);
        },
        onError: () => {
          setTransactionToDelete(null);
        }
      });
    }
  }, [transactionToDelete, deleteTransaction]);

  const handleCloseModal = useCallback(() => {
    setSelectedTransactionId(null);
  }, []);

  // Sort transactions by creation date (newest first)
  const sortedTransactions = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!data) return { estimated: 0, real: 0 };
    return data.reduce((acc, t) => ({
      estimated: acc.estimated + (t.estimatedCost || 0),
      real: acc.real + (t.realCost || 0),
    }), { estimated: 0, real: 0 });
  }, [data]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <View style={[styles.errorIcon, { backgroundColor: theme.error + '15' }]}>
          <Ionicons name="alert-circle" size={28} color={theme.error} />
        </View>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Erreur lors du chargement des transactions
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Summary Card */}
      {data && data.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: projectColor + '15', borderColor: projectColor + '30' }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total estimé</Text>
              <Text style={[styles.summaryValue, { color: projectColor }]}>
                {totals.estimated.toLocaleString()} Ar
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total réel</Text>
              <Text style={[styles.summaryValue, { color: theme.success }]}>
                {totals.real.toLocaleString()} Ar
              </Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={sortedTransactions}
        keyExtractor={(item, index) => item?.id || index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (!item) return null;

          const hasRealCost = item.realCost && item.realCost > 0;
          const costDiff = hasRealCost ? item.realCost - item.estimatedCost : 0;
          const isOverBudget = hasRealCost && costDiff > 0;

          return (
            <TouchableOpacity 
              style={[
                styles.transactionCard, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleTransactionPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: projectColor + '20' }]}>
                <Ionicons 
                  name="receipt" 
                  size={20} 
                  color={projectColor} 
                />
              </View>

              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {item.name || 'Sans nom'}
                </Text>
                {item.description ? (
                  <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
                
                {/* Cost badges */}
                <View style={styles.costBadges}>
                  <View style={[styles.costBadge, { backgroundColor: projectColor + '15' }]}>
                    <Ionicons name="calculator-outline" size={12} color={projectColor} />
                    <Text style={[styles.costBadgeText, { color: projectColor }]}>
                      Est: {item.estimatedCost.toLocaleString()} Ar
                    </Text>
                  </View>
                  {hasRealCost && (
                    <View style={[styles.costBadge, { backgroundColor: theme.success + '15' }]}>
                      <Ionicons name="cash-outline" size={12} color={theme.success} />
                      <Text style={[styles.costBadgeText, { color: theme.success }]}>
                        Réel: {item.realCost?.toLocaleString()} Ar
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.statusContainer}>
                {hasRealCost && (
                  <View style={[
                    styles.diffBadge, 
                    { backgroundColor: isOverBudget ? theme.error + '15' : theme.success + '15' }
                  ]}>
                    <Ionicons 
                      name={isOverBudget ? "arrow-up" : "arrow-down"} 
                      size={12} 
                      color={isOverBudget ? theme.error : theme.success} 
                    />
                    <Text style={[
                      styles.diffText, 
                      { color: isOverBudget ? theme.error : theme.success }
                    ]}>
                      {Math.abs(costDiff).toLocaleString()} Ar
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: theme.error + '15' }]}
                  onPress={() => handleDeleteTransaction(item)}
                >
                  <Ionicons name="trash-outline" size={14} color={theme.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: projectColor + '15' }]}>
              <Ionicons name="receipt-outline" size={40} color={projectColor} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune transaction</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Ajoutez des coûts à votre projet
            </Text>
          </View>
        }
      />

      {selectedTransaction && (
        <EditProjectTransactionModal
          visible={true}
          onClose={handleCloseModal}
          project={project}
          transaction={selectedTransaction}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={!!transactionToDelete}
        title="Supprimer la transaction"
        message={`Êtes-vous sûr de vouloir supprimer "${transactionToDelete?.name}"?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setTransactionToDelete(null)}
        isDestructive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { 
    paddingVertical: 10,
    paddingBottom: 100,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    marginHorizontal: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { 
    flex: 1, 
    marginLeft: 12,
  },
  name: { 
    fontSize: 15, 
    fontWeight: '600',
  },
  description: { 
    fontSize: 12, 
    marginTop: 2,
  },
  costBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  costBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  costBadgeText: {
    fontSize: 10,
    marginLeft: 3,
    fontWeight: '600'
  },
  statusContainer: { 
    alignItems: 'flex-end',
    gap: 8,
  },
  diffBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
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
});
