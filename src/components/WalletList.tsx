import React, { useState } from 'react'; // Ajout de useState
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useWallets } from '../hooks/useWallets'; 
import { Ionicons } from '@expo/vector-icons';
import { Wallet } from '../types/wallet'; // Import du type
import EditAutomaticIncomeModal from './EditAutomaticIncomeModal'; // Import de la nouvelle modale

export default function WalletList() {
  const { data, isLoading, error } = useWallets();
  
  // État pour gérer la modale et le wallet sélectionné
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Erreur lors du chargement des portefeuilles</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data?.values}
        keyExtractor={(item, index) => item?.id || index.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          if (!item) return null;

          return (
            <TouchableOpacity 
              style={[styles.walletCard, !item.isActive && styles.inactiveCard]}
              onPress={() => setSelectedWallet(item)} // Ouvre la modale au clic
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={item.type === 'BANK' ? 'business' : 'wallet-outline'} 
                  size={24} 
                  color={item.isActive ? "#4CAF50" : "#999"} 
                />
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{item.name || 'Sans nom'}</Text>
                <Text style={styles.type}>{item.type?.replace('_', ' ') || 'Type inconnu'}</Text>
                
                {/* Petit indicateur si un revenu auto est déjà configuré */}
                {item.walletAutomaticIncome && (
                   <View style={styles.incomeBadge}>
                     <Ionicons name="refresh-circle" size={14} color="#2E7D32" />
                     <Text style={styles.incomeBadgeText}>Auto: {item.walletAutomaticIncome.amount} Ar</Text>
                   </View>
                )}
              </View>

              <View style={styles.balanceContainer}>
                <Text style={styles.balance}>
                  {(item.amount ?? 0).toLocaleString()} Ar
                </Text>
                {!item.isActive && <Text style={styles.inactiveTag}>Inactif</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.empty}>Aucun portefeuille disponible.</Text>
          </View>
        }
      />

      {/* Rendu conditionnel de la modale */}
      {selectedWallet && (
        <EditAutomaticIncomeModal 
          visible={!!selectedWallet} 
          onClose={() => setSelectedWallet(null)} 
          wallet={selectedWallet} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... tes styles précédents ...
  listContainer: { paddingVertical: 10 },
  center: { alignItems: 'center', marginTop: 30 },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inactiveCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  iconContainer: {
    width: 45,
    height: 45,
    backgroundColor: '#F1F8E9',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  type: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  balanceContainer: { alignItems: 'flex-end' },
  balance: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  inactiveTag: { fontSize: 10, color: '#E64A19', fontWeight: 'bold' },
  error: { color: '#D32F2F', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#999' },
  
  // Nouveaux styles pour le badge de revenu auto
  incomeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  incomeBadgeText: { fontSize: 10, color: '#2E7D32', marginLeft: 4, fontWeight: '500' }
});