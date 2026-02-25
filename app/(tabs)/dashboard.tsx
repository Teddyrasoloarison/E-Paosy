import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import DashboardShell from '@/components/dashboard-shell';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../constants/colors';
import CreateTransactionModal from '../../src/components/CreateTransactionModal';
import CreateGoalModal from '../../src/components/CreateGoalModal';
import CreateWalletModal from '../../src/components/CreateWalletModal';

export default function DashboardScreen() {
  const router = useRouter();
  const username = useAuthStore((state) => state.username);
  const { wallets } = useWallets();
  const { transactions } = useTransactions();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // States for modals
  const [isTransactionModalVisible, setTransactionModalVisible] = useState(false);
  const [isGoalModalVisible, setGoalModalVisible] = useState(false);
  const [isWalletModalVisible, setWalletModalVisible] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const totalBalance = wallets.reduce((sum, w) => sum + (w.amount || 0), 0);
  
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

  const handleNewWallet = () => {
    setWalletModalVisible(true);
  };

  const handleViewAllActivities = () => {
    setShowAllActivities(!showAllActivities);
  };

  return (
    <DashboardShell title="Dashboard" subtitle={`Bienvenue, ${username ?? ''}`.trim()}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Card - Modern Design */}
        <View style={[styles.welcomeCard, { backgroundColor: theme.primary }]}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Solde Total</Text>
            <Text style={styles.balanceText}>{totalBalance.toLocaleString('fr-FR')} Ar</Text>
            <Text style={styles.welcomeSubtext}>{wallets.length} portefeuille(s) actif(s)</Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Ionicons name="wallet" size={48} color="rgba(255,255,255,0.2)" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions rapides</Text>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.accent + '15' }]}
            onPress={handleNewTransaction}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={28} color={theme.accent} />
            <Text style={[styles.actionText, { color: theme.text }]}>Nouvelle</Text>
            <Text style={[styles.actionTextSmall, { color: theme.text }]}>transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.accentGreen + '15' }]}
            onPress={handleNewGoal}
            activeOpacity={0.7}
          >
            <Ionicons name="flag-outline" size={28} color={theme.accentGreen} />
            <Text style={[styles.actionText, { color: theme.text }]}>Ajouter</Text>
            <Text style={[styles.actionTextSmall, { color: theme.text }]}>objectif</Text>
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

        {/* Statistics Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="wallet-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{totalBalance.toLocaleString('fr-FR')}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Solde total</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.secondary + '15' }]}>
              <Ionicons name="swap-horizontal-outline" size={20} color={theme.secondary} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{transactions.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Transactions</Text>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={[styles.activitySection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.activityHeader}>
            <View style={styles.activityTitleRow}>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text style={[styles.activityTitle, { color: theme.text }]}>Activite recente</Text>
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
                      <Text style={[styles.activityDate, { color: theme.textTertiary }]}>
                        {transaction.date ? new Date(transaction.date).toLocaleDateString('fr-FR') : ''}
                      </Text>
                    </View>
                    <Text style={[styles.activityAmount, { color: isIncome ? theme.success : theme.error }]}>
                      {isIncome ? '+' : '-'}{Math.abs(Number(transaction.amount)).toLocaleString()} Ar
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

        {/* Chart section placeholder */}
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
});
