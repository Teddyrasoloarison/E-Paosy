import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import WalletList from '../../src/components/WalletList';
import CreateWalletModal from '../../src/components/CreateWalletModal';

export default function PortfeuilleScreen() {
  const accountId = useAuthStore((state) => state.accountId);
  // État pour contrôler la visibilité de la modale de création
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <DashboardShell 
      title="E-PAOSY" 
      subtitle="Gestion de vos comptes et portefeuilles"
    >
      
      {/* Badge d'identification du compte */}
      <View style={styles.accountBadge}>
        <Ionicons name="person-circle-outline" size={14} color="#2E7D32" />
        <Text style={styles.accountText}>
          ID: {accountId ? accountId.slice(0, 13) : '---'}...
        </Text>
      </View>

      {/* Section Liste des Wallets */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Portefeuilles</Text>
          <Ionicons name="wallet-outline" size={20} color="#666" />
        </View>
        
        {/* On laisse WalletList gérer sa propre liste ou son chargement */}
        <View style={{ flex: 1 }}>
          <WalletList />
        </View>
      </View>

      {/* Bouton Flottant (FAB) - Identique à ObjectifScreen */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Composant Modale pour l'ajout */}
      <CreateWalletModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 10,
  },
  accountBadge: { 
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    marginTop: -5,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  accountText: { 
    color: '#2E7D32', 
    fontSize: 12, 
    fontWeight: '700',
    marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1B5E20', // Vert E-PAOSY
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