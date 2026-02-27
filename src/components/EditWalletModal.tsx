import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, BackHandler, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useModernAlert } from '../hooks/useModernAlert';
import { useWallets } from '../hooks/useWallets';
import { useThemeStore } from '../store/useThemeStore';
import { Wallet, WalletType } from '../types/wallet';
import { WalletFormData, walletSchema } from '../utils/walletSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
  wallet: Wallet;
}

const WALLET_TYPES: { type: WalletType; icon: string; label: string }[] = [
  { type: 'CASH', icon: 'cash', label: 'Espèces' },
  { type: 'MOBILE_MONEY', icon: 'phone-portrait', label: 'Mobile Money' },
  { type: 'BANK', icon: 'business', label: 'Banque' },
  { type: 'DEBT', icon: 'person-remove', label: 'Dette' },
];

export default function EditWalletModal({ visible, onClose, wallet }: Props) {
  const { updateWallet, isUpdating } = useWallets();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { success: showSuccess, error: showError } = useModernAlert();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: wallet.name,
      description: wallet.description || '',
      type: wallet.type
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
        type: wallet.type
      });
    }
  }, [visible, wallet, reset]);

  const selectedType = watch('type');
  const walletName = watch('name');

  const onSubmit = (data: WalletFormData) => {
    updateWallet(
      { walletId: wallet.id, data },
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
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />

          <View style={styles.header}>
            <View style={[styles.titleIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="create" size={24} color={theme.primary} />
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
                <Ionicons name="wallet-outline" size={20} color={theme.primary} />
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
              <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="document-text-outline" size={20} color={theme.primary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Petite note..."
                  placeholderTextColor={theme.textTertiary}
                  value={value}
                  onChangeText={onChange}
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
                  selectedType === item.type && { backgroundColor: theme.primary }
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

          {/* Preview Card */}
          <View style={[styles.previewCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
            <View style={[styles.previewIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name={WALLET_TYPES.find(t => t.type === selectedType)?.icon as any || 'wallet'} size={24} color="#fff" />
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
            style={[styles.submitBtn, { backgroundColor: theme.primary }, isUpdating && { opacity: 0.7 }]}
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  content: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '85%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  handleBar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  titleIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleContent: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16 },
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
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 20, gap: 12 },
  previewIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  previewContent: { flex: 1 },
  previewName: { fontSize: 16, fontWeight: '600' },
  previewType: { fontSize: 13, marginTop: 2 },
  previewHint: { fontSize: 11, marginTop: 4 },
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
