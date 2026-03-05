import React from 'react';
import { 
  Modal, View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ScrollView, ActivityIndicator 
} from 'react-native';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';

import { goalSchema, GoalFormData } from '../utils/goalSchema';
import { useGoals } from '../hooks/useGoals';
import { useWallets } from '../hooks/useWallet'; // Le hook de tes amis

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddGoalModal({ visible, onClose }: Props) {
  const { createGoal, isCreating } = useGoals();
  const { data: walletsData, isLoading: isLoadingWallets } = useWallets();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as any, 
    mode: "onChange",
    defaultValues: {
      name: '',
      amount: 0,
      walletId: '',
      startingDate: new Date().toISOString().split('T')[0],
      endingDate: '',
    }
  });

  const onSubmit = (data: GoalFormData) => {
    createGoal(data, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Nouvel Objectif</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            {/* Champ Nom */}
            <Text style={styles.label}>Nom de l'objectif</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={styles.input} 
                  placeholder="Ex: Voyage, Épargne..." 
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            {/* Champ Montant */}
            <Text style={styles.label}>Montant cible (Ar)</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={styles.input} 
                  placeholder="0"
                  keyboardType="numeric"
                  value={value?.toString()}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

            {/* Sélection du Wallet */}
            <Text style={styles.label}>Associer à un portefeuille</Text>
            {isLoadingWallets ? (
              <ActivityIndicator color="#4CAF50" />
            ) : (
              <Controller
                control={control}
                name="walletId"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.walletList}>
                    {walletsData?.values.map((wallet) => (
                      <TouchableOpacity 
                        key={wallet.id}
                        style={[styles.walletItem, value === wallet.id && styles.walletSelected]}
                        onPress={() => onChange(wallet.id)}
                      >
                        <Text style={[styles.walletText, value === wallet.id && styles.walletTextSelected]}>
                          {wallet.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            )}
            {errors.walletId && <Text style={styles.errorText}>{errors.walletId.message}</Text>}

            {/* Dates (Format simple YYYY-MM-DD pour le moment) */}
            <Text style={styles.label}>Date de fin (AAAA-MM-JJ)</Text>
            <Controller
              control={control}
              name="endingDate"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={styles.input} 
                  placeholder="2026-12-31"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.endingDate && <Text style={styles.errorText}>{errors.endingDate.message}</Text>}

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit(onSubmit)}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Créer l'objectif</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  form: { paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 12, fontSize: 16 },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  walletList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  walletItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  walletSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  walletText: { color: '#666' },
  walletTextSelected: { color: '#fff', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 30 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});