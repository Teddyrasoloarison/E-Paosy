import React from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useLabels } from '../hooks/useLabels';
import { transactionSchema, TransactionFormData } from '../utils/transactionSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreateTransactionModal({ visible, onClose }: Props) {
  const { createTransaction, isCreating } = useTransactions();
  const { wallets } = useWallets();
  const { data: labelsData } = useLabels();

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionFormData>({
    // Le "as any" ici débloque le conflit de types complexe de Zod Coerce
    resolver: zodResolver(transactionSchema) as any, 
    defaultValues: {
      description: '',
      amount: 0,
      type: 'OUT',
      walletId: '',
      labels: [],
      date: new Date().toISOString(),
    }
  });

  const selectedType = watch('type');
  const selectedLabels = watch('labels') || [];
  const selectedWalletId = watch('walletId');

  const onSubmit: SubmitHandler<TransactionFormData> = (data) => {
    createTransaction(
      { 
        walletId: data.walletId, 
        data: {
          description: data.description,
          amount: data.amount,
          type: data.type,
          labels: data.labels,
          date: new Date(data.date).toISOString()
        } 
      },
      {
        onSuccess: () => {
          Alert.alert("Succès", "Transaction enregistrée");
          reset();
          onClose();
        },
        onError: (err: any) => {
          Alert.alert("Erreur", err.response?.data?.message || "Erreur serveur");
        }
      }
    );
  };

  const toggleLabel = (id: string) => {
    const current = [...selectedLabels];
    const index = current.indexOf(id);
    if (index > -1) current.splice(index, 1);
    else current.push(id);
    setValue('labels', current);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Nouvelle Transaction</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} /></TouchableOpacity>
            </View>

            <View style={styles.typeContainer}>
              {(['OUT', 'IN'] as const).map((t) => (
                <TouchableOpacity 
                  key={t}
                  style={[styles.typeBtn, selectedType === t && (t === 'IN' ? styles.typeIn : styles.typeOut)]}
                  onPress={() => setValue('type', t)}
                >
                  <Text style={[styles.typeText, selectedType === t && { color: '#fff' }]}>
                    {t === 'IN' ? 'Revenu' : 'Dépense'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Montant (Ar)</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.input, errors.amount && styles.inputError]} 
                  keyboardType="numeric" 
                  placeholder="0.00"
                  onChangeText={onChange}
                  value={value === 0 ? '' : value.toString()}
                />
              )}
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

            <Text style={styles.label}>Portefeuille</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
              {wallets.map((w) => (
                <TouchableOpacity 
                  key={w.id} 
                  style={[styles.chip, selectedWalletId === w.id && styles.chipSelected]}
                  onPress={() => setValue('walletId', w.id)}
                >
                  <Text style={{ color: selectedWalletId === w.id ? '#fff' : '#333' }}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.walletId && <Text style={styles.errorText}>{errors.walletId.message}</Text>}

            <Text style={styles.label}>Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.input, errors.description && styles.inputError]} 
                  placeholder="Libellé de la transaction" 
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            <Text style={styles.label}>Labels</Text>
            <View style={styles.labelsGrid}>
              {labelsData?.values.map((l) => (
                <TouchableOpacity 
                  key={l.id} 
                  style={[styles.labelChip, { borderColor: l.color }, selectedLabels.includes(l.id) && { backgroundColor: l.color }]}
                  onPress={() => toggleLabel(l.id)}
                >
                  <Text style={{ color: selectedLabels.includes(l.id) ? '#fff' : l.color }}>{l.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, isCreating && { opacity: 0.7 }]} 
              onPress={handleSubmit(onSubmit)}
              disabled={isCreating}
            >
              {isCreating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Confirmer</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 5, color: '#666' },
  input: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, fontSize: 16 },
  inputError: { borderWidth: 1, borderColor: '#F44336' },
  errorText: { color: '#F44336', fontSize: 12, marginTop: 4 },
  typeContainer: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#F5F5F5' },
  typeIn: { backgroundColor: '#4CAF50' },
  typeOut: { backgroundColor: '#F44336' },
  typeText: { fontWeight: 'bold', color: '#666' },
  selectorScroll: { marginTop: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10 },
  chipSelected: { backgroundColor: '#2E7D32' },
  labelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  labelChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1 },
  submitBtn: { backgroundColor: '#1B5E20', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});