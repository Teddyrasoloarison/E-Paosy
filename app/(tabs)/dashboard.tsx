import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import WalletList from '../../src/components/WalletList';
import CreateWalletModal from '../../src/components/CreateWalletModal';

export default function DashboardScreen() {
  const accountId = useAuthStore((state) => state.accountId);
  // État pour contrôler la visibilité de la modale de création
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header avec Titre et Bouton Ajouter */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>E-PAOSY</Text>
          <View style={styles.accountBadge}>
            <Text style={styles.accountText}>ID: {accountId?.slice(0, 13)}...</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Section Liste des Wallets */}
      <View style={{ flex: 1 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Portefeuilles</Text>
          <Ionicons name="wallet-outline" size={20} color="#666" />
        </View>
        
        <WalletList />
      </View>

      {/* Composant Modale (POST logic) */}
      <CreateWalletModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#F8F9FA' 
  },
  header: { 
    marginTop: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 40 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1B5E20',
    letterSpacing: 1
  },
  accountBadge: { 
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start'
  },
  accountText: { 
    color: '#2E7D32', 
    fontSize: 11, 
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  addButton: { 
    backgroundColor: '#4CAF50', 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center',
    // Ombre
    elevation: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  }
});