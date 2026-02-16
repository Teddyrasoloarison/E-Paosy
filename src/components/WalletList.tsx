import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useWallets } from '../hooks/useWallets'; 
import { Ionicons } from '@expo/vector-icons';

export default function WalletList() {
  const { data, isLoading, error } = useWallets();

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
    <FlatList
      data={data?.values}
      keyExtractor={(item, index) => item?.id || index.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => {
        // Protection si l'item est nul
        if (!item) return null;

        return (
          <View style={[styles.walletCard, !item.isActive && styles.inactiveCard]}>
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
            </View>

            <View style={styles.balanceContainer}>
              <Text style={styles.balance}>
                {/* ✅ CORRECTION : Utilisation de 'amount' au lieu de 'balance' */}
                {(item.amount ?? 0).toLocaleString()} Ar
              </Text>
              {!item.isActive && <Text style={styles.inactiveTag}>Inactif</Text>}
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>Aucun portefeuille disponible.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
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
  empty: { textAlign: 'center', color: '#999' }
});