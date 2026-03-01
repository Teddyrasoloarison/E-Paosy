import DashboardShell from '@/components/dashboard-shell';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useWallets } from '@/src/hooks/useWallets';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import CreateGoalModal from '../../src/components/CreateGoalModal';
import CreateLabelModal from '../../src/components/CreateLabelModal';
import CreateTransactionModal from '../../src/components/CreateTransactionModal';
import CreateWalletModal from '../../src/components/CreateWalletModal';
import { useModernAlert } from '../../src/hooks/useModernAlert';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function DashboardScreen() {
  const router = useRouter();
  const username = useAuthStore((state) => state.username);
  const { wallets } = useWallets();
  const { transactions } = useTransactions();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { show } = useModernAlert();

  // Animation refs
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const quickActionsAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animations on mount
    Animated.sequence([
      Animated.timing(welcomeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(quickActionsAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(statsAnim, {
          toValue: 1,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(activityAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        show({
          title: 'Quitter l\'application',
          message: 'Est-ce que tu veux vraiment quitter ?',
          type: 'confirm',
          buttons: [
            {
              text: 'Annuler',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Quitter',
              onPress: () => BackHandler.exitApp(),
              style: 'destructive',
            },
          ]
        });
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [show])
  );

  // States for modals
  const [isTransactionModalVisible, setTransactionModalVisible] = useState(false);
  const [isGoalModalVisible, setGoalModalVisible] = useState(false);
  const [isLabelModalVisible, setLabelModalVisible] = useState(false);
  const [isWalletModalVisible, setWalletModalVisible] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Filter wallets by active status
  const activeWallets = wallets.filter(w => w.isActive === true);
  const inactiveWallets = wallets.filter(w => w.isActive === false);
  const activeWalletsCount = activeWallets.length;
  const inactiveWalletsCount = inactiveWallets.length;
  
  // Calculate total balance only from active wallets
  const totalBalance = activeWallets.reduce((sum, w) => sum + (w.amount || 0), 0);
  
  // Check if balance is negative for warning display
  const isNegativeBalance = totalBalance < 0;
  
  // Get last 5 transactions for activity section (when expanded)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, showAllActivities ? 5 : 3);

  const handleNewTransaction = () => {
    setTransactionModalVisible(true);
  };

  const handleNewGoal = () => {
    setGoalModalVisible(true);
  };

  const handleNewLabel = () => {
    setLabelModalVisible(true);
  };

  const handleNewWallet = () => {
    setWalletModalVisible(true);
  };

  const handleViewAllActivities = () => {
    setShowAllActivities(!showAllActivities);
  };

  // Animation styles
  const getAnimStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [{
      translateY: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
      }),
    }],
  });

  return (
    <DashboardShell title="Dashboard" subtitle={`Bienvenue, ${username ?? ''}`.trim()} icon="bar-chart-outline">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Card - Animated */}
        <Animated.View style={[styles.welcomeCard, getAnimStyle(welcomeAnim), { backgroundColor: isNegativeBalance ? theme.error : theme.primary }]}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Solde Total</Text>
            <Text style={styles.balanceText}>{totalBalance.toLocaleString('fr-FR')} Ar</Text>
            <Text style={styles.welcomeSubtext}>{activeWalletsCount} portefeuille(s) actif(s)</Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Ionicons name="wallet" size={48} color="rgba(255,255,255,0.2)" />
          </View>
          {isNegativeBalance && (
            <View style={styles.warningBadge}>
              <Ionicons name="warning" size={14} color="#FFFFFF" />
              <Text style={styles.warningText}>Attention</Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions - Animated */}
        <Animated.View style={[getAnimStyle(quickActionsAnim)]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions rapides</Text>
          </View>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.accent + '15' }]}
              onPress={handleNewTransaction}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical-outline" size={28} color={theme.accent} />
              <Text style={[styles.actionText, { color: theme.text }]}>Nouvelle</Text>
              <Text style={[styles.actionTextSmall, { color: theme.text }]}>transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.primary + '15' }]}
              onPress={handleNewLabel}
              activeOpacity={0.7}
            >
              <Ionicons name="pricetags-outline" size={28} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Creer</Text>
              <Text style={[styles.actionTextSmall, { color: theme.text }]}>label</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: theme.accentOrange + '15' }]}
              onPress={handleNewWallet}
              activeOpacity={0.7}
            >
              <Ionicons name="wallet-outline" size={28} color={theme.accentOrange} />
              <Text style={[styles.actionText, { color: theme.text }]}>Nouveau</Text>
              <Text style={[styles.actionTextSmall, { color: theme.text }]}>portefeuille</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Statistics Cards - Animated */}
        <Animated.View style={[getAnimStyle(statsAnim)]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>État des revenus automatique</Text>
          </View>
          <View style={styles.statsRow}>
            {/* Active Wallets Card */}
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIcon, { backgroundColor: theme.success + '20' }]}>
                  <Ionicons name="play-circle-outline" size={18} color={theme.success} />
                </View>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Activé ({activeWalletsCount})</Text>
              </View>
              {activeWalletsCount > 0 ? (
                <View style={styles.walletNamesList}>
                  {activeWallets.slice(0, 3).map((wallet) => (
                    <View key={wallet.id} style={styles.walletNameItem}>
                      <View style={[styles.walletDot, { backgroundColor: theme.success }]} />
                      <Text style={[styles.walletNameText, { color: theme.text }]} numberOfLines={1}>
                        {wallet.name}
                      </Text>
                    </View>
                  ))}
                  {activeWalletsCount > 3 && (
                    <Text style={[styles.moreText, { color: theme.textTertiary }]}>
                      +{activeWalletsCount - 3} plus
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Aucun portefeuille actif.</Text>
              )}
            </View>
            
            {/* Inactive Wallets Card */}
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIcon, { backgroundColor: theme.textTertiary + '20' }]}>
                  <Ionicons name="pause-circle-outline" size={18} color={theme.textTertiary} />
                </View>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Désactivé ({inactiveWalletsCount})</Text>
              </View>
              {inactiveWalletsCount > 0 ? (
                <View style={styles.walletNamesList}>
                  {inactiveWallets.slice(0, 3).map((wallet) => (
                    <View key={wallet.id} style={styles.walletNameItem}>
                      <View style={[styles.walletDot, { backgroundColor: theme.textTertiary }]} />
                      <Text style={[styles.walletNameText, { color: theme.text }]} numberOfLines={1}>
                        {wallet.name}
                      </Text>
                    </View>
                  ))}
                  {inactiveWalletsCount > 3 && (
                    <Text style={[styles.moreText, { color: theme.textTertiary }]}>
                      +{inactiveWalletsCount - 3} plus
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Aucun portefeuille inactif.</Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Recent Activity Section - Animated */}
        <Animated.View style={[getAnimStyle(activityAnim)]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Transaction recente</Text>
          </View>
          <View style={[styles.activitySection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.activityHeader}>
              <View style={styles.activityTitleRow}>
              </View>
              <TouchableOpacity onPress={handleViewAllActivities}>
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  {showAllActivities ? 'Réduire' : 'Voir tout'}
                </Text>
              </TouchableOpacity>
            </View>

            {recentTransactions.length > 0 ? (
              <View style={styles.activityList}>
                {recentTransactions.map((transaction, index) => {
                  const isIncome = transaction.type?.toString().trim().toUpperCase() === 'IN';
                  const wallet = wallets.find(w => w.id === transaction.walletId);
                  const walletName = wallet?.name || 'Portefeuille';
                  return (
                    <View 
                      key={transaction.id} 
                      style={[
                        styles.activityItem, 
                        { borderBottomColor: theme.border },
                        index === recentTransactions.length - 1 && styles.noBorder
                      ]}
                    >
                      <View style={[styles.activityIcon, { backgroundColor: (isIncome ? theme.success : theme.error) + '15' }]}>
                        <Ionicons 
                          name={isIncome ? 'arrow-down' : 'arrow-up'} 
                          size={16} 
                          color={isIncome ? theme.success : theme.error} 
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={[styles.activityDesc, { color: theme.text }]} numberOfLines={1}>
                          {transaction.description || 'Transaction'}
                        </Text>
                        <View style={styles.activityMeta}>
                          <Text style={[styles.activityDate, { color: theme.textTertiary }]}>
                            {transaction.date ? new Date(transaction.date).toLocaleDateString('fr-FR') : ''}
                          </Text>
                          <View style={styles.walletRow}>
                            <Ionicons name="wallet-outline" size={10} color={theme.textTertiary} />
                            <Text style={[styles.walletName, { color: theme.textTertiary }]}>
                              {walletName}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.activityAmount, { color: isIncome ? theme.success : theme.error }]}>
                        {isIncome ? '' : '-'}{Math.abs(Number(transaction.amount)).toLocaleString()} Ar
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="receipt-outline" size={32} color={theme.textTertiary} />
                <Text style={[styles.emptyActivityText, { color: theme.textSecondary }]}>
                 Aucune activite recente
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Chart section - Animated */}
        <Animated.View style={[getAnimStyle(chartAnim)]}>
          <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>Analyse des depenses</Text>
              <Ionicons name="trending-up" size={24} color={theme.primary} />
            </View>
            <View style={[styles.chartPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
              <Ionicons name="bar-chart-outline" size={40} color={theme.textTertiary} />
              <Text style={[styles.chartPlaceholderText, { color: theme.textTertiary }]}>
                Visualisation des depenses a venir
              </Text>
            </View>
          </View>
        </Animated.View>

      </ScrollView>

      {/* Modals */}
      <CreateTransactionModal 
        visible={isTransactionModalVisible} 
        onClose={() => setTransactionModalVisible(false)} 
      />
      
      <CreateGoalModal 
        visible={isGoalModalVisible} 
        onClose={() => setGoalModalVisible(false)} 
      />
      
      <CreateLabelModal 
        visible={isLabelModalVisible} 
        onClose={() => setLabelModalVisible(false)} 
      />
      
      <CreateWalletModal
        visible={isWalletModalVisible} 
        onClose={() => setWalletModalVisible(false)} 
      />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingBottom: 30,
    paddingTop: 8,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 4,
  },
  welcomeSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  welcomeIcon: {
    opacity: 0.8,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionTextSmall: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statValue: { 
    fontSize: 18, 
    fontWeight: '700',
  },
  statLabel: { 
    fontSize: 13,
  },
  statSubValue: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statSubValueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  walletNamesList: {
    gap: 8,
  },
  walletNameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  walletNameText: {
    fontSize: 13,
    flex: 1,
  },
  moreText: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  activitySection: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityList: {
    gap: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyActivityText: {
    marginTop: 8,
    fontSize: 14,
  },
  chartCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' },
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  chartPlaceholderText: { 
    fontSize: 13,
    textAlign: 'center',
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  walletName: {
    fontSize: 11,
  },
  warningBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
