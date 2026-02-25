import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { GoalItem } from '../types/goal';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  goal: GoalItem;
  onPress: () => void;
}

export const GoalCard = ({ goal, onPress }: Props) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const progress = Math.min((goal.currentAmount || 0) / goal.amount, 1);
  const isExpired = new Date(goal.endingDate) < new Date();

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconContainer, { backgroundColor: (goal.color || theme.primary) + '20' }]}>
            <Ionicons name={(goal.iconRef as any) || 'flag-outline'} size={20} color={goal.color || theme.primary} />
          </View>
          <View>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{goal.name}</Text>
            <Text style={[styles.dates, { color: theme.textTertiary }]}>
              jusqu&apos;au {format(new Date(goal.endingDate), 'dd/MM/yy')}
            </Text>
          </View>
        </View>
        <Text style={[styles.amount, { color: goal.color || theme.primary }]}>
          {goal.amount.toLocaleString()} Ar
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.backgroundSecondary }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progress * 100}%`, backgroundColor: goal.color || theme.primary }
            ]} 
          />
        </View>
        
        <View style={styles.progressInfo}>
          <Text style={[styles.currentAmount, { color: theme.textSecondary }]}>
            { (goal.currentAmount || 0).toLocaleString() } Ar épargnes
          </Text>
          <Text style={[styles.percentage, { color: goal.color || theme.primary }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>

      {isExpired && progress < 1 && (
        <View style={[styles.expiredBadge, { backgroundColor: theme.error + '15' }]}>
          <Text style={[styles.expiredText, { color: theme.error }]}>Delai depasse</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    padding: 16, 
    borderRadius: 16, 
    marginVertical: 8, 
    marginHorizontal: 15,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' },
    }),
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { padding: 10, borderRadius: 12 },
  name: { fontSize: 16, fontWeight: 'bold' },
  dates: { fontSize: 11, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '900' },
  progressSection: { marginTop: 5 },
  progressBarBackground: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  currentAmount: { fontSize: 12 },
  percentage: { fontSize: 13, fontWeight: 'bold' },
  expiredBadge: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  expiredText: { fontSize: 10, fontWeight: 'bold' }
});
