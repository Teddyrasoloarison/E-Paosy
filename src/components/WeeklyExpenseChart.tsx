import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { TransactionItem } from '../types/transaction';
import { useThemeStore } from '../store/useThemeStore';

interface WeeklyExpenseChartProps {
  transactions: TransactionItem[];
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function WeeklyExpenseChart({ transactions }: WeeklyExpenseChartProps) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Get today's day index (0 = Monday, 6 = Sunday)
  const todayIndex = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert from Sunday=0 to Monday=0 format
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }, []);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const data = DAYS.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        day: DAYS[index],
        date: date,
        expense: 0,
        income: 0,
      };
    });

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const weekEnd = new Date(monday);
      weekEnd.setDate(monday.getDate() + 7);
      
      if (transactionDate >= monday && transactionDate < weekEnd) {
        const dayIndex = Math.floor((transactionDate.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayIndex >= 0 && dayIndex < 7) {
          const amount = Math.abs(Number(transaction.amount));
          if (transaction.type === 'OUT') {
            data[dayIndex].expense += amount;
          } else if (transaction.type === 'IN') {
            data[dayIndex].income += amount;
          }
        }
      }
    });

    return data;
  }, [transactions]);

  const maxExpense = useMemo(() => {
    const max = Math.max(...weeklyData.map(d => d.expense));
    return max > 0 ? max : 100;
  }, [weeklyData]);

  const maxIncome = useMemo(() => {
    const max = Math.max(...weeklyData.map(d => d.income));
    return max > 0 ? max : 100;
  }, [weeklyData]);

  const maxValue = Math.max(maxExpense, maxIncome);

  // Calculate today's totals for the header
  const todayExpense = weeklyData[todayIndex]?.expense || 0;
  const todayIncome = weeklyData[todayIndex]?.income || 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
      {/* Header with today's totals - Card Section */}
      <View style={[styles.todayCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F3F4F6', borderColor: isDarkMode ? '#333333' : '#E5E7EB' }]}>
        <Text style={[styles.todayTitle, { color: theme.text }]}>Aujourd&apos;hui</Text>

        <View style={styles.totalRow}>
          <View style={styles.totalItem}>
            <View style={[styles.totalDot, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Depenses</Text>
            <Text style={[styles.totalValue, { color: '#ef4444' }]}>{todayExpense.toLocaleString()} Ar</Text>
          </View>

          <View style={styles.totalItem}>
            <View style={[styles.totalDot, { backgroundColor: '#22c55e' }]} />
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Revenus</Text>
            <Text style={[styles.totalValue, { color: '#22c55e' }]}>{todayIncome.toLocaleString()} Ar</Text>
          </View>
        </View>
      </View>


      {/* Chart Area */}
      <View style={styles.chartArea}>
        {weeklyData.map((dayData, index) => (
          <View key={index} style={styles.barColumn}>
            {/* Bars */}
            <View style={styles.barsContainer}>
              <View style={styles.barsSideBySide}>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${(dayData.income / maxValue) * 100}%`, 
                        backgroundColor: '#22c55e',
                      }
                    ]} 
                  />
                </View>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${(dayData.expense / maxValue) * 100}%`, 
                        backgroundColor: '#ef4444',
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
            
            {/* Day label with highlight for today */}
            <View style={[styles.dayLabelContainer, index === todayIndex && { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
              <Text style={[styles.dayLabel, { color: index === todayIndex ? theme.primary : theme.text }]}>{dayData.day}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Legend - Simplified */}
      <View style={[styles.legend, { borderTopColor: theme.border }]}>
        <Text style={[styles.legendTitle, { color: theme.text }]}>Niveau de depense par jour en une semaine</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },

  todayCard: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },

  todayTitle: {

    fontSize: 16,

    fontWeight: '700',

    marginBottom: 12,

  },

  totalRow: {

    flexDirection: 'row',

    justifyContent: 'space-around',

    width: '100%',

  },

  totalItem: {

    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barsContainer: {
    height: 100,
    justifyContent: 'flex-end',
  },
  barsSideBySide: {
    flexDirection: 'row',
    gap: 3,
  },
  barWrapper: {
    width: 14,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 14,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
  },
  dayLabelContainer: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  legend: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});
