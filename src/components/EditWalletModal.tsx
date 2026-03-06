import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useModernAlert } from '../hooks/useModernAlert';
import { useWallets } from '../hooks/useWallets';
import { useThemeStore } from '../store/useThemeStore';
import { AutomaticIncomeFrequencyType, Wallet, WalletType } from '../types/wallet';
import { WalletFormData, walletSchema } from '../utils/walletSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
  wallet: Wallet;
}

// Mapping des types vers les icônes
const WALLET_TYPE_ICONS: Record<WalletType, string> = {
  'CASH': 'cash',
  'MOBILE_MONEY': 'phone-portrait',
  'BANK': 'business',
  'DEBT': 'person-remove',
};

const WALLET_TYPES: { type: WalletType; icon: string; label: string }[] = [
  { type: 'CASH', icon: 'cash', label: 'Espèces' },
  { type: 'MOBILE_MONEY', icon: 'phone-portrait', label: 'Mobile Money' },
  { type: 'BANK', icon: 'business', label: 'Banque' },
  { type: 'DEBT', icon: 'person-remove', label: 'Dette' },
];

const PRESET_COLORS = ['#0D9488', '#2878d3', '#C62828', '#F9A825', '#6A1B9A', '#ff7b00', '#092d7a', '#06553c'];

// Types de fréquence pour les versements automatiques
// Backend stores: NOT_SPECIFIED, DAILY, MENSUAL, YEARLY
type FrequencyType = 'NOT_SPECIFIED' | 'DAILY' | 'MENSUAL' | 'YEARLY';

const FREQUENCY_OPTIONS: { type: FrequencyType; label: string; icon: string }[] = [
  { type: 'NOT_SPECIFIED', label: 'Désactivé', icon: 'close-circle' },
  { type: 'DAILY', label: 'Quotidien', icon: 'today' },
  { type: 'MENSUAL', label: 'Mensuel', icon: 'calendar' },
  { type: 'YEARLY', label: 'Annuel', icon: 'calendar-outline' },
];

