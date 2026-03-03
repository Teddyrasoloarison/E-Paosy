import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { BackHandler, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import CreateTransactionModal from '../../src/components/CreateTransactionModal';
import TransactionList from '../../src/components/TransactionList';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function TransactionScreen() {
  const router = useRouter();
  const [isCreateVisible, setCreateVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android') {
          router.replace('/(tabs)/dashboard');
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <DashboardShell title="Transactions" subtitle="Suivez vos flux financiers" icon="swap-vertical-outline">
      
      <View style={styles.container}>
        <TransactionList />
      </View>

      {/* Bouton Calendrier - Positionné au-dessus du bouton de création */}
      <TouchableOpacity 
        style={[styles.calendarFab, { backgroundColor: theme.secondary }]} 
        onPress={() => router.push('/(tabs)/calendar')}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar" size={24} color="#FFFFFF" />
      </TouchableOpacity>

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
  },
  calendarFab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#06B6D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
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
    }),
  },
});
