import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import ConfirmModal from './ConfirmModal';
import { useWallets } from '../hooks/useWallets';
import { useThemeStore } from '../store/useThemeStore';
import { Wallet } from '../types/wallet';
import EditAutomaticIncomeModal from './EditAutomaticIncomeModal';
import EditWalletModal from './EditWalletModal';

// Mapping des types vers les icônes par défaut
const WALLET_TYPE_ICONS: Record<string, string> = {
  'CASH': 'cash',
  'MOBILE_MONEY': 'phone-portrait',
  'BANK': 'business',
  'DEBT': 'person-remove',
};

export default function WalletList() {
  const { data, isLoading, error, deleteWallet } = useWallets();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'edit' | 'income' | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Get fresh wallet data from the query cache based on selected ID
  const selectedWallet = useMemo(() => {
    if (!selectedWalletId || !data?.values) return null;
    return data.values.find(w => w.id === selectedWalletId) || null;
  }, [selectedWalletId, data?.values]);

  // Clic sur le wallet -> Ouvre EditWalletModal
  const handleWalletPress = useCallback((wallet: Wallet) => {
    setSelectedWalletId(wallet.id);
    setModalType('edit');
  }, []);

  // Bouton pour aller vers AutomaticIncome
  const handleAutomaticIncome = useCallback((wallet: Wallet) => {
    setSelectedWalletId(wallet.id);
    setModalType('income');
  }, []);

  const handleEditWallet = useCallback((wallet: Wallet) => {
    setSelectedWalletId(wallet.id);
    setModalType('edit');
  }, []);

  const handleDeleteWallet = useCallback((wallet: Wallet) => {
    setWalletToDelete(wallet);
  }, []);

  const confirmDelete = useCallback(() => {
    if (walletToDelete) {
      deleteWallet(walletToDelete.id, {
        onSuccess: () => {
          setWalletToDelete(null);
        },
        onError: () => {
          setWalletToDelete(null);
        }
      });
    }
  }, [walletToDelete, deleteWallet]);

  const handleCloseModal = useCallback(() => {
    setSelectedWalletId(null);
    setModalType(null);
  }, []);

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
          Erreur lors du chargement des portefeuilleils
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

          // Utiliser iconRef s'il existe, sinon utiliser le type
          const walletIcon = item.iconRef || WALLET_TYPE_ICONS[item.type] || 'wallet';
          const walletColor = item.color || theme.primary;

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
              onPress={() => handleWalletPress(item)}
              activeOpacity={0.7}
            >
              {/* Icône avec couleur du wallet */}
              <View style={[styles.iconContainer, { backgroundColor: walletColor + '20' }]}>
                <Ionicons 
                  name={walletIcon as any} 
                  size={24} 
                  color={item.isActive ? walletColor : theme.textTertiary} 
                />
              </View>

              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {item.name || 'Sans nom'}
                </Text>
                <Text style={[styles.type, { color: theme.textSecondary }]}>
                  {item.type?.replace('_', ' ') || 'Type inconnu'}
                </Text>
                
{/* Affichage du revenu automatique */}
                {item.walletAutomaticIncome && item.walletAutomaticIncome.type === 'MENSUAL' && (
                   <View style={[styles.incomeBadge, { backgroundColor: theme.success + '15' }]}>
                     <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                     <Text style={[styles.incomeBadgeText, { color: theme.success }]}>
                       Revenu auto activé: {item.walletAutomaticIncome.amount} Ar
                     </Text>
                   </View>
                )}
                {item.walletAutomaticIncome && item.walletAutomaticIncome.type === 'NOT_SPECIFIED' && (
                   <View style={[styles.incomeBadge, { backgroundColor: theme.error + '15' }]}>
                     <Ionicons name="close-circle" size={14} color={theme.error} />
                     <Text style={[styles.incomeBadgeText, { color: theme.error }]}>
                       Revenu auto désactivé
                     </Text>
                   </View>
                )}
              </View>

              <View style={styles.balanceContainer}>
                <View style={styles.actionButtons}>
                  {/* Bouton pour revenu automatique */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.success + '20' }]}
                    onPress={() => handleAutomaticIncome(item)}
                  >
                    <Ionicons name="settings-outline" size={16} color={theme.success} />
                  </TouchableOpacity>
                  {/* Bouton pour supprimer */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                    onPress={() => handleDeleteWallet(item)}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.error} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.balance, { color: walletColor }]}>
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

      {selectedWallet && modalType === 'income' && (
        <EditAutomaticIncomeModal
          visible={true}
          onClose={handleCloseModal}
          wallet={selectedWallet}
        />
      )}

      {selectedWallet && modalType === 'edit' && (
        <EditWalletModal
          visible={true}
          onClose={handleCloseModal}
          wallet={selectedWallet}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={!!walletToDelete}
        title="Supprimer le portefeuille"
        message={`Êtes-vous sûr de vouloir supprimer "${walletToDelete?.name}"? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDelete}
        onCancel={() => setWalletToDelete(null)}
        isDestructive={true}
      />
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
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
