import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useWallets } from '../hooks/useWallets'; 
import { Ionicons } from '@expo/vector-icons';
import { Wallet } from '../types/wallet';
import EditAutomaticIncomeModal from './EditAutomaticIncomeModal';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../store/useThemeStore';

export default function WalletList() {
  const { data, isLoading, error } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Sort wallets by creation date (newest first - based on id)
  const sortedWallets = useMemo(() => {
    if (!data?.values) return [];
    return [...data.values].sort((a, b) => b.id.localeCompare(a.id));
  }, [data?.values]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <View style={[styles.errorIcon, { backgroundColor: theme.error + '15' }]}>
          <Ionicons name="alert-circle" size={28} color={theme.error} />
        </View>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Erreur lors du chargement des portefeuillets
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={sortedWallets}
        keyExtractor={(item, index) => item?.id || index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (!item) return null;

          return (
            <TouchableOpacity 
              style={[
                styles.walletCard, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: theme.border,
                },
                !item.isActive && { opacity: 0.6 }
              ]}
              onPress={() => setSelectedWallet(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons 
                  name={item.type === 'BANK' ? 'business' : 'wallet-outline'} 
                  size={24} 
                  color={item.isActive ? theme.primary : theme.textTertiary} 
                />
              </View>

              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {item.name || 'Sans nom'}
                </Text>
                <Text style={[styles.type, { color: theme.textSecondary }]}>
                  {item.type?.replace('_', ' ') || 'Type inconnu'}
                </Text>
                
                {item.walletAutomaticIncome && (
                   <View style={[styles.incomeBadge, { backgroundColor: theme.success + '15' }]}>
                     <Ionicons name="refresh-circle" size={14} color={theme.success} />
                     <Text style={[styles.incomeBadgeText, { color: theme.success }]}>
                       Auto: {item.walletAutomaticIncome.amount} Ar
                     </Text>
                   </View>
                )}
              </View>

              <View style={styles.balanceContainer}>
                <Text style={[styles.balance, { color: theme.primary }]}>
                  {(item.amount ?? 0).toLocaleString()} Ar
                </Text>
                {!item.isActive && (
                  <Text style={[styles.inactiveTag, { color: theme.error }]}>Inactif</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="wallet-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun portefeuille</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Creez votre premier portefeuille pour commencer
            </Text>
          </View>
        }
      />

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
  listContainer: { 
    paddingVertical: 10,
    paddingBottom: 100,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 1,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { 
    flex: 1, 
    marginLeft: 14,
  },
  name: { 
    fontSize: 16, 
    fontWeight: '700',
  },
  type: { 
    fontSize: 13, 
    textTransform: 'capitalize',
    marginTop: 2,
  },
  balanceContainer: { 
    alignItems: 'flex-end',
  },
  balance: { 
    fontSize: 17, 
    fontWeight: '800',
  },
  inactiveTag: { 
    fontSize: 11, 
    fontWeight: '700',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  incomeBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  incomeBadgeText: { 
    fontSize: 11, 
    marginLeft: 4, 
    fontWeight: '600' 
  }
});
