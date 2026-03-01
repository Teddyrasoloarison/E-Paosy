import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, BackHandler, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useLabels } from '../hooks/useLabels';
import { useModernAlert } from '../hooks/useModernAlert';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useThemeStore } from '../store/useThemeStore';
import { LabelItem } from '../types/label';
import { TransactionFormData, TransactionItem } from '../types/transaction';
import { transactionSchema } from '../utils/transactionSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
  transaction: TransactionItem;
}

export default function EditTransactionModal({ visible, onClose, transaction }: Props) {
  const { updateTransaction, isUpdating } = useTransactions();
  const { wallets } = useWallets();
  const { labels } = useLabels();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as any,
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

  useEffect(() => {
    if (visible && transaction) {
      // Normalize type: trim + uppercase to avoid whitespace/case issues
      const normalizedType = String(transaction.type || '').trim().toUpperCase();
      console.log('EditTransactionModal open - transaction.type:', JSON.stringify(transaction.type), 'normalized:', normalizedType);
      reset({
        description: transaction.description,
        amount: transaction.amount,
        type: normalizedType === 'IN' ? 'IN' : 'OUT',
        walletId: transaction.walletId,
        labels: transaction.labels && transaction.labels.length > 0 ? transaction.labels[0].id : '',
        date: transaction.date,
      });
    }
  }, [transaction, visible, reset]);

  const selectedType = watch('type');
  const selectedLabel = watch('labels') || '';
  const selectedWalletId = watch('walletId');

  const { success: showSuccess, error: showError } = useModernAlert();

  const onSubmit: SubmitHandler<TransactionFormData> = (data) => {
    // Debug: log submitted form data
    console.log('EditTransactionModal onSubmit - raw form data:', data);
    // Ensure type is normalized before sending to backend
    const normalizedType = String(data.type || '').trim().toUpperCase();
    const finalType = normalizedType === 'IN' ? 'IN' : 'OUT';
    // Keep form state consistent
    setValue('type', finalType);
    console.log('EditTransactionModal onSubmit - normalized type:', finalType);
    updateTransaction(
      { 
        transactionId: transaction.id,
        walletId: data.walletId,
        data: {
          description: data.description,
          amount: data.amount,
          type: finalType,
          labels: data.labels ? [{ id: data.labels }] : [],
          date: new Date(data.date).toISOString(),
          walletId: data.walletId,
          accountId: transaction.accountId
        } as any
      },
      {
        onSuccess: () => {
          showSuccess("Succès", "Transaction mise à jour");
          onClose();
        },
        onError: (err: any) => {
          showError("Erreur", err.response?.data?.message || "Erreur lors de la modification");
        }
      }
    );
  };

  const toggleLabel = (id: string) => {
    // Only allow ONE label - if same label is clicked, deselect it
    if (selectedLabel === id) {
      setValue('labels', '');
    } else {
      setValue('labels', id);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={[styles.titleIcon, { backgroundColor: theme.secondary + '15' }]}>
                <Ionicons name="create" size={24} color={theme.secondary} />
              </View>
              <View style={styles.titleContent}>
                <Text style={[styles.title, { color: theme.text }]}>Modifier Transaction</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Mettez a jour les details</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <View style={styles.typeContainer}>
              <TouchableOpacity 
                style={[styles.typeBtn, selectedType === 'OUT' && { backgroundColor: theme.error }]}
                onPress={() => setValue('type', 'OUT')}
              >
                <Ionicons name="arrow-up-circle" size={24} color={selectedType === 'OUT' ? '#fff' : theme.textSecondary} />
                <Text style={[styles.typeText, { color: selectedType === 'OUT' ? '#fff' : theme.textSecondary }]}>Depense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, selectedType === 'IN' && { backgroundColor: theme.success }]}
                onPress={() => setValue('type', 'IN')}
              >
                <Ionicons name="arrow-down-circle" size={24} color={selectedType === 'IN' ? '#fff' : theme.textSecondary} />
                <Text style={[styles.typeText, { color: selectedType === 'IN' ? '#fff' : theme.textSecondary }]}>Revenu</Text>
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Montant (Ar)</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="cash-outline" size={20} color={theme.primary} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    keyboardType="numeric"
                    placeholderTextColor={theme.textTertiary}
                    onChangeText={(val) => onChange(val.replace(',', '.'))}
                    value={value === 0 ? '' : value?.toString()}
                  />
                </View>
              )}
            />
            {errors.amount && <Text style={[styles.errorText, { color: theme.error }]}>{errors.amount.message}</Text>}

            {/* Wallet */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Portefeuille</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
              {wallets.map((w) => {
                const isDisabled = w.isActive === false;
                return (
                  <TouchableOpacity 
                    key={w.id} 
                    style={[
                      styles.chip, 
                      { backgroundColor: theme.background }, 
                      selectedWalletId === w.id && { backgroundColor: theme.primary },
                      isDisabled && { backgroundColor: theme.border }
                    ]}
                    onPress={() => !isDisabled && setValue('walletId', w.id)}
                    disabled={isDisabled}
                  >
                    <Ionicons 
                      name="wallet-outline" 
                      size={14} 
                      color={selectedWalletId === w.id ? '#fff' : isDisabled ? theme.textSecondary : theme.textSecondary} 
                    />
                    <Text style={{ 
                      color: selectedWalletId === w.id ? '#fff' : isDisabled ? theme.textSecondary : theme.text, 
                      marginLeft: 6 
                    }}>
                      {w.name}
                      {isDisabled && ' (Désactivé)'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Description */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="document-text-outline" size={20} color={theme.primary} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Description..."
                    placeholderTextColor={theme.textTertiary}
                    onChangeText={onChange} 
                    value={value} 
                  />
                </View>
              )}
            />

            {/* Labels - Single Selection with None option */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Label (unique)</Text>
            <View style={styles.labelsGrid}>
              {labels?.map((l: LabelItem) => (
                <TouchableOpacity 
                  key={l.id} 
                  style={[styles.labelChip, { borderColor: l.color }, selectedLabel === l.id && { backgroundColor: l.color }]}
                  onPress={() => toggleLabel(l.id)}
                >
                  <Text style={{ color: selectedLabel === l.id ? '#fff' : l.color, fontWeight: '600' }}>{l.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit */}
            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: theme.primary }, isUpdating && { opacity: 0.7 }]} 
              onPress={handleSubmit(onSubmit)}
              disabled={isUpdating}
            >
              {isUpdating ? <ActivityIndicator color="#fff" /> : (
                <View style={styles.submitContent}>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.submitText}>Enregistrer</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '90%',
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, gap: 10 },
  input: { flex: 1, fontSize: 16 },
  errorText: { fontSize: 12, marginTop: 4 },
  typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  typeBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  typeText: { fontWeight: '700', fontSize: 15 },
  selectorScroll: { marginTop: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, flexDirection: 'row', alignItems: 'center' },
  labelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  labelChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5 },
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 28, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 17 }
});
