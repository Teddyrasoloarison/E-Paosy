import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import React, { useState, useCallback } from 'react';
import { BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { transactionService } from '../../src/services/transactionService';
import { useWallets } from '../../src/hooks/useWallets';
import { TransactionItem } from '../../src/types/transaction';

// Nombre de transactions par page dans le calendrier
const PAGE_SIZE = 10;

// Mapping des types vers les icônes et couleurs
const TRANSACTION_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  'IN': { icon: 'arrow-down-circle', color: '#22C55E' },
  'OUT': { icon: 'arrow-up-circle', color: '#EF4444' },
};

export default function CalendarScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const accountId = useAuthStore((state) => state.accountId);
  const { wallets } = useWallets();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android') {
          router.replace('/(tabs)/transaction');
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(totalTransactions / PAGE_SIZE);

  // Charger les transactions pour la date sélectionnée avec pagination
  const loadTransactionsForDate = useCallback(async (page: number = 1) => {
    if (!accountId) return;
    
    setIsLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const result = await transactionService.getTransactions(accountId, {
        startingDate: startOfDay.toISOString(),
        endingDate: endOfDay.toISOString(),
        page: page,
        pageSize: PAGE_SIZE,
      });

      // Stocker le total des transactions pour la pagination
      setTotalTransactions(result.total || 0);
      
      // Si c'est la première page, remplacer les données
      // Sinon, ajouter aux données existantes
      if (page === 1) {
        setTransactions(result.data || []);
      } else {
        setTransactions(prev => [...prev, ...(result.data || [])]);
      }
      
      setCurrentPage(page);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, selectedDate]);

  // Charger les transactions quand la date change
  React.useEffect(() => {
    loadTransactionsForDate(1);
  }, [loadTransactionsForDate]);

  // Gérer le changement de page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadTransactionsForDate(newPage);
    }
  };

  // Fonctions de navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  // Générer les jours du mois
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getDay(startOfMonth(currentMonth)); // 0 = dimanche
    const days: (number | null)[] = [];

    // Ajouter des espaces vides pour les jours avant le premier du mois
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Ajouter les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const renderTransactionItem = ({ item }: { item: TransactionItem }) => {
    const typeStr = String(item.type || '').trim().toUpperCase();
    const config = TRANSACTION_TYPE_CONFIG[typeStr] || TRANSACTION_TYPE_CONFIG['OUT'];
    const isIncome = typeStr === 'IN';
    const displayAmount = Math.abs(Number(item.amount)).toLocaleString();
    
    const wallet = wallets.find(w => w.id === item.walletId);
    const walletName = wallet?.name || 'Portefeuille';
    const walletColor = wallet?.color || theme.primary;

    return (
      <View style={[styles.transactionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={20} color={config.color} />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDescription, { color: theme.text }]} numberOfLines={1}>
            {item.description || 'Sans description'}
          </Text>
          <View style={styles.transactionMeta}>
            <View style={[styles.walletBadge, { backgroundColor: walletColor + '15' }]}>
              <Ionicons name="wallet-outline" size={10} color={walletColor} />
              <Text style={[styles.walletName, { color: walletColor }]}>{walletName}</Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.transactionAmount, { color: isIncome ? theme.success : theme.error }]}>
          {displayAmount} Ar
        </Text>
      </View>
    );
  };

  return (
    <DashboardShell 
      title="Calendrier" 
      subtitle={`Transactions du ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}`} 
      icon="calendar-outline"
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* En-tête du calendrier */}
        <View style={[styles.calendarHeader, { backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.monthTitle, { color: theme.text }]}>
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </Text>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Jours de la semaine */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayCell}>
              <Text style={[styles.weekDayText, { color: theme.textSecondary }]}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Grille du calendrier */}
        <View style={[styles.calendarGrid, { backgroundColor: theme.surface }]}>
          {calendarDays.map((day, index) => {
            const isSelected = day ? isSameDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), selectedDate) : false;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => day && selectDate(day)}
                disabled={!day}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: theme.text },
                    isSelected && {
                      color: '#FFFFFF',
                    },
                    !day && { color: theme.textTertiary },
                  ]}
                >
                  {day || ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>


        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Transactions ({totalTransactions})
          </Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={40} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Aucune transaction ce jour
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={renderTransactionItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <View style={[styles.paginationContainer, { backgroundColor: theme.surface }]}>
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                    onPress={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Ionicons name="arrow-back" size={20} color={currentPage === 1 ? theme.textTertiary : theme.primary} />
                  </TouchableOpacity>
                  
                  <Text style={[styles.paginationText, { color: theme.text }]}>
                    {currentPage} / {totalPages}
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <Ionicons name="arrow-forward" size={20} color={currentPage === totalPages ? theme.textTertiary : theme.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
  },
  navButton: {
    padding: 8, 
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  transactionsSection: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionMeta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  walletName: {
    fontSize: 10,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  // Pagination Styles
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 20,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

