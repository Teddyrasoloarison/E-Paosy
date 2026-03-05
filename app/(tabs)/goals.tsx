import React, { useState } from 'react'; // Ajout de useState
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoalList from '../../src/components/GoalList';
import AddGoalModal from '../../src/components/AddGoalModal'; // Import de ta nouvelle modale
import { Ionicons } from '@expo/vector-icons';

export default function GoalsScreen() {
  // État pour gérer la visibilité de la modale
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Mes Objectifs',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setIsModalVisible(true)} // Ouvre la modale
              style={{ marginRight: 15 }}
            >
              <Ionicons name="add-circle" size={28} color="#4CAF50" />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.headerContent}>
        <Text style={styles.title}>Objectifs Financiers</Text>
        <Text style={styles.subtitle}>Suivez vos progrès au quotidien</Text>
      </View>

      {/* Liste des objectifs */}
      <GoalList />

      {/* Modale d'ajout d'objectif */}
      <AddGoalModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});