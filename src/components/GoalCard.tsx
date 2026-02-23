import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { GoalItem } from '../types/goal';

interface Props {
  goal: GoalItem;
  onPress: () => void; // On ajoute une prop pour gérer le clic vers l'édition
}

export const GoalCard = ({ goal, onPress }: Props) => {
  // Calcul du pourcentage
  const progress = Math.min((goal.currentAmount || 0) / goal.amount, 1);
  const isExpired = new Date(goal.endingDate) < new Date();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconContainer, { backgroundColor: goal.color + '20' }]}>
            <Ionicons name={goal.iconRef as any} size={20} color={goal.color} />
          </View>
          <View>
            <Text style={styles.name}>{goal.name}</Text>
            <Text style={styles.dates}>
              jusqu'au {format(new Date(goal.endingDate), 'dd/MM/yy')}
            </Text>
          </View>
        </View>
        <Text style={[styles.amount, { color: goal.color }]}>
          {goal.amount.toLocaleString()} Ar
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progress * 100}%`, backgroundColor: goal.color }
            ]} 
          />
        </View>
        
        <View style={styles.progressInfo}>
          <Text style={styles.currentAmount}>
            { (goal.currentAmount || 0).toLocaleString() } Ar épargnés
          </Text>
          <Text style={[styles.percentage, { color: goal.color }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>

      {isExpired && progress < 1 && (
        <View style={styles.expiredBadge}>
          <Text style={styles.expiredText}>Délai dépassé</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 16, 
    marginVertical: 8, 
    marginHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { padding: 10, borderRadius: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  dates: { fontSize: 11, color: '#999', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '900' },
  progressSection: { marginTop: 5 },
  progressBarBackground: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  currentAmount: { fontSize: 12, color: '#666' },
  percentage: { fontSize: 13, fontWeight: 'bold' },
  expiredBadge: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: '#FFEBEE', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  expiredText: { color: '#C62828', fontSize: 10, fontWeight: 'bold' }
});