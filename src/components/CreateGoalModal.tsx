import React from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../hooks/useGoals';
import { useWallets } from '../hooks/useWallets';
import { goalSchema, GoalFormData } from '../utils/goalSchema';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PRESET_COLORS = ['#2E7D32', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#37474F'];
const PRESET_ICONS = ['cart', 'airplane', 'car', 'home', 'gift', 'school'];

export default function CreateGoalModal({ visible, onClose }: Props) {
  const accountId = useAuthStore((state) => state.accountId);
  const { createGoal, isCreating } = useGoals();
  const { wallets } = useWallets();

  // 🟢 On passe GoalFormData ici
  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<GoalFormData>({
    // 🟢 On ajoute "as any" ici pour régler le conflit de type avec coerce
    resolver: zodResolver(goalSchema) as any,
    defaultValues: {
      name: '',
      amount: 0,
      walletId: '',
      color: PRESET_COLORS[0],
      iconRef: PRESET_ICONS[0],
      startingDate: new Date().toISOString(),
      endingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('iconRef');
  const selectedWalletId = watch('walletId');

  const onSubmit: SubmitHandler<GoalFormData> = (data) => {
    if (!accountId) return;

    createGoal(
      { 
        walletId: data.walletId, 
        data: {
          ...data,
          accountId: accountId,
          // Conversion propre pour l'API
          startingDate: new Date(data.startingDate).toISOString(),
          endingDate: new Date(data.endingDate).toISOString(),
        } 
      },
      {
        onSuccess: () => {
          Alert.alert("Bravo !", "Votre nouvel objectif est fixé.");
          reset();
          onClose();
        },
        onError: (err: any) => {
          Alert.alert("Erreur", err.response?.data?.message || "Impossible de créer l'objectif");
        }
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Nouvel Objectif 🎯</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} /></TouchableOpacity>
            </View>

            <Text style={styles.label}>Nom de l'objectif</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.input, errors.name && styles.inputError]} 
                  placeholder="Ex: Voyage au Japon" 
                  onChangeText={onChange} 
                  value={value} 
                />
              )}
            />
            {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

            <Text style={styles.label}>Montant à atteindre (Ar)</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={[styles.input, errors.amount && styles.inputError]} 
                  keyboardType="numeric" 
                  placeholder="0" 
                  onChangeText={onChange}
                  value={value === 0 ? '' : value.toString()}
                />
              )}
            />
            {errors.amount && <Text style={styles.error}>{errors.amount.message}</Text>}

            <Text style={styles.label}>Portefeuille cible</Text>
            <View style={{ height: 50 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
                {wallets.map((w) => (
                    <TouchableOpacity 
                    key={w.id} 
                    style={[styles.chip, selectedWalletId === w.id && { backgroundColor: '#1B5E20' }]}
                    onPress={() => setValue('walletId', w.id)}
                    >
                    <Text style={{ color: selectedWalletId === w.id ? '#fff' : '#333' }}>{w.name}</Text>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            </View>
            {errors.walletId && <Text style={styles.error}>{errors.walletId.message}</Text>}

            <Text style={styles.label}>Personnalisation</Text>
            <View style={styles.customRow}>
              <View style={styles.iconGrid}>
                {PRESET_ICONS.map(icon => (
                  <TouchableOpacity 
                    key={icon}
                    onPress={() => setValue('iconRef', icon)}
                    style={[styles.iconBtn, selectedIcon === icon && { backgroundColor: selectedColor }]}
                  >
                    <Ionicons name={icon as any} size={20} color={selectedIcon === icon ? '#fff' : '#666'} />
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map(color => (
                  <TouchableOpacity 
                    key={color}
                    onPress={() => setValue('color', color)}
                    style={[styles.colorCircle, { backgroundColor: color }, selectedColor === color && styles.colorActive]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: selectedColor }, isCreating && { opacity: 0.7 }]} 
              onPress={handleSubmit(onSubmit)}
              disabled={isCreating}
            >
              {isCreating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Lancer l'objectif</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 8, color: '#666' },
  input: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12, fontSize: 16 },
  inputError: { borderWidth: 1, borderColor: '#F44336' },
  row: { flexDirection: 'row' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10, height: 35 },
  customRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '45%', gap: 8 },
  iconBtn: { padding: 10, backgroundColor: '#F0F0F0', borderRadius: 10 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '45%', gap: 10, justifyContent: 'flex-end' },
  colorCircle: { width: 30, height: 30, borderRadius: 15 },
  colorActive: { borderWidth: 3, borderColor: '#DDD' },
  submitBtn: { padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: '#F44336', fontSize: 12, marginTop: 5 }
});