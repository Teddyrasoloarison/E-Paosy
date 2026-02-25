import React, { ReactNode, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View, Animated, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { Colors } from '@/constants/colors';

// Import logo image
const logoEpaosy = require('../assets/images/logo-e-paosy-removebg.png');

type MenuItem = {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', route: '/(tabs)/dashboard', icon: 'grid-outline' },
  { label: 'Labels', route: '/(tabs)/label', icon: 'pricetag-outline' },
  { label: 'Portefeuille', route: '/(tabs)/portefeuille', icon: 'wallet-outline' },
  { label: 'Transactions', route: '/(tabs)/transaction', icon: 'swap-horizontal-outline' },
  { label: 'Objectifs', route: '/(tabs)/objectif', icon: 'flag-outline' },
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
  const { isDarkMode, toggleTheme } = useThemeStore();

  const theme = isDarkMode ? Colors.dark : Colors.light;
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

  const handleThemeToggle = async () => {
    await toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          onPress={() => setMenuOpen(true)} 
          style={[styles.menuButton, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="menu-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
        <TouchableOpacity 
          style={[styles.logoButton, { backgroundColor: theme.surface }]}
          onPress={() => {}}
        >
          <Image 
            source={logoEpaosy} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {children}

      {menuOpen && (
        <>
          <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)} />
          <Animated.View style={[styles.drawer, { backgroundColor: theme.surface }]}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerTitleRow}>
                <Image 
                  source={logoEpaosy} 
                  style={styles.drawerLogo}
                  resizeMode="contain"
                />
                <Text style={[styles.drawerTitle, { color: theme.text }]}>E-PAOSY</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Ionicons name="close-outline" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Theme Toggle Button - Modern Style */}
            <TouchableOpacity
              style={[styles.themeToggle, { backgroundColor: theme.backgroundSecondary }]}
              onPress={handleThemeToggle}
              activeOpacity={0.7}
            >
              <View style={styles.themeToggleContent}>
                <View style={[
                  styles.themeIconContainer, 
                  { backgroundColor: isDarkMode ? '#312E81' : '#FEF3C7' }
                ]}>
                  <Ionicons 
                    name={isDarkMode ? 'moon' : 'sunny'} 
                    size={18} 
                    color={isDarkMode ? '#818CF8' : '#F59E0B'} 
                  />
                </View>
                <View style={styles.themeTextContainer}>
                  <Text style={[styles.themeToggleTitle, { color: theme.text }]}>
                    {isDarkMode ? 'Mode Sombre' : 'Mode Clair'}
                  </Text>
                  <Text style={[styles.themeToggleSubtitle, { color: theme.textTertiary }]}>
                    {isDarkMode ? 'Activé' : 'Désactivé'}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.toggleSwitch, 
                { backgroundColor: isDarkMode ? theme.primary : theme.border }
              ]}>
                <Animated.View style={[
                  styles.toggleThumb,
                  { 
                    backgroundColor: '#FFFFFF',
                    transform: [{ translateX: isDarkMode ? 18 : 2 }]
                  }
                ]} />
              </View>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

            {MENU_ITEMS.map((item) => {
              const isActive = item.route === activeRoute;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.menuItem, 
                    isActive && { backgroundColor: theme.primary + '15' }
                  ]}
                  onPress={() => handleNavigate(item.route)}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isActive ? theme.primary : theme.textSecondary}
                  />
                  <Text style={[
                    styles.menuText, 
                    { color: isActive ? theme.primary : theme.text },
                    isActive && styles.menuTextActive
                  ]}>
                    {item.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}

            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() =>
                Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Oui', style: 'destructive', onPress: handleLogout },
                ])
              }
            >
              <Ionicons name="log-out-outline" size={20} color={theme.error} />
              <Text style={[styles.logoutText, { color: theme.error }]}>Se déconnecter</Text>
            </TouchableOpacity>

            <View style={styles.drawerFooter}>
              <Text style={[styles.footerText, { color: theme.textTertiary }]}>
                E-PAOSY v1.0.0
              </Text>
            </View>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  logoButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '700',
  },
  subtitle: { 
    fontSize: 13, 
    marginTop: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 280,
    paddingTop: 60,
    paddingHorizontal: 16,
    zIndex: 11,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  drawerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  drawerTitle: { 
    fontSize: 20, 
    fontWeight: '700',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  themeToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTextContainer: {
    gap: 2,
  },
  themeToggleTitle: { 
    fontSize: 15, 
    fontWeight: '600',
  },
  themeToggleSubtitle: { 
    fontSize: 12,
  },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  menuDivider: {
    height: 1,
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuText: { 
    fontSize: 15, 
    fontWeight: '500',
    flex: 1,
  },
  menuTextActive: {
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  logoutItem: { 
    marginTop: 8,
  },
  logoutText: { 
    fontSize: 15, 
    fontWeight: '600',
  },
  drawerFooter: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
