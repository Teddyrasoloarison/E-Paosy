import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Platform } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import TransactionList from '../../src/components/TransactionList';
import CreateTransactionModal from '../../src/components/CreateTransactionModal';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function TransactionScreen() {
  const [isCreateVisible, setCreateVisible] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <DashboardShell title="Transactions" subtitle="Suivez vos flux financiers">
      
      <View style={styles.container}>
        <TransactionList />
      </View>

      {/* Floating Action Button - Modern Design */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]} 
        onPress={() => setCreateVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateTransactionModal 
        visible={isCreateVisible} 
        onClose={() => setCreateVisible(false)} 
      />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      web: { boxShadow: '0px 4px 12px rgba(13, 148, 136, 0.3)' },
    }),
  },
});
