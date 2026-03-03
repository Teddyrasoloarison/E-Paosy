import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { GoalItem } from '../types/goal';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../store/useThemeStore';
import { useGoals } from '../hooks/useGoals';
import { useWallets } from '../hooks/useWallets';
import EditGoalModal from './EditGoalModal';
import ConfirmModal from './ConfirmModal';

interface Props {
  goal: GoalItem;
  onPress: () => void;
}

export const GoalCard = ({ goal, onPress }: Props) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { archiveGoal, isArchiving } = useGoals();
  const { wallets } = useWallets();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const progress = Math.min((goal.currentAmount || 0) / goal.amount, 1);
  const isExpired = new Date(goal.endingDate) < new Date();
  
  // Find wallet name
  const wallet = wallets.find(w => w.id === goal.walletId);
  const walletName = wallet?.name || 'Portefeuille';

  const handleDelete = () => {
    archiveGoal(
      { walletId: goal.walletId, goalId: goal.id },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
        },
      }
    );
  };

  return (
    <>
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
            <View style={styles.titleTextContainer}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{goal.name}</Text>
              <Text style={[styles.dates, { color: theme.textTertiary }]}>
                jusqu&apos;au {format(new Date(goal.endingDate), 'dd/MM/yy')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.amountRow}>
          <View style={styles.amountInfo}>
            <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>Objectif</Text>
            <Text style={[styles.amount, { color: goal.color || theme.primary }]}>
              {goal.amount.toLocaleString()} Ar
            </Text>
          </View>
          <View style={[styles.walletInfo, { backgroundColor: (goal.color || theme.primary) + '20' }]}>
            <Ionicons name="wallet-outline" size={14} color={goal.color || theme.primary} />
            <Text style={[styles.walletName, { color: goal.color || theme.primary }]} numberOfLines={1}>
              {walletName}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.primary + '15' }]} 
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="pencil" size={14} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.error + '15' }]} 
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={14} color={theme.error} />
            <Text style={[styles.actionText, { color: theme.error }]}>Supprimer</Text>
          </TouchableOpacity>
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

      <EditGoalModal 
        visible={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        goal={goal} 
      />

      <ConfirmModal
        visible={showDeleteModal}
        title="Supprimer l'objectif"
        message={`Êtes-vous sûr de vouloir supprimer "${goal.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        isDestructive={true}
      />
    </>
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconContainer: { padding: 10, borderRadius: 12 },
  name: { fontSize: 16, fontWeight: 'bold' },
  dates: { fontSize: 11, marginTop: 2 },
  titleTextContainer: { flex: 1 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  amountInfo: { flex: 1 },
  amountLabel: { fontSize: 11, marginBottom: 2 },
  amount: { fontSize: 18, fontWeight: '900' },
  walletInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  walletName: { fontSize: 12, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    paddingVertical: 10, 
    borderRadius: 10 
  },
  actionText: { fontSize: 13, fontWeight: '600' },
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
