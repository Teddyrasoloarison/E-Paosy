import React, { ReactNode, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/useAuthStore';

type MenuItem = {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', route: '/(tabs)/dashboard', icon: 'grid-outline' },
  { label: 'Label', route: '/(tabs)/label', icon: 'pricetag-outline' },
  { label: 'Portefeuille', route: '/(tabs)/portefeuille', icon: 'wallet-outline' },
  { label: 'Transaction', route: '/(tabs)/transaction', icon: 'swap-horizontal-outline' },
  { label: 'Objectif', route: '/(tabs)/objectif', icon: 'flag-outline' },
  { label: 'Configuration', route: '/(tabs)/configuration', icon: 'settings-outline' },
];

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeRoute = useMemo(() => pathname?.replace(/\/+$/, '') || '', [pathname]);

  const handleNavigate = (route: string) => {
    setMenuOpen(false);
    if (activeRoute === route) {
      return;
    }
    router.push(route as never);
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={28} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.menuButtonPlaceholder} />
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {children}

      {menuOpen && (
        <>
          <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)} />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Ionicons name="close-outline" size={24} color="#1B5E20" />
              </TouchableOpacity>
            </View>

            {MENU_ITEMS.map((item) => {
              const isActive = item.route === activeRoute;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleNavigate(item.route)}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isActive ? '#1B5E20' : '#2E7D32'}
                  />
                  <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() =>
                Alert.alert('Deconnexion', 'Voulez-vous vous deconnecter ?', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Oui', style: 'destructive', onPress: handleLogout },
                ])
              }
            >
              <Ionicons name="log-out-outline" size={20} color="#C62828" />
              <Text style={styles.logoutText}>Se deconnecter</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3FAF5', padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E6F4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonPlaceholder: { width: 40, height: 40 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1B5E20' },
  subtitle: { color: '#58725F', fontSize: 15, marginBottom: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 270,
    backgroundColor: '#FFFFFF',
    paddingTop: 64,
    paddingHorizontal: 16,
    zIndex: 11,
    borderRightWidth: 1,
    borderRightColor: '#E3ECE4',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  drawerTitle: { fontSize: 20, fontWeight: '700', color: '#1B5E20' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4EE',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  menuItemActive: { backgroundColor: '#EAF5EC' },
  menuText: { fontSize: 16, color: '#355A3F' },
  menuTextActive: { color: '#1B5E20', fontWeight: '700' },
  logoutItem: { marginTop: 12, borderBottomWidth: 0 },
  logoutText: { fontSize: 16, color: '#C62828', fontWeight: '600' },
});
