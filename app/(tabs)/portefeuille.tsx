import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import CreateWalletModal from '../../src/components/CreateWalletModal';
import WalletList from '../../src/components/WalletList';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function PortefeuilleScreen() {
  const router = useRouter();
  const accountId = useAuthStore((state) => state.accountId);

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <DashboardShell title="Portefeuilles" subtitle="Gérez vos comptes" icon="wallet-outline">
      
      {/* Account Badge */}
      <View style={[styles.accountBadge, { backgroundColor: theme.primary + '15' }]}>
        <Ionicons name="person-circle-outline" size={16} color={theme.primary} />
        <Text style={[styles.accountText, { color: theme.primary }]}>
          ID: {accountId ? accountId.slice(0, 13) : '---'}...
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mes Portefeuilles</Text>
          <Ionicons name="wallet-outline" size={22} color={theme.primary} />
        </View>
        
        <View style={{ flex: 1 }}>
          <WalletList />
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]} 
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateWalletModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 10,
  },
  accountBadge: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  accountText: { 
    fontSize: 13, 
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700',
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
