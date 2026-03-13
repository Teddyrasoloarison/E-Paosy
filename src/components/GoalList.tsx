import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { 
  ActivityIndicator, 
  FlatList, 
  Modal, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Animated, 
  NativeSyntheticEvent, 
  NativeScrollEvent 
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useGoals } from '../hooks/useGoals';
import { useWallets } from '../hooks/useWallets';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { GoalFilters, GoalItem } from '../types/goal';
import EditGoalModal from './EditGoalModal';
import ConfirmModal from './ConfirmModal';
import { GoalCard } from './GoalCard';
import { useModernAlert } from '../hooks/useModernAlert';
import { useIsFocused } from '@react-navigation/native';

export default function GoalList() {
  const [filters, setFilters] = useState<GoalFilters>({});
  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<GoalItem | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [showDeletedMessage] = useState(false);
  const filterAnim = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { wallets } = useWallets();
  const isFocused = useIsFocused();
  const getGoalsDeletedFlag = useAuthStore((state) => state.getGoalsDeletedFlag);
  const clearGoalsDeletedFlag = useAuthStore((state) => state.clearGoalsDeletedFlag);
  const { show } = useModernAlert();

  const { goals, isLoading, archiveGoal, totalGoals, error, refetch } = useGoals(filters);

  // Check if goals were deleted during logout and show message
  const hasCheckedDeletedFlag = useRef(false);

  useEffect(() => {
    const checkDeletedFlag = async () => {
      if (isFocused && !hasCheckedDeletedFlag.current) {
        hasCheckedDeletedFlag.current = true;
        const deletedGoals = await getGoalsDeletedFlag();
        if (deletedGoals && deletedGoals.length > 0) {
          const achievedGoals = deletedGoals.filter(g => g.status === 'achieved').map(g => g.name).join(', ');
          const expiredGoals = deletedGoals.filter(g => g.status === 'expired').map(g => g.name).join(', ');

          let message = '';
          if (achievedGoals) {
            message += `Objectifs atteints et supprimés : ${achievedGoals}. `;
          }
          if (expiredGoals) {
            message += `Objectifs expirés et supprimés : ${expiredGoals}.`;
          }

          show({
            title: 'Objectifs Supprimés',
            message: message,
            type: 'info',
            buttons: [{ text: 'OK' }],
          });

          await clearGoalsDeletedFlag();
        }
      }
    };
    
    checkDeletedFlag();
  }, [isFocused, getGoalsDeletedFlag, clearGoalsDeletedFlag, show]);




  // Debug: Log goal data when it changes
  useEffect(() => {
    console.log("GoalList - goals:", goals);
    console.log("GoalList - totalGoals:", totalGoals);
    console.log("GoalList - isLoading:", isLoading);
    console.log("GoalList - error:", error);
    console.log("GoalList - filters:", filters);
  }, [goals, totalGoals, isLoading, error, filters]);

  // Reset on first mount
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      console.log("GoalList - First mount, resetting filters");
      setFilters({});
    }
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.walletId) count++;
    if (filters.status) count++;
    if (filters.name) count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    return count;
  }, [filters]);

  const updateFilter = (newFilters: Partial<GoalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };


  const handleConfirmDelete = () => {
    if (goalToDelete) {
      archiveGoal(
        { walletId: goalToDelete.walletId, goalId: goalToDelete.id },
        {
          onSuccess: () => {
            setDeleteModalVisible(false);
            setGoalToDelete(null);
          },
          onError: (err) => {
            console.error("Erreur suppression:", err);
            setDeleteModalVisible(false);
          }
        }
      );
    }
  };

  const handleEditPress = (item: GoalItem) => {
    setSelectedGoal(item);
  };

  const handleFilterSelect = (filterType: string, value: string | undefined) => {
    if (filterType === 'walletId') {
      updateFilter({ walletId: value });
    } else if (filterType === 'status') {
      updateFilter({ status: value as 'in_progress' | 'completed' | 'expired' | undefined });
    }
  };

  // Gérer le scroll pour afficher/masquer le bouton filtre
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const currentScrollY = contentOffset.y;
    
    // Afficher le bouton filtre seulement quand on est proche du haut de la page
    const shouldShowFilter = currentScrollY < 50;
    
    if (shouldShowFilter !== isScrollingDown) {
      setIsScrollingDown(shouldShowFilter);
      Animated.timing(filterAnim, {
        toValue: shouldShowFilter ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    
    lastScrollY.current = currentScrollY;
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error, marginTop: 16 }]}>
          Erreur lors du chargement des objectifs
        </Text>
        <Text style={[styles.errorDetail, { color: theme.textSecondary, marginTop: 8 }]}>
          {error.message || 'Vérifiez votre connexion'}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.primary, marginTop: 20 }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Auto-delete message toast - displayed at bottom */}
      {showDeletedMessage && (
        <View style={[styles.deletedMessageContainer, { backgroundColor: '#374151' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.deletedMessageText}>
            Les objectifs atteints et expirés ont été supprimés pour optimiser l&apos;espace
          </Text>
        </View>
      )}

      {/* Floating Filter Button - animated hide/show on scroll */}
      <Animated.View 
        style={[
          styles.floatingFilterContainer,
          {
            opacity: filterAnim,
          }
        ]}
      >
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
      </Animated.View>

      {/* LIST */}
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="trophy-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun objectif</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Creez votre premier objectif
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <GoalCard 
            goal={item} 
            onPress={() => handleEditPress(item)} 
          />
        )}
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
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Statut</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      { backgroundColor: theme.background },
                      !filters.status && { backgroundColor: theme.primary }
                    ]}
                    onPress={() => handleFilterSelect('status', undefined)}
                  >
                    <Ionicons name="apps" size={18} color={!filters.status ? '#FFFFFF' : theme.textSecondary} />
                    <Text style={[styles.filterOptionText, { color: !filters.status ? '#FFFFFF' : theme.text }]}>Tous</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      { backgroundColor: theme.background },
                      filters.status === 'in_progress' && { backgroundColor: theme.primary }
                    ]}
                    onPress={() => handleFilterSelect('status', filters.status === 'in_progress' ? undefined : 'in_progress')}
                  >
                    <Ionicons name="time-outline" size={18} color={filters.status === 'in_progress' ? '#FFFFFF' : theme.primary} />
                    <Text style={[styles.filterOptionText, { color: filters.status === 'in_progress' ? '#FFFFFF' : theme.text }]}>En cours</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      { backgroundColor: theme.background },
                      filters.status === 'completed' && { backgroundColor: theme.success }
                    ]}
                    onPress={() => handleFilterSelect('status', filters.status === 'completed' ? undefined : 'completed')}
                  >
                    <Ionicons name="checkmark-circle" size={18} color={filters.status === 'completed' ? '#FFFFFF' : theme.success} />
                    <Text style={[styles.filterOptionText, { color: filters.status === 'completed' ? '#FFFFFF' : theme.text }]}>Terminé</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      { backgroundColor: theme.background },
                      filters.status === 'expired' && { backgroundColor: theme.error }
                    ]}
                    onPress={() => handleFilterSelect('status', filters.status === 'expired' ? undefined : 'expired')}
                  >
                    <Ionicons name="alert-circle" size={18} color={filters.status === 'expired' ? '#FFFFFF' : theme.error} />
                    <Text style={[styles.filterOptionText, { color: filters.status === 'expired' ? '#FFFFFF' : theme.text }]}>Expiré</Text>
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

      {selectedGoal && (
        <EditGoalModal
          visible={!!selectedGoal}
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Supprimer l'objectif"
        message={`Êtes-vous sûr de vouloir supprimer "${goalToDelete?.name || 'Cet objectif'}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setGoalToDelete(null);
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
    paddingHorizontal: 0,
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
    backgroundColor: "#CCCCCC",
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
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  // Auto-delete message toast styles
  deletedMessageContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  deletedMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
