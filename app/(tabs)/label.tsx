import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLabels } from '@/src/hooks/useLabels';
import { Ionicons } from '@expo/vector-icons';
import CreateLabelModal from '@/src/components/CreateLabelModal';
import LabelList from '@/src/components/LabelList'; // Utilisation du composant liste qu'on a créé

export default function LabelsTab() {
  const { isLoading } = useLabels();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* HEADER : Titre + Bouton Ajouter */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes Labels</Text>
          <Text style={styles.subtitle}>Organisez vos transactions</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* LISTE DES LABELS */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <LabelList />
      )}

      {/* MODALE DE CRÉATION */}
      <CreateLabelModal 
        visible={createModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Fond gris très léger pour faire ressortir les cartes blanches
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Ajuste selon le safe area de ton app
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});