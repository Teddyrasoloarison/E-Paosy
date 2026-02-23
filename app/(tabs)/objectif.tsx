import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../../src/hooks/useGoals';
import { GoalCard } from '../../src/components/GoalCard';
import CreateGoalModal from '../../src/components/CreateGoalModal';
import EditGoalModal from '../../src/components/EditGoalModal';
import { GoalItem } from '../../src/types/goal';

export default function ObjectifScreen() {
  const { goals, isLoading } = useGoals();
  const [isCreateVisible, setCreateVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);

  return (
    <DashboardShell title="Objectifs" subtitle="Suivi de vos objectifs financiers">
      
      {/* Liste des objectifs */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#1B5E20" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={goals}
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
              <Ionicons name="trophy-outline" size={60} color="#DFEADF" />
              <Text style={styles.emptyText}>Aucun objectif défini pour le moment.</Text>
            </View>
          }
        />
      )}

      {/* Bouton Flottant (FAB) pour ajouter */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setCreateVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modales */}
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
    paddingBottom: 100, // Espace pour le FAB
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#58725F',
    marginTop: 15,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1B5E20',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});