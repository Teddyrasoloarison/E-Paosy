import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useGoals } from '../hooks/useGoals';
import { useWallets } from '../hooks/useWallets';
import { goalSchema, GoalFormData } from '../utils/goalSchema';
import { GoalItem } from '../types/goal';

interface Props {
  visible: boolean;
  onClose: () => void;
  goal: GoalItem; // L'objectif à modifier
}

const PRESET_COLORS = ['#2E7D32', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#37474F'];
const PRESET_ICONS = ['cart', 'airplane', 'car', 'home', 'gift', 'school'];

export default function EditGoalModal({ visible, onClose, goal }: Props) {
  const { updateGoal, isUpdating } = useGoals();
  const { wallets } = useWallets();

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as any,
  });

  // 🟢 Synchronisation des données à l'ouverture
  useEffect(() => {
    if (visible && goal) {
      reset({
        name: goal.name,
        amount: goal.amount,
        walletId: goal.walletId,
        color: goal.color,
        iconRef: goal.iconRef,
        startingDate: goal.startingDate,
        endingDate: goal.endingDate,
      });
    }
  }, [goal, visible, reset]);

  const selectedColor = watch('color');
  const selectedIcon = watch('iconRef');
  const selectedWalletId = watch('walletId');

  const onSubmit: SubmitHandler<GoalFormData> = (data) => {
    updateGoal(
      { 
        goalId: goal.id,
        walletId: data.walletId, 
        data: {
          ...data,
          accountId: goal.accountId,
          startingDate: new Date(data.startingDate).toISOString(),
          endingDate: new Date(data.endingDate).toISOString(),
        } 
      },
      {
        onSuccess: () => {
          Alert.alert("Succès", "Objectif mis à jour");
          onClose();
        },
        onError: (err: any) => {
          Alert.alert("Erreur", err.response?.data?.message || "Erreur de mise à jour");
        }
      }
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Modifier l'objectif</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} /></TouchableOpacity>
            </View>

            <Text style={styles.label}>Nom</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput style={styles.input} onChangeText={onChange} value={value} />
              )}
            />

            <Text style={styles.label}>Montant cible (Ar)</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  onChangeText={onChange}
                  value={value?.toString()}
                />
              )}
            />

            <Text style={styles.label}>Portefeuille</Text>
            <View style={{ height: 50 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

            <Text style={styles.label}>Style</Text>
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
              style={[styles.submitBtn, { backgroundColor: selectedColor }]} 
              onPress={handleSubmit(onSubmit)}
              disabled={isUpdating}
            >
              {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Sauvegarder</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Les styles sont identiques à CreateGoalModal
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 8, color: '#666' },
  input: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12, fontSize: 16 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10, height: 35 },
  customRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '45%', gap: 8 },
  iconBtn: { padding: 10, backgroundColor: '#F0F0F0', borderRadius: 10 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '45%', gap: 10, justifyContent: 'flex-end' },
  colorCircle: { width: 30, height: 30, borderRadius: 15 },
  colorActive: { borderWidth: 3, borderColor: '#DDD' },
  submitBtn: { padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});