import DashboardShell from '@/components/dashboard-shell';
import { Colors } from '../../constants/color';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useNotificationStore } from '../../src/store/usenotificationstore';
import { useWallets } from '../../src/hooks/useWallets';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useState, useCallback } from 'react';
import { 
  BackHandler, Platform, ScrollView, StyleSheet, 
  Switch, Text, TouchableOpacity, View, Modal 
} from 'react-native';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

type ModalType = 'currency' | 'recurrence' | 'days' | 'hour' | 'wallet';

export default function ConfigurationScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state: ThemeState) => state.isDarkMode);
  const toggleTheme = useThemeStore((state: ThemeState) => state.toggleTheme);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // --- CONFIG NOTIFICATIONS (persistée dans le store) ---
  const notifConfig = useNotificationStore();
  const { wallets } = useWallets();

  // --- ÉTATS LOCAUX ---
  const [isPremium, setIsPremium] = useState(false);
  const [currency, setCurrency] = useState('MGA');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('currency');

  // --- NAVIGATION & BIOMÉTRIE ---
  useFocusEffect(
    useCallback(() => {
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

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({ 
        promptMessage: 'Confirmez votre identité pour activer le login' 
      });
      if (result.success) setIsBiometricEnabled(true);
    } else {
      setIsBiometricEnabled(false);
    }
  };

  // --- HELPER : Label de l'heure ---
  const hourLabel = `${String(notifConfig.notificationHour).padStart(2, '0')}:${String(notifConfig.notificationMinute).padStart(2, '0')}`;

  // --- HELPER : Label du wallet ciblé ---
  const walletLabel = notifConfig.walletId
    ? wallets.find(w => w.id === notifConfig.walletId)?.name ?? 'Inconnu'
    : 'Tous les wallets';

  // --- COMPOSANT RÉUTILISABLE ---
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

  // --- OPTIONS DES MODALS ---
  const getModalOptions = (): string[] => {
    switch (modalType) {
      case 'currency':   return ['MGA', 'USD', 'EUR'];
      case 'recurrence': return ['Quotidienne', 'Hebdomadaire', 'Mensuelle'];
      case 'days':       return ['7', '30', '90'];
      case 'hour':       return ['7', '8', '12', '18', '19', '20', '21', '22'];
      case 'wallet':     return ['all', ...wallets.map(w => w.id)];
      default:           return [];
    }
  };

  const getOptionLabel = (item: string): string => {
    switch (modalType) {
      case 'days':   return `${item} jours`;
      case 'hour':   return `${String(item).padStart(2, '0')}:00`;
      case 'wallet': return item === 'all' ? 'Tous les wallets' : (wallets.find(w => w.id === item)?.name ?? item);
      default:       return item;
    }
  };

  const handleModalSelect = (item: string) => {
    switch (modalType) {
      case 'currency':   setCurrency(item); break;
      case 'recurrence': notifConfig.setConfig({ recurrence: item as any }); break;
      case 'days':       notifConfig.setConfig({ daysCount: parseInt(item) }); break;
      case 'hour':       notifConfig.setConfig({ notificationHour: parseInt(item), notificationMinute: 0 }); break;
      case 'wallet':     notifConfig.setConfig({ walletId: item === 'all' ? null : item }); break;
    }
    setModalVisible(false);
  };

  const openModal = (type: ModalType) => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <DashboardShell title="Configuration" subtitle="Paramètres de votre compte" icon="options-outline">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1 : APPAREIL & SÉCURITÉ */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPAREIL & SÉCURITÉ</Text>
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
            icon="finger-print" 
            title="Login biométrique" 
            subtitle={isBiometricEnabled ? "Activé" : "Désactivé"}
            rightElement={
              <Switch 
                value={isBiometricEnabled} 
                onValueChange={toggleBiometric} 
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={isBiometricEnabled ? theme.primary : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* SECTION 2 : NOTIFICATIONS PUSH */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTIFICATIONS PUSH</Text>
        <View style={styles.settingsGroup}>

          {/* Toggle ON/OFF global */}
          <SettingItem 
            icon="notifications-outline" 
            title="Notifications activées" 
            subtitle={notifConfig.isEnabled ? "Activées" : "Désactivées"}
            rightElement={
              <Switch
                value={notifConfig.isEnabled}
                onValueChange={(val) => notifConfig.setConfig({ isEnabled: val })}
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={notifConfig.isEnabled ? theme.primary : '#f4f3f4'}
              />
            }
          />

          {/* Options visibles seulement si activé */}
          {notifConfig.isEnabled && (
            <>
              <SettingItem 
                icon="time-outline" 
                title="Récurrence" 
                subtitle={notifConfig.recurrence}
                onPress={() => openModal('recurrence')}
              />
              <SettingItem 
                icon="calendar-outline" 
                title="Période de calcul" 
                subtitle={`${notifConfig.daysCount} jours`}
                onPress={() => openModal('days')}
              />
              <SettingItem 
                icon="alarm-outline" 
                title="Heure de notification" 
                subtitle={hourLabel}
                onPress={() => openModal('hour')}
              />
              <SettingItem 
                icon="wallet-outline" 
                title="Wallet concerné" 
                subtitle={walletLabel}
                onPress={() => openModal('wallet')}
              />
            </>
          )}
        </View>

        {notifConfig.isEnabled && (
          <Text style={[styles.hint, { color: theme.textTertiary }]}>
            Vous recevrez le cumul de vos dépenses des {notifConfig.daysCount} derniers jours 
            ({notifConfig.recurrence.toLowerCase()}) à {hourLabel} sur "{walletLabel}".
          </Text>
        )}

        {/* SECTION 3 : PRÉFÉRENCES */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PRÉFÉRENCES</Text>
        <View style={styles.settingsGroup}>
          <SettingItem 
            icon="cash-outline" 
            title="Devise utilisée" 
            subtitle={currency}
            onPress={() => openModal('currency')}
          />
        </View>

        {/* SECTION 4 : ABONNEMENT */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>MON ABONNEMENT</Text>
        <View style={[styles.subscriptionCard, isPremium ? styles.premiumCard : { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.subscriptionRow}>
            <View>
              <Text style={[styles.subscriptionLabel, isPremium && styles.whiteText]}>Statut actuel</Text>
              <Text style={[styles.subscriptionStatus, isPremium && styles.whiteTextBold]}>
                {isPremium ? 'PRO (Entrepreneur)' : 'Version Gratuite'}
              </Text>
            </View>
            {!isPremium && (
              <TouchableOpacity 
                style={[styles.premiumBtn, { backgroundColor: theme.primary }]} 
                onPress={() => setIsPremium(true)}
              >
                <Ionicons name="diamond" size={16} color="#FFFFFF" />
                <Text style={styles.premiumBtnText}>Passer Premium</Text>
              </TouchableOpacity>
            )}
            {isPremium && (
               <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                  <Text style={styles.premiumBadgeText}>ACTIF</Text>
               </View>
            )}
          </View>
        </View>

        {/* SECTION 5 : À PROPOS */}
        <View style={[styles.appInfo, { backgroundColor: theme.primary + '08' }]}>
          <Text style={[styles.appInfoTitle, { color: theme.text }]}>E-PAOSY</Text>
          <Text style={[styles.appInfoVersion, { color: theme.textSecondary }]}>Version 1.0.0 - HEI Technology</Text>
        </View>

        {/* MODAL UNIVERSELLE */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {modalType === 'currency'   ? 'Choisir la devise' :
                 modalType === 'recurrence' ? 'Choisir la fréquence' :
                 modalType === 'days'       ? 'Période de calcul' :
                 modalType === 'hour'       ? 'Heure de notification' :
                                             'Wallet concerné'}
              </Text>

              {getModalOptions().map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.modalOption, { borderBottomColor: theme.border }]} 
                  onPress={() => handleModalSelect(item)}
                >
                  <Text style={[styles.modalOptionText, { color: theme.text }]}>
                    {getOptionLabel(item)}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 24, marginBottom: 12, marginLeft: 4 },
  settingsGroup: { gap: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, gap: 14 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600' },
  settingSubtitle: { fontSize: 13, marginTop: 2 },
  hint: { fontSize: 12, fontStyle: 'italic', marginTop: 8, marginHorizontal: 8, lineHeight: 18 },
  subscriptionCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginTop: 4 },
  premiumCard: { backgroundColor: '#0D9488', borderWidth: 0 },
  subscriptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subscriptionLabel: { fontSize: 13, opacity: 0.8 },
  subscriptionStatus: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  whiteText: { color: '#FFFFFF' },
  whiteTextBold: { color: '#FFFFFF' },
  premiumBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, gap: 6 },
  premiumBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  premiumBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  appInfo: { alignItems: 'center', padding: 25, borderRadius: 20, marginTop: 30, marginBottom: 40 },
  appInfoTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  appInfoVersion: { fontSize: 12, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 24, padding: 24, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1 },
  modalOptionText: { fontSize: 16, textAlign: 'center', fontWeight: '500' },
  cancelBtn: { marginTop: 15, padding: 10 },
  cancelText: { color: '#EF4444', textAlign: 'center', fontWeight: '700' },
});
