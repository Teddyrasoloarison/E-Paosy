import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../../src/hooks/useGoals';
import { GoalCard } from '../../src/components/GoalCard';
import CreateGoalModal from '../../src/components/CreateGoalModal';
import EditGoalModal from '../../src/components/EditGoalModal';
import { GoalItem } from '../../src/types/goal';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function ObjectifScreen() {
  const { goals, isLoading } = useGoals();
  const [isCreateVisible, setCreateVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Sort goals by creation date (newest first - based on id)
  const sortedGoals = useMemo(() => {
    if (!goals) return [];
    return [...goals].sort((a, b) => b.id.localeCompare(a.id));
  }, [goals]);

  return (
    <DashboardShell title="Objectifs" subtitle="Suivez vos objectifs financiers">
      
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={sortedGoals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <GoalCard 
              goal={item} 
              onPress={() => setSelectedGoal(item)} 
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="trophy-outline" size={50} color={theme.primary} />
              </View>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                Aucun objectif défini pour le moment.
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Commencez à épargner pour réaliser vos rêves !
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]} 
        onPress={() => setCreateVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateGoalModal 
        visible={isCreateVisible} 
        onClose={() => setCreateVisible(false)} 
      />

      {selectedGoal && (
        <EditGoalModal 
          visible={!!selectedGoal}
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
        />
      )}
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0px 4px 12px rgba(13, 148, 136, 0.3)' },
    }),
  },
});