export default function EditWalletModal({ visible, onClose, wallet }: Props) {
  const { updateWallet, isUpdating } = useWallets();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { success: showSuccess, error: showError } = useModernAlert();

  // Déterminer la couleur par défaut du wallet
  const defaultColor = wallet.color || PRESET_COLORS[0];
  
  // État pour la fréquence de versement automatique
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyType>(
    wallet.walletAutomaticIncome?.type || 'NOT_SPECIFIED'
  );

  const { 
    control, 
    handleSubmit, 
    reset, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(walletSchema) as any,
    defaultValues: {
      name: wallet.name,
      description: wallet.description || '',
      type: wallet.type,
      color: defaultColor,
      iconRef: WALLET_TYPE_ICONS[wallet.type] || 'wallet',
      isActive: wallet.isActive,
      walletAutomaticIncome: {
        type: wallet.walletAutomaticIncome?.type || 'NOT_SPECIFIED',
        amount: wallet.walletAutomaticIncome?.amount || 0,
        paymentDay: wallet.walletAutomaticIncome?.paymentDay || 1,
      }
    }
  });

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [visible, onClose]);

  // Reset form when wallet changes
  useEffect(() => {
    if (visible && wallet) {
      reset({
        name: wallet.name,
        description: wallet.description || '',
        type: wallet.type,
        color: wallet.color || PRESET_COLORS[0],
        iconRef: WALLET_TYPE_ICONS[wallet.type] || 'wallet',
        isActive: wallet.isActive,
        walletAutomaticIncome: {
          type: wallet.walletAutomaticIncome?.type || 'NOT_SPECIFIED',
          amount: wallet.walletAutomaticIncome?.amount || 0,
          paymentDay: wallet.walletAutomaticIncome?.paymentDay || 1,
        }
      });
      setSelectedFrequency(wallet.walletAutomaticIncome?.type || 'NOT_SPECIFIED');
    }
  }, [visible, wallet, reset]);

  const selectedType = watch('type') as WalletType;
  const walletName = watch('name');
  const selectedColor = watch('color');
  const isActive = watch('isActive');
  const frequencyAmount = watch('walletAutomaticIncome.amount');
  const frequencyDay = watch('walletAutomaticIncome.paymentDay');

  // Obtenir l'icône automatiquement basée sur le type
  const currentIcon = WALLET_TYPE_ICONS[selectedType] || 'wallet';

  const handleFrequencyChange = (freq: FrequencyType) => {
    setSelectedFrequency(freq);
    setValue('walletAutomaticIncome.type', freq);
  };

  const onSubmit = (data: any) => {
    // Assigner automatiquement l'icône basée sur le type
    const walletData = {
      name: data.name,
      description: data.description,
      type: data.type as WalletType,
      color: data.color,
      iconRef: WALLET_TYPE_ICONS[data.type as WalletType] || 'wallet',
      isActive: data.isActive,
      walletAutomaticIncome: selectedFrequency !== 'NOT_SPECIFIED' ? {
        type: selectedFrequency as AutomaticIncomeFrequencyType,
        amount: Number(data.walletAutomaticIncome?.amount) || 0,
        paymentDay: Number(data.walletAutomaticIncome?.paymentDay) || 1,
      } : {
        type: 'NOT_SPECIFIED' as AutomaticIncomeFrequencyType,
        amount: 0,
        paymentDay: 1,
      }
    };
    
    updateWallet(
      { walletId: wallet.id, data: walletData },
      {
        onSuccess: () => {
          showSuccess("Succès", "Portefeuille modifié avec succès !");
          onClose();
        },
        onError: (error: any) => {
          showError("Erreur", error.response?.data?.message || "Erreur serveur");
        }
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <View style={[styles.titleIcon, { backgroundColor: (selectedColor || theme.primary) + '15' }]}>
                <Ionicons name="create" size={24} color={selectedColor || theme.primary} />
              </View>
              <View style={styles.titleContent}>
                <Text style={[styles.title, { color: theme.text }]}>Modifier Portefeuille</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Modifiez les informations</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Wallet Name */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nom du portefeuille</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="wallet-outline" size={20} color={selectedColor || theme.primary} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Ex: Argent de poche" 
                    placeholderTextColor={theme.textTertiary}
                    value={value} 
                    onChangeText={onChange} 
                  />
                </View>
              )}
            />
            {errors.name && <Text style={[styles.errorText, { color: theme.error }]}>{errors.name.message}</Text>}

            {/* Description */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Description (optionnelle)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.descriptionContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="document-text-outline" size={20} color={selectedColor || theme.primary} style={styles.descriptionIcon} />
                  <TextInput 
                    style={[styles.descriptionInput, { color: theme.text }]} 
                    placeholder="Petite note..."
                    placeholderTextColor={theme.textTertiary}
                    value={value} 
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              )}
            />

            {/* Type Selector */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Type de compte</Text>
            <View style={styles.typeContainer}>
              {WALLET_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.typeButton, 
                    { backgroundColor: theme.background },
                    selectedType === item.type && { backgroundColor: selectedColor || theme.primary }
                  ]}
                  onPress={() => setValue('type', item.type)}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={selectedType === item.type ? '#fff' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.typeText, 
                    { color: selectedType === item.type ? '#fff' : theme.textSecondary }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.type && <Text style={[styles.errorText, { color: theme.error }]}>{errors.type.message}</Text>}

            {/* Customization */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Personnalisation</Text>

            {/* Is Active Toggle */}
            <View style={[styles.activeContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.activeContent}>
                <Ionicons 
                  name={isActive ? 'checkmark-circle' : 'pause-circle-outline'} 
                  size={24} 
                  color={isActive ? theme.success : theme.textTertiary} 
                />
                <View style={styles.activeTextContainer}>
                  <Text style={[styles.activeLabel, { color: theme.text }]}>Portefeuille actif</Text>
                  <Text style={[styles.activeHint, { color: theme.textTertiary }]}>
                    {isActive ? 'Les transactions sont autorisées' : 'Les transactions sont bloquées'}
                  </Text>
                </View>
              </View>
              <Controller
                control={control}
                name="isActive"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: theme.textTertiary, true: theme.success + '80' }}
                    thumbColor={value ? theme.success : theme.background}
                  />
                )}
              />
            </View>

            {/* Color Grid */}
            <View style={styles.customSection}>
              <Text style={[styles.customLabel, { color: theme.textTertiary }]}>Couleur</Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map(color => (
                  <TouchableOpacity 
                    key={color}
                    onPress={() => setValue('color', color)}
                    style={[
                      styles.colorCircle, 
                      { backgroundColor: color },
                      selectedColor === color && styles.colorActive
                    ]}
                  >
                    {selectedColor === color && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Automatic Payment Section */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Versement automatique</Text>
            <Text style={[styles.hintText, { color: theme.textTertiary, marginBottom: 12 }]}>
              Configurez un montant qui sera versé automatiquement
            </Text>

            {/* Frequency Selector */}
            <View style={styles.frequencyContainer}>
              {FREQUENCY_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.frequencyButton, 
                    { backgroundColor: theme.background },
                    selectedFrequency === item.type && { backgroundColor: selectedColor || theme.primary }
                  ]}
                  onPress={() => handleFrequencyChange(item.type)}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={18} 
                    color={selectedFrequency === item.type ? '#fff' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.frequencyText, 
                    { color: selectedFrequency === item.type ? '#fff' : theme.textSecondary }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount and Day inputs - only show if frequency is not NOT_SPECIFIED */}
            {selectedFrequency !== 'NOT_SPECIFIED' && (
              <View style={styles.paymentDetailsContainer}>
                {/* Amount Input */}
                <Text style={[styles.customLabel, { color: theme.textTertiary }]}>Montant (Ar)</Text>
                <Controller
                  control={control}
                  name="walletAutomaticIncome.amount"
                  render={({ field: { onChange, value } }) => (
                    <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                      <Ionicons name="cash-outline" size={20} color={selectedColor || theme.primary} />
                      <TextInput 
                        style={[styles.input, { color: theme.text }]} 
                        placeholder="Ex: 50000"
                        placeholderTextColor={theme.textTertiary}
                        value={value?.toString() || ''} 
                        onChangeText={onChange}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />

                {/* Day Input - only for MENSUAL and YEARLY */}
                {selectedFrequency !== 'DAILY' && (
                  <>
                    <Text style={[styles.customLabel, { color: theme.textTertiary, marginTop: 12 }]}>
                      Jour du {selectedFrequency === 'MENSUAL' ? 'mois' : 'versement'}
                    </Text>
                    <Controller
                      control={control}
                      name="walletAutomaticIncome.paymentDay"
                      render={({ field: { onChange, value } }) => (
                        <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                          <Ionicons name="calendar-outline" size={20} color={selectedColor || theme.primary} />
                          <TextInput 
                            style={[styles.input, { color: theme.text }]} 
                            placeholder={selectedFrequency === 'MENSUAL' ? "Ex: 1" : "Ex: 15"}
                            placeholderTextColor={theme.textTertiary}
                            value={value?.toString() || '1'} 
                            onChangeText={onChange}
                            keyboardType="numeric"
                            maxLength={2}
                          />
                        </View>
                      )}
                    />
                  </>
                )}

                {/* Summary */}
                <View style={[styles.summaryCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="information-circle" size={20} color={selectedColor || theme.primary} />
                  <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
                    {selectedFrequency === 'DAILY' && `Un montant de ${frequencyAmount || 0} Ar sera ajouté chaque jour`}
                    {selectedFrequency === 'MENSUAL' && `Un montant de ${frequencyAmount || 0} Ar sera ajouté le jour ${frequencyDay || 1} de chaque mois`}
                    {selectedFrequency === 'YEARLY' && `Un montant de ${frequencyAmount || 0} Ar sera ajouté le jour ${frequencyDay || 1} de chaque année`}
                  </Text>
                </View>
              </View>
            )}

            {/* Preview Card */}
            <View style={[styles.previewCard, { backgroundColor: (selectedColor || theme.primary) + '10', borderColor: (selectedColor || theme.primary) + '30' }]}>
              <View style={[styles.previewIcon, { backgroundColor: selectedColor || theme.primary }]}>
                <Ionicons name={currentIcon as any} size={24} color="#fff" />
              </View>
              <View style={styles.previewContent}>
                <Text style={[styles.previewName, { color: theme.text }]}>
                  {walletName || 'Nom du portefeuille'}
                </Text>
                <Text style={[styles.previewType, { color: theme.textSecondary }]}>
                  {WALLET_TYPES.find(t => t.type === selectedType)?.label}
                </Text>
                <Text style={[styles.previewHint, { color: theme.textTertiary }]}>
                  Aperçu
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: selectedColor || theme.primary }, isUpdating && { opacity: 0.7 }]} 
              onPress={handleSubmit(onSubmit)}
              disabled={isUpdating}
            >
              {isUpdating ? 
                <ActivityIndicator color="#fff" /> : 
                <View style={styles.submitContent}>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.submitBtnText}>Modifier</Text>
                </View>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    maxHeight: '90%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  handleBar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  titleIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleContent: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  hintText: { fontSize: 13, marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    borderRadius: 12,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16 },
  descriptionContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    minHeight: 80,
  },
  descriptionIcon: { marginTop: 2 },
  descriptionInput: { 
    flex: 1, 
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorText: { fontSize: 12, marginTop: 4, marginLeft: 4 },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  typeButton: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 12,
    gap: 8,
  },
  typeText: { fontSize: 13, fontWeight: '600' },
  customSection: { marginTop: 16 },
  customLabel: { fontSize: 13, marginBottom: 10 },
  iconPreviewContainer: { alignItems: 'center', gap: 8 },
  iconPreview: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  iconPreviewText: { fontSize: 13 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  colorActive: { borderWidth: 3, borderColor: '#fff' },
  activeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1,
    marginTop: 16,
  },
  activeContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  activeTextContainer: { flex: 1 },
  activeLabel: { fontSize: 15, fontWeight: '600' },
  activeHint: { fontSize: 12, marginTop: 2 },
  frequencyContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  frequencyButton: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10,
    gap: 6,
  },
  frequencyText: { fontSize: 12, fontWeight: '600' },
  paymentDetailsContainer: { marginTop: 16 },
  summaryCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    marginTop: 12,
    gap: 8,
  },
  summaryText: { flex: 1, fontSize: 13 },
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 20, gap: 12 },
  previewIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  previewContent: { flex: 1 },
  previewName: { fontSize: 16, fontWeight: '600' },
  previewType: { fontSize: 13, marginTop: 2 },
  previewHint: { fontSize: 11, marginTop: 4 },
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

