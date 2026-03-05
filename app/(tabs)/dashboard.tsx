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

  useEffect(() => {
    Animated.sequence([
      Animated.timing(welcomeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(quickActionsAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(statsAnim, { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
      ]),
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
            { text: 'Annuler', onPress: () => {}, style: 'cancel' },
            { text: 'Quitter', onPress: () => BackHandler.exitApp(), style: 'destructive' },
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
  const [showAllActiveWallets, setShowAllActiveWallets] = useState(false);
  const [showAllInactiveWallets, setShowAllInactiveWallets] = useState(false);

  const activeWallets = wallets.filter(w => w.isActive === true);
  const inactiveWallets = wallets.filter(w => w.isActive === false);
  const activeWalletsCount = activeWallets.length;
  const inactiveWalletsCount = inactiveWallets.length;
  
  const totalBalance = activeWallets.reduce((sum, w) => sum + (w.amount || 0), 0);
  const isNegativeBalance = totalBalance < 0;
  const recentTransactionsCount = transactions.length;

  // Calculate total automatic income from active wallets with MENSUAL type
  const totalAutomaticIncome = activeWallets.reduce((sum, w) => {
    if (w.walletAutomaticIncome?.type === 'MENSUAL') {
      return sum + (w.walletAutomaticIncome.amount || 0);
    }
    return sum;
  }, 0);

  const handleNewTransaction = () => setTransactionModalVisible(true);
  const handleNewGoal = () => setGoalModalVisible(true);
  const handleNewLabel = () => setLabelModalVisible(true);
  const handleNewWallet = () => setWalletModalVisible(true);

  const getAnimStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [{ translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
  });

  return (
    <DashboardShell title="Dashboard" subtitle={`Bienvenue, ${username ?? ''}`.trim()} icon="bar-chart-outline">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <Animated.View style={[getAnimStyle(welcomeAnim)]}>
          <View style={[styles.welcomeCard, { backgroundColor: isNegativeBalance ? theme.error : theme.primary }]}>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeHeader}>
                <Ionicons name="wallet" size={24} color="rgba(255,255,255,0.8)" />
                <Text style={styles.welcomeText}>Solde Total</Text>
              </View>
              <Text style={styles.balanceText}>{Math.abs(totalBalance).toLocaleString('fr-FR')} Ar</Text>
              <View style={styles.welcomeStats}>
                <View style={styles.welcomeStatItem}>
                  <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.welcomeStatText}>{activeWalletsCount} portefeuille(s) actif(s)</Text>
                </View>
                <View style={styles.welcomeStatItem}>
                  <Text style={styles.welcomeStatText}> </Text>
                </View>
              </View>
            </View>
            <View style={styles.welcomeIcon}>
              <Ionicons name="wallet" size={64} color="rgba(255,255,255,0.15)" />
            </View>
            {isNegativeBalance && (
              <View style={styles.warningBadge}>
                <Ionicons name="warning" size={14} color="#FFFFFF" />
                <Text style={styles.warningText}>Attention solde négatif</Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View style={[getAnimStyle(quickActionsAnim)]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions rapides</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Accédez rapidement aux fonctionnalités</Text>
          </View>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface }]} onPress={handleNewTransaction} activeOpacity={0.7}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.accent + '20' }]}>
                <Ionicons name="swap-vertical-outline" size={24} color={theme.accent} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Transaction</Text>
              <Text style={[styles.actionTextSmall, { color: theme.textSecondary }]}>Ajouter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface }]} onPress={handleNewLabel} activeOpacity={0.7}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="pricetags-outline" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Label</Text>
              <Text style={[styles.actionTextSmall, { color: theme.textSecondary }]}>Créer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface }]} onPress={handleNewWallet} activeOpacity={0.7}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.accentOrange + '20' }]}>
                <Ionicons name="wallet-outline" size={24} color={theme.accentOrange} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Portefeuille</Text>
              <Text style={[styles.actionTextSmall, { color: theme.textSecondary }]}>Nouveau</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface }]} onPress={handleNewGoal} activeOpacity={0.7}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.success + '20' }]}>
                <Ionicons name="flag-outline" size={24} color={theme.success} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>Objectif</Text>
              <Text style={[styles.actionTextSmall, { color: theme.textSecondary }]}>Créer</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[getAnimStyle(statsAnim)]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Revenus automatiques</Text>
              {totalAutomaticIncome > 0 && (
                <Text style={[styles.automaticIncomeTotal, { color: totalAutomaticIncome >= 0 ? theme.success : theme.error }]}>
                  {Math.abs(totalAutomaticIncome).toLocaleString('fr-FR')} Ar/mois
                </Text>
              )}
            </View>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>État de vos portefeuilles</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.success + '20' }]}>
                  <Ionicons name="play-circle" size={22} color={theme.success} />
                </View>
                <View style={styles.statTitleContainer}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Activés</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{activeWalletsCount}</Text>
                </View>
              </View>
              
              {activeWalletsCount > 0 ? (
                <View style={styles.walletNamesList}>
                  {(showAllActiveWallets ? activeWallets : activeWallets.slice(0, 3)).map((wallet) => {
                    const autoIncome = wallet.walletAutomaticIncome?.type === 'MENSUAL' ? (wallet.walletAutomaticIncome.amount || 0) : 0;
                    const isPositiveIncome = autoIncome >= 0;
                    return (
                      <View key={wallet.id} style={styles.walletNameItem}>
                        <View style={[styles.walletDot, { backgroundColor: theme.success }]} />
                        <Text style={[styles.walletNameText, { color: theme.text }]} numberOfLines={1}>{wallet.name}</Text>
                        <Text style={[styles.walletAmount, { color: autoIncome > 0 ? theme.success : theme.textSecondary }]}>
                          {autoIncome > 0 ? Math.abs(autoIncome).toLocaleString() : (wallet.amount || 0).toLocaleString()} Ar
                        </Text>
                      </View>
                    );
                  })}
                  {activeWalletsCount > 3 && (
                    <TouchableOpacity onPress={() => setShowAllActiveWallets(!showAllActiveWallets)} style={styles.moreButton}>
                      <Text style={[styles.moreText, { color: theme.primary }]}>
                        {showAllActiveWallets ? 'Réduire' : `+${activeWalletsCount - 3} voir plus`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.emptyStat}>
                  <Ionicons name="wallet-outline" size={24} color={theme.textTertiary} />
                  <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Aucun portefeuille actif</Text>
                </View>
              )}
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.textTertiary + '20' }]}>
                  <Ionicons name="pause-circle" size={22} color={theme.textTertiary} />
                </View>
                <View style={styles.statTitleContainer}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Désactivés</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{inactiveWalletsCount}</Text>
                </View>
              </View>
              
              {inactiveWalletsCount > 0 ? (
                <View style={styles.walletNamesList}>
                  {(showAllInactiveWallets ? inactiveWallets : inactiveWallets.slice(0, 3)).map((wallet) => {
                    const autoIncome = wallet.walletAutomaticIncome?.type === 'MENSUAL' ? (wallet.walletAutomaticIncome.amount || 0) : 0;
                    return (
                      <View key={wallet.id} style={styles.walletNameItem}>
                        <View style={[styles.walletDot, { backgroundColor: theme.textTertiary }]} />
                        <Text style={[styles.walletNameText, { color: theme.text }]} numberOfLines={1}>{wallet.name}</Text>
                        <Text style={[styles.walletAmount, { color: autoIncome > 0 ? theme.success : theme.textSecondary }]}>
                          {autoIncome > 0 ? Math.abs(autoIncome).toLocaleString() : (wallet.amount || 0).toLocaleString()} Ar
                        </Text>
                      </View>
                    );
                  })}
                  {inactiveWalletsCount > 3 && (
                    <TouchableOpacity onPress={() => setShowAllInactiveWallets(!showAllInactiveWallets)} style={styles.moreButton}>
                      <Text style={[styles.moreText, { color: theme.primary }]}>
                        {showAllInactiveWallets ? 'Réduire' : `+${inactiveWalletsCount - 3} voir plus`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.emptyStat}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={theme.success} />
                  <Text style={[styles.emptyText, { color: theme.success }]}>Aucun portefeuille inactif</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CreateTransactionModal visible={isTransactionModalVisible} onClose={() => setTransactionModalVisible(false)} />
      <CreateGoalModal visible={isGoalModalVisible} onClose={() => setGoalModalVisible(false)} />
      <CreateLabelModal visible={isLabelModalVisible} onClose={() => setLabelModalVisible(false)} />
      <CreateWalletModal visible={isWalletModalVisible} onClose={() => setWalletModalVisible(false)} />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40, paddingTop: 8, paddingHorizontal: 16 },
  sectionHeader: { marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  automaticIncomeTotal: { fontSize: 16, fontWeight: '700' },
  sectionSubtitle: { fontSize: 13, fontWeight: '500' },
  welcomeCard: { borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', overflow: 'hidden' },
  welcomeContent: { flex: 1 },
  welcomeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceText: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginBottom: 12 },
  welcomeStats: { gap: 6 },
  welcomeStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  welcomeStatText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },
  welcomeIcon: { position: 'absolute', right: -10, bottom: -10, opacity: 0.8 },
  warningBadge: { position: 'absolute', bottom: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  warningText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  actionCard: { width: '47%', borderRadius: 18, padding: 16, alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 }, web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' } }) },
  actionIconContainer: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  actionTextSmall: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 2 },
  statsContainer: { gap: 16 },
  statCard: { borderRadius: 18, padding: 18, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 }, web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' } }) },
  statCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  statIconContainer: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statTitleContainer: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  walletNamesList: { gap: 10 },
  walletNameItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  walletDot: { width: 8, height: 8, borderRadius: 4 },
  walletNameText: { fontSize: 14, fontWeight: '600', flex: 1 },
  walletAmount: { fontSize: 13, fontWeight: '600' },
  moreButton: { marginTop: 4 },
  moreText: { fontSize: 12, fontWeight: '600' },
  emptyStat: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  emptyText: { fontSize: 13, fontWeight: '500' },
  bottomSpacer: { height: 20 },
});
