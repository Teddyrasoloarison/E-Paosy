import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useLabels } from '../hooks/useLabels';
import { useModernAlert } from '../hooks/useModernAlert';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { useGoals } from '../hooks/useGoals';
import { LabelItem } from '../types/label';
import { TransactionFormData, transactionSchema } from '../utils/transactionSchema';


interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreateTransactionModal({ visible, onClose }: Props) {
  const accountId = useAuthStore((state) => state.accountId);
  const { createTransaction, isCreating } = useTransactions();
  const { wallets } = useWallets();
  const { labels } = useLabels();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { success: showSuccess } = useModernAlert();
  
  const [walletIdForGoals, setWalletIdForGoals] = useState<string | undefined>();
  const { goals: walletGoals, isLoading: isLoadingGoals } = useGoals({ walletId: walletIdForGoals, status: 'in_progress' });


  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      description: '',
      amount: 0,
      type: 'OUT',
      walletId: '',
      labels: '',
      date: new Date().toISOString(),
      goalId: undefined,
    }
  });

  const selectedType = watch('type');
  const selectedLabel = watch('labels') || '';
  const selectedWalletId = watch('walletId');
  const selectedGoalId = watch('goalId');
  
  useEffect(() => {
    if (selectedType === 'IN' && selectedWalletId) {
      setWalletIdForGoals(selectedWalletId);
    } else {
      setWalletIdForGoals(undefined); // Ceci va retirer le filtre et vider les 'walletGoals'
      setValue('goalId', undefined); // Désélectionner l'objectif si on change de type ou de portefeuille
    }
  }, [selectedType, selectedWalletId, setValue]);


  const onSubmit: SubmitHandler<TransactionFormData> = (data) => {
    if (!accountId) return;

    const payload = {
      walletId: data.walletId,
      data: {
        description: data.description,
        amount: Number(data.amount),
        type: data.type,
        labels: data.labels ? [{ id: data.labels }] : [],
        date: new Date(data.date).toISOString(),
        walletId: data.walletId,
        accountId: accountId,
        goalId: data.goalId,
      }
    };

    createTransaction(payload, {
      onSuccess: () => {
        showSuccess("Succès", "Transaction enregistrée !");
        reset();
        onClose();
      },
      onError: (err: any) => {
        console.error("Detail erreur:", err.response?.data);
      }
    });
  };

  const toggleLabel = (id: string) => {
    // Only allow ONE label - if same label is clicked, deselect it
    if (selectedLabel === id) {
      setValue('labels', '');
    } else {
      setValue('labels', id);
    }
  };
  
  const toggleGoal = (id: string) => {
    if (selectedGoalId === id) {
      setValue('goalId', undefined);
    } else {
      setValue('goalId', id);
    }
  };

  const renderGoalOptions = () => {
    // Toujours afficher l'option "Aucun" en premier
    const goalOptions = [
      { id: 'none', name: 'Aucun', color: '#9CA3AF' },
      ...walletGoals
    ];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
        {goalOptions.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[
              styles.chip,
              { backgroundColor: theme.background, borderColor: g.color, borderWidth: 1.5 },
              selectedGoalId === g.id && { backgroundColor: g.color }
            ]}
            onPress={() => toggleGoal(g.id)}
          >
            <Ionicons 
              name={g.id === 'none' ? "close-circle-outline" : "golf-outline"} 
              size={14} 
              color={selectedGoalId === g.id ? '#fff' : g.color} 
            />
            <Text style={{ color: selectedGoalId === g.id ? '#fff' : theme.text, marginLeft: 6 }}>
              {g.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
              <Text style={[styles.title, { color: theme.text }]}>Nouvelle Transaction</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeBtn, 
                  selectedType === 'OUT' && { backgroundColor: theme.error }
                ]}
                onPress={() => setValue('type', 'OUT')}
              >
                <Ionicons 
                  name="arrow-up-circle" 
                  size={24} 
                  color={selectedType === 'OUT' ? '#fff' : theme.textSecondary} 
                />
                <Text style={[
                  styles.typeText, 
                  { color: selectedType === 'OUT' ? '#fff' : theme.textSecondary }
                ]}>
                  Depense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn, 
                  selectedType === 'IN' && { backgroundColor: theme.success }
                ]}
                onPress={() => setValue('type', 'IN')}
              >
                <Ionicons 
                  name="arrow-down-circle" 
                  size={24} 
                  color={selectedType === 'IN' ? '#fff' : theme.textSecondary} 
                />
                <Text style={[
                  styles.typeText, 
                  { color: selectedType === 'IN' ? '#fff' : theme.textSecondary }
                ]}>
                  Revenu
                </Text>
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
                    style={[styles.input, { color: theme.text }, errors.amount && styles.inputError]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={theme.textTertiary}
                    onChangeText={(val) => onChange(val.replace(',', '.'))}
                    value={value === 0 ? '' : value.toString()}
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
                      isDisabled && { opacity: 0.5, backgroundColor: theme.border }
                    ]}
                    onPress={() => !isDisabled && setValue('walletId', w.id)}
                    disabled={isDisabled}
                  >
                    <Ionicons 
                      name="wallet-outline" 
                      size={14} 
                      color={selectedWalletId === w.id ? '#fff' : isDisabled ? theme.textTertiary : theme.textSecondary} 
                    />
                    <Text style={{ 
                      color: selectedWalletId === w.id ? '#fff' : isDisabled ? theme.textTertiary : theme.text, 
                      marginLeft: 6
                    }}>
                      {w.name}
                      {isDisabled && ' (Désactivé)'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {errors.walletId && <Text style={[styles.errorText, { color: theme.error }]}>{errors.walletId.message}</Text>}

            {/* Goal Selector (Conditional) */}
            {selectedType === 'IN' && selectedWalletId && (
              <>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Lier à un objectif (Optionnel)</Text>
                {isLoadingGoals ? (
                  <ActivityIndicator color={theme.primary} style={{ marginTop: 10 }} />
                ) : (
                  renderGoalOptions()
                )}
              </>
            )}

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
                    placeholder="Libelle de la transaction"
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
                  style={[
                    styles.labelChip, 
                    { borderColor: l.color },
                    selectedLabel === l.id && { backgroundColor: l.color }
                  ]}
                  onPress={() => toggleLabel(l.id)}
                >
                  <Text style={{ color: selectedLabel === l.id ? '#fff' : l.color, fontWeight: '600' }}>{l.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }, isCreating && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isCreating}
            >
              {isCreating ? 
                <ActivityIndicator color="#fff" /> : 
                <View style={styles.submitContent}>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.submitText}>Confirmer</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700' },
  closeButton: { padding: 4 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    borderRadius: 12,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16, padding: 0 },
  inputError: { borderWidth: 1, borderColor: '#F44336' },
  errorText: { fontSize: 12, marginTop: 4, marginLeft: 4 },
  typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  typeBtn: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center', 
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  typeText: { fontWeight: '700', fontSize: 15 },
  selectorScroll: { marginTop: 4, marginBottom: 8 },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  labelChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5 },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  goalChip: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 16, 
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '45%',
  },
  goalChipContent: { flex: 1 },
  helperText: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 28, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 17 }
});
