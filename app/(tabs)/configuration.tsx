import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

export default function ConfigurationScreen() {
  const [recurrence, setRecurrence] = useState('Quotidienne');
  const [daysCount, setDaysCount] = useState(30);
  const [isPremium, setIsPremium] = useState(false);
  const [currency, setCurrency] = useState('MGA');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  
  // État pour la Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'currency' | 'recurrence' | 'days'>('currency');

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirmez votre identité' });
      if (result.success) setIsBiometricEnabled(true);
    } else {
      setIsBiometricEnabled(false);
    }
  };

  return (
    <DashboardShell title="Configuration" subtitle="Paramètres de votre compte">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* SECTION 1 : NOTIFICATIONS */}
        <Text style={styles.sectionTitle}>Notifications Push</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => { setModalType('recurrence'); setModalVisible(true); }}>
            <Text style={styles.label}>Récurrence</Text>
            <Text style={styles.valueBold}>{recurrence}</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          {/* MODIFICATION ICI : Remplace le View par TouchableOpacity */}
          <TouchableOpacity style={styles.row} onPress={() => { setModalType('days'); setModalVisible(true); }}>
            <Text style={styles.label}>Jours à compter</Text>
            <Text style={styles.valueBold}>{daysCount} jours</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          La notification vous donnera le total cumulé des dépenses sur les {daysCount} derniers jours, envoyé de façon {recurrence.toLowerCase()}.
        </Text>

        {/* SECTION 2 : ABONNEMENT */}
        <Text style={styles.sectionTitle}>Mon Abonnement</Text>
        <View style={[styles.card, isPremium && styles.premiumCard]}>
          <View style={styles.row}>
            <View>
              <Text style={[styles.label, isPremium && styles.whiteText]}>Statut actuel</Text>
              <Text style={[styles.status, isPremium && styles.whiteTextBold]}>
                {isPremium ? 'PRO (Entrepreneur)' : 'Version Gratuite'}
              </Text>
            </View>
            {!isPremium && (
              <TouchableOpacity style={styles.premiumBtn} onPress={() => setIsPremium(true)}>
                <Text style={styles.premiumBtnText}>Passer Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SECTION 3 : PRÉFÉRENCES */}
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => { setModalType('currency'); setModalVisible(true); }}>
            <Text style={styles.label}>Devise utilisée</Text>
            <Text style={styles.valueBold}>{currency}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Login biométrique</Text>
            <Switch value={isBiometricEnabled} onValueChange={toggleBiometric} trackColor={{true: "#81C784"}} />
          </View>
        </View>

        {/* MODAL UNIVERSELLE */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {modalType === 'currency' ? 'Choisir la devise' : 
                 modalType === 'recurrence' ? 'Choisir la fréquence' : 'Nombre de jours'}
              </Text>
              
              {(modalType === 'currency' ? ['MGA', 'USD', 'EUR'] : 
                modalType === 'recurrence' ? ['Quotidienne', 'Hebdomadaire', 'Mensuelle'] : 
                ['7', '30', '90']).map((item) => (
                <TouchableOpacity key={item} style={styles.modalOption} onPress={() => { 
                  if (modalType === 'currency') setCurrency(item);
                  else if (modalType === 'recurrence') setRecurrence(item);
                  else setDaysCount(parseInt(item));
                  setModalVisible(false); 
                }}>
                  <Text style={styles.modalOptionText}>
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
  container: { paddingBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#58725F', marginBottom: 8, marginTop: 16, textTransform: 'uppercase' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#DFEADF', paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  divider: { height: 1, backgroundColor: '#F0F5F0' },
  label: { fontSize: 15, color: '#333' },
  valueBold: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20' },
  status: { fontSize: 16, fontWeight: '600', color: '#1B5E20' },
  premiumCard: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  whiteText: { color: '#E8F5E9' },
  whiteTextBold: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  premiumBtn: { backgroundColor: '#1B5E20', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  premiumBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '80%', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalOptionText: { fontSize: 16, textAlign: 'center' },
  cancelBtn: { marginTop: 20, padding: 10 },
  cancelText: { color: '#D32F2F', textAlign: 'center', fontWeight: 'bold' },
  hint: { 
    fontSize: 12, 
    color: '#757575', 
    fontStyle: 'italic', 
    marginTop: 8, 
    marginHorizontal: 4,
    lineHeight: 16 
  },
});