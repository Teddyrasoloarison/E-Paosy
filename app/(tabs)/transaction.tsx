import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import TransactionList from '../../src/components/TransactionList'; // Ajuste selon ton dossier
import CreateTransactionModal from '../../src/components/CreateTransactionModal';

export default function TransactionScreen() {
  const [isCreateVisible, setCreateVisible] = useState(false);

  return (
    <DashboardShell title="Transactions" subtitle="Suivi de vos flux financiers">
      
      {/* La liste gère ses propres filtres et son chargement */}
      <View style={styles.container}>
        <TransactionList />
      </View>

      {/* Bouton Flottant pour ajouter une transaction */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setCreateVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modale de création */}
      <CreateTransactionModal 
        visible={isCreateVisible} 
        onClose={() => setCreateVisible(false)} 
      />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
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