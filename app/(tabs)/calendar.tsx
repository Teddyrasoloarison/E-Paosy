import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { format, getDaysInMonth, startOfMonth, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import React, { useState, useCallback } from 'react';
import { BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { transactionService } from '../../src/services/transactionService';
import { useWallets } from '../../src/hooks/useWallets';
import { TransactionItem } from '../../src/types/transaction';

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

  // Charger les transactions pour la date sélectionnée
  const loadTransactionsForDate = useCallback(async () => {
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
        pageSize: 100, // Limite haute pour récupérer toutes les transactions du jour
      });

      setTransactions(result.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, selectedDate]);

  React.useEffect(() => {
    loadTransactionsForDate();
  }, [loadTransactionsForDate]);

  // Calculer les statistiques du jour
  const dailyStats = React.useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'IN') {
        totalIncome += Number(t.amount);
      } else {
        totalExpense += Number(t.amount);
      }
    });

    return {
      income: totalIncome,
      expense: totalExpense,
      difference: totalIncome - totalExpense,
    };
  }, [transactions]);

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
          {isIncome ? '+' : '-'}{displayAmount} Ar
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        
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

        {/* Statistiques du jour */}
        <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statsTitle, { color: theme.text }]}>Résumé du jour</Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.success + '15' }]}>
              <Ionicons name="arrow-down-circle" size={20} color={theme.success} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Revenus</Text>
              <Text style={[styles.statValue, { color: theme.success }]}>
                +{dailyStats.income.toLocaleString()} Ar
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.error + '15' }]}>
              <Ionicons name="arrow-up-circle" size={20} color={theme.error} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Dépenses</Text>
              <Text style={[styles.statValue, { color: theme.error }]}>
                -{dailyStats.expense.toLocaleString()} Ar
              </Text>
            </View>
            
            <View style={[
              styles.statCard, 
              { backgroundColor: dailyStats.difference >= 0 ? theme.success + '15' : theme.error + '15' }
            ]}>
              <Ionicons 
                name={dailyStats.difference >= 0 ? 'trending-up' : 'trending-down'} 
                size={20} 
                color={dailyStats.difference >= 0 ? theme.success : theme.error} 
              />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Différence</Text>
              <Text style={[
                styles.statValue, 
                { color: dailyStats.difference >= 0 ? theme.success : theme.error }
              ]}>
                {dailyStats.difference >= 0 ? '+' : ''}{dailyStats.difference.toLocaleString()} Ar
              </Text>
            </View>
          </View>
        </View>

        {/* Liste des transactions du jour */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Transactions ({transactions.length})
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
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={renderTransactionItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

