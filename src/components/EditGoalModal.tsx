import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useGoals } from '../hooks/useGoals';
import { useModernAlert } from '../hooks/useModernAlert';
import { useWallets } from '../hooks/useWallets';
import { useThemeStore } from '../store/useThemeStore';
import { GoalItem } from '../types/goal';
import { GoalFormData, goalSchema } from '../utils/goalSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
  goal: GoalItem;
}

const PRESET_COLORS = ['#0D9488', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#37474F', '#2563EB', '#059669'];
const PRESET_ICONS = ['cart', 'airplane', 'car', 'home', 'gift', 'school', 'phone-portrait', 'fitness'];

export default function EditGoalModal({ visible, onClose, goal }: Props) {
  const { updateGoal, isUpdating } = useGoals();
  const { wallets } = useWallets();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as any,
  });

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

  const { success: showSuccess, error: showError } = useModernAlert();

  const onSubmit: SubmitHandler<GoalFormData> = (data) => {
    updateGoal(
      { 
        goalId: goal.id,
        walletId: goal.walletId, 
        data: {
          ...data,
          accountId: goal.accountId,
          startingDate: new Date(data.startingDate).toISOString(),
          endingDate: new Date(data.endingDate).toISOString(),
        } 
      },
      {
        onSuccess: () => {
          showSuccess("Succès", "Objectif mis à jour avec succès !");
          onClose();
        },
        onError: (err: any) => {
          showError("Erreur", err.response?.data?.message || "Erreur de mise à jour");
        }
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={[styles.titleRow, { backgroundColor: (selectedColor || theme.primary) + '15' }]}>
                <Ionicons name="flag" size={24} color={selectedColor || theme.primary} />
              </View>
              <View style={styles.titleContent}>
                <Text style={[styles.title, { color: theme.text }]}>Modifier Objectif</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Mettez a jour votre objectif</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Goal Name */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nom de l&apos;objectif</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="flag-outline" size={20} color={selectedColor || theme.primary} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Ex: Voyage au Japon" 
                    placeholderTextColor={theme.textTertiary}
                    onChangeText={onChange} 
                    value={value} 
                  />
                </View>
              )}
            />
            {errors.name && <Text style={[styles.error, { color: theme.error }]}>{errors.name.message}</Text>}

            {/* Amount */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Montant a atteindre (Ar)</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="cash-outline" size={20} color={selectedColor || theme.primary} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    keyboardType="numeric" 
                    placeholder="0"
                    placeholderTextColor={theme.textTertiary}
                    onChangeText={(val) => onChange(val.replace(',', '.'))}
                    value={value === 0 ? '' : value?.toString()}
                  />
                </View>
              )}
            />
            {errors.amount && <Text style={[styles.error, { color: theme.error }]}>{errors.amount.message}</Text>}

            {/* Wallet */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Portefeuille cible</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
              {wallets.map((w) => (
                <TouchableOpacity 
                  key={w.id} 
                  style={[
                    styles.chip, 
                    { backgroundColor: theme.background },
                    selectedWalletId === w.id && { backgroundColor: selectedColor || theme.primary }
                  ]}
                  onPress={() => setValue('walletId', w.id)}
                >
                  <Ionicons name="wallet-outline" size={14} color={selectedWalletId === w.id ? '#fff' : theme.textSecondary} />
                  <Text style={{ color: selectedWalletId === w.id ? '#fff' : theme.text, marginLeft: 6, fontWeight: '600' }}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.walletId && <Text style={[styles.error, { color: theme.error }]}>{errors.walletId.message}</Text>}

            {/* Customization */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Personnalisation</Text>
            
            {/* Icon Grid */}
            <View style={styles.customSection}>
              <Text style={[styles.customLabel, { color: theme.textTertiary }]}>Icone</Text>
              <View style={styles.iconGrid}>
                {PRESET_ICONS.map(icon => (
                  <TouchableOpacity 
                    key={icon}
                    onPress={() => setValue('iconRef', icon)}
                    style={[
                      styles.iconBtn, 
                      { backgroundColor: theme.background },
                      selectedIcon === icon && { backgroundColor: selectedColor || theme.primary }
                    ]}
                  >
                    <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? '#fff' : theme.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
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

            {/* Preview Card */}
            <View style={[styles.previewCard, { backgroundColor: (selectedColor || theme.primary) + '15', borderColor: selectedColor || theme.primary }]}>
              <View style={[styles.previewIcon, { backgroundColor: selectedColor || theme.primary }]}>
                <Ionicons name={(selectedIcon || 'flag') as any} size={28} color="#fff" />
              </View>
              <View style={styles.previewContent}>
                <Text style={[styles.previewName, { color: theme.text }]}>{goal.name || 'Objectif'}</Text>
                <Text style={[styles.previewAmount, { color: selectedColor || theme.primary }]}>
                  {(goal.currentAmount || 0).toLocaleString()} / {goal.amount.toLocaleString()} Ar
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
                  <Text style={styles.submitText}>Sauvegarder</Text>
                </View>
              }
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
    maxHeight: '92%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  handleBar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  titleRow: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleContent: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
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
  input: { flex: 1, fontSize: 16 },
  error: { fontSize: 12, marginTop: 4, marginLeft: 4 },
  selectorScroll: { marginTop: 4 },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customSection: { marginTop: 16 },
  customLabel: { fontSize: 13, marginBottom: 10 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  colorActive: { borderWidth: 3, borderColor: '#fff' },
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 20, gap: 14 },
  previewIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  previewContent: { flex: 1 },
  previewName: { fontSize: 16, fontWeight: '600' },
  previewAmount: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 17 }
});
