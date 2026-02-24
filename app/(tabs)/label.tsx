import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLabels } from '@/src/hooks/useLabels';
import { Ionicons } from '@expo/vector-icons';
import CreateLabelModal from '@/src/components/CreateLabelModal';
import LabelList from '@/src/components/LabelList'; // Utilisation du composant liste qu'on a créé
import DashboardShell from '@/components/dashboard-shell';

export default function LabelsTab() {
  const { isLoading } = useLabels();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  return (
    <DashboardShell title="Labels" subtitle="Organisez vos transactions">
      {/* bouton flottant + liste */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <LabelList />
      )}

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setCreateModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODALE DE CRÉATION */}
      <CreateLabelModal 
        visible={createModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
      />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // background color already provided by DashboardShell
  },
  header: {
    // header replaced by DashboardShell
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