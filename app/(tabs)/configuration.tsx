import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { BackHandler, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function ConfigurationScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

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
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement }: any) => (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />}
    </TouchableOpacity>
  );

  return (
    <DashboardShell title="Configuration" subtitle="Paramètres de votre compte" icon="options-outline">

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* App Settings */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPAREIL</Text>
        
        <View style={styles.settingsGroup}>
          <SettingItem 
            icon="moon" 
            title="Mode Sombre" 
            subtitle={isDarkMode ? "Activé" : "Désactivé"}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={isDarkMode ? theme.primary : '#f4f3f4'}
              />
            }
          />
          <SettingItem 
            icon="notifications" 
            title="Notifications" 
            subtitle="Gérer les notifications"
          />
          <SettingItem 
            icon="finger-print" 
            title="Empreinte digitale" 
            subtitle="Sécurisez votre compte"
          />
        </View>

        {/* Language & Support */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>AIDE & SUPPORT</Text>
        
        <View style={styles.settingsGroup}>
          <SettingItem 
            icon="language" 
            title="Langue" 
            subtitle="Français"
          />
          <SettingItem 
            icon="help-circle" 
            title="Aide & Support" 
            subtitle="FAQ et contact"
          />
          <SettingItem 
            icon="document-text" 
            title="Conditions générales" 
            subtitle="Lire les CGU"
          />
          <SettingItem 
            icon="information-circle" 
            title="À propos" 
            subtitle="Version 1.0.0"
          />
        </View>

        {/* App Info */}
        <View style={[styles.appInfo, { backgroundColor: theme.primary + '08' }]}>
          <View style={[styles.appInfoIcon, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="wallet" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.appInfoTitle, { color: theme.text }]}>E-PAOSY</Text>
          <Text style={[styles.appInfoVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.appInfoCopyright, { color: theme.textTertiary }]}>
            Développé par HEI Technology
          </Text>
        </View>

      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingsGroup: {
    gap: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  appInfoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  appInfoVersion: {
    fontSize: 14,
    marginTop: 4,
  },
  appInfoCopyright: {
    fontSize: 12,
    marginTop: 8,
  },
});
