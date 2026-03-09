import DashboardShell from '@/components/dashboard-shell';
import { Colors } from '../../constants/color';
import { useThemeStore } from '../../src/store/useThemeStore';
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
export default function ConfigurationScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state: ThemeState) => state.isDarkMode);
  const toggleTheme = useThemeStore((state: ThemeState) => state.toggleTheme);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // --- ÉTATS DE VOTRE LOGIQUE MÉTIER ---
  const [isPremium, setIsPremium] = useState(false);
  const [recurrence, setRecurrence] = useState('Quotidienne');
  const [daysCount, setDaysCount] = useState(30);
  const [currency, setCurrency] = useState('MGA');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  
  // État pour la Modal Universelle
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'currency' | 'recurrence' | 'days'>('currency');

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

  // --- COMPOSANT REUTILISABLE STYLISÉ ---
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

        {/* SECTION 2 : NOTIFICATIONS PUSH (MÉTIER) */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTIFICATIONS PUSH</Text>
        <View style={styles.settingsGroup}>
          <SettingItem 
            icon="time-outline" 
            title="Récurrence" 
            subtitle={recurrence}
            onPress={() => { setModalType('recurrence'); setModalVisible(true); }}
          />
          <SettingItem 
            icon="calendar-outline" 
            title="Jours à compter" 
            subtitle={`${daysCount} jours`}
            onPress={() => { setModalType('days'); setModalVisible(true); }}
          />
        </View>
        <Text style={[styles.hint, { color: theme.textTertiary }]}>
          Vous recevrez le cumul de vos dépenses des {daysCount} derniers jours ({recurrence.toLowerCase()}).
        </Text>

        {/* SECTION 3 : PRÉFÉRENCES */}
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PRÉFÉRENCES</Text>
        <View style={styles.settingsGroup}>
          <SettingItem 
            icon="cash-outline" 
            title="Devise utilisée" 
            subtitle={currency}
            onPress={() => { setModalType('currency'); setModalVisible(true); }}
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

        {/* MODAL UNIVERSELLE (Design amélioré) */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {modalType === 'currency' ? 'Choisir la devise' : 
                 modalType === 'recurrence' ? 'Choisir la fréquence' : 'Période de calcul'}
              </Text>
              
              {(modalType === 'currency' ? ['MGA', 'USD', 'EUR'] : 
                modalType === 'recurrence' ? ['Quotidienne', 'Hebdomadaire', 'Mensuelle'] : 
                ['7', '30', '90']).map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.modalOption, { borderBottomColor: theme.border }]} 
                  onPress={() => { 
                    if (modalType === 'currency') setCurrency(item);
                    else if (modalType === 'recurrence') setRecurrence(item);
                    else setDaysCount(parseInt(item));
                    setModalVisible(false); 
                  }}>
                  <Text style={[styles.modalOptionText, { color: theme.text }]}>
                    {modalType === 'days' ? `${item} jours` : item}
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