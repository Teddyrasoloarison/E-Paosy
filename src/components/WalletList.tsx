import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import ConfirmModal from './ConfirmModal';
import { useWallets, useWalletStatistics } from '../hooks/useWallets';
import { useThemeStore } from '../store/useThemeStore';
import { Wallet } from '../types/wallet';
import EditWalletModal from './EditWalletModal';

// Mapping des types vers les icônes par défaut
const WALLET_TYPE_ICONS: Record<string, string> = {
  'CASH': 'cash',
  'MOBILE_MONEY': 'phone-portrait',
  'BANK': 'business',
  'DEBT': 'person-remove',
};

// Modal pour afficher les statistiques
function WalletStatisticsModal({ 
  visible, 
  onClose, 
  wallet 
}: { 
  visible: boolean; 
  onClose: () => void; 
  wallet: Wallet | null;
}) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const { data: statistics, isLoading } = useWalletStatistics(wallet?.id || '');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.statsContent, { backgroundColor: theme.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          
          <View style={styles.statsHeader}>
            <View style={[styles.statsIcon, { backgroundColor: (wallet?.color || theme.primary) + '20' }]}>
              <Ionicons name="stats-chart" size={24} color={wallet?.color || theme.primary} />
            </View>
            <View style={styles.statsTitleContent}>
              <Text style={[styles.statsTitle, { color: theme.text }]}>Statistiques</Text>
              <Text style={[styles.statsSubtitle, { color: theme.textSecondary }]}>
                {wallet?.name}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.statsGrid}>
              {/* Solde actuel */}
              <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="wallet" size={24} color={theme.primary} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Solde actuel</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {(statistics?.currentBalance ?? 0).toLocaleString()} Ar
                </Text>
              </View>

              {/* Nombre de transactions */}
              <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="receipt" size={24} color={theme.primary} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Transactions</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {statistics?.transactionCount ?? 0}
                </Text>
              </View>

              {/* Total des revenus */}
              <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="arrow-down-circle" size={24} color={theme.success} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total revenus</Text>
                <Text style={[styles.statValue, { color: theme.success }]}>
                  {(statistics?.totalIncome ?? 0).toLocaleString()} Ar
                </Text>
              </View>

              {/* Total des dépenses */}
              <View style={[styles.statCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="arrow-up-circle" size={24} color={theme.error} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total dépenses</Text>
                <Text style={[styles.statValue, { color: theme.error }]}>
                  {(statistics?.totalExpense ?? 0).toLocaleString()} Ar
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.closeBtn, { backgroundColor: theme.primary }]} 
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function WalletList() {
  const { data, isLoading, error, deleteWallet } = useWallets();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'edit' | 'statistics' | null>(null);
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

  // Sort wallets by creation date (newest first)
  const sortedWallets = useMemo(() => {
    if (!data?.values) return [];
    return [...data.values].sort((a, b) => {
      // If createdAt exists, use it for sorting (newest first)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Fallback: use id for sorting (newest first based on UUID)
      return b.id.localeCompare(a.id);
    });
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
                {item.walletAutomaticIncome && item.walletAutomaticIncome.type !== 'NOT_SPECIFIED' && (
                   <View style={[styles.incomeBadge, { backgroundColor: theme.success + '15' }]}>
                     <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                     <Text style={[styles.incomeBadgeText, { color: theme.success }]}>
                       {item.walletAutomaticIncome.type === 'DAILY' ? `Revenu auto quotidien: ${item.walletAutomaticIncome.amount} Ar`
                         : item.walletAutomaticIncome.type === 'MENSUAL' ? `Revenu auto mensuel: ${item.walletAutomaticIncome.amount} Ar`
                         : item.walletAutomaticIncome.type === 'YEARLY' ? `Revenu auto annuel: ${item.walletAutomaticIncome.amount} Ar`
                         : null}
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
                {/* 3 boutons côte à côte en haut à droite */}
                <View style={styles.topRightActions}>
                  {/* Bouton pour modifier le portefeuille */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                    onPress={() => handleEditWallet(item)}
                  >
                    <Ionicons name="pencil" size={16} color={theme.primary} />
                  </TouchableOpacity>
                  {/* Bouton pour voir les statistiques */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.info + '20' }]}
                    onPress={() => {
                      setSelectedWalletId(item.id);
                      setModalType('statistics');
                    }}
                  >
                    <Ionicons name="stats-chart" size={16} color={theme.info} />
                  </TouchableOpacity>
                  {/* Bouton pour supprimer */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                    onPress={() => handleDeleteWallet(item)}
                  >
                    <Ionicons name="trash" size={16} color={theme.error} />
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

      {selectedWallet && modalType === 'edit' && (
        <EditWalletModal
          visible={true}
          onClose={handleCloseModal}
          wallet={selectedWallet}
        />
      )}

      {/* Statistics Modal */}
      {selectedWallet && modalType === 'statistics' && (
        <WalletStatisticsModal
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
    paddingTop: 5,
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
  },
  topActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bottomActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  // Styles pour le modal des statistiques
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  statsContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '80%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsTitleContent: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  statsSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeBtn: {
    padding: 16,
    borderRadius: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
