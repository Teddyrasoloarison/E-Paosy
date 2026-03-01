import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, BackHandler, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useModernAlert } from '../hooks/useModernAlert';
import { useProjectTransactions } from '../hooks/useProjectTransactions';
import { useThemeStore } from '../store/useThemeStore';
import { Project } from '../types/project';
import { projectTransactionSchema, ProjectTransactionFormData } from '../utils/projectTransactionSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
  project: Project;
}

export default function CreateProjectTransactionModal({ visible, onClose, project }: Props) {
  const { createTransaction, isCreating } = useProjectTransactions(project.id);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { success: showSuccess, error: showError } = useModernAlert();
  
  const projectColor = project.color || theme.primary;
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    watch, 
    formState: { errors } 
} = useForm<ProjectTransactionFormData>({
    resolver: zodResolver(projectTransactionSchema) as any,
    defaultValues: {
      name: '', 
      description: '', 
      estimatedCost: 0,
      realCost: 0,
    }
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      reset({ 
        name: '', 
        description: '', 
        estimatedCost: 0,
        realCost: 0,
      });
    }
  }, [visible, reset]);

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

  const transactionName = watch('name');
  const estimatedCost = watch('estimatedCost');

const onSubmit: SubmitHandler<ProjectTransactionFormData> = (data) => {
    const payload = {
      ...data,
      realCost: data.realCost || undefined,
    };
    
    createTransaction(payload, {
      onSuccess: () => {
        showSuccess("Succès", "Transaction créée avec succès !");
        reset();
        onClose();
      },
      onError: (error: any) => {
        showError("Erreur", error.response?.data?.message || "Erreur serveur");
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={[styles.titleIcon, { backgroundColor: projectColor + '15' }]}>
                <Ionicons name="receipt" size={24} color={projectColor} />
              </View>
              <View style={styles.titleContent}>
                <Text style={[styles.title, { color: theme.text }]}>Nouvelle Transaction</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Ajouter un coût au projet
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Project Info */}
            <View style={[styles.projectInfo, { backgroundColor: projectColor + '10', borderColor: projectColor + '30' }]}>
              <Ionicons name="folder" size={20} color={projectColor} />
              <Text style={[styles.projectName, { color: theme.text }]}>{project.name}</Text>
            </View>

            {/* Transaction Name */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nom de la transaction</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="pricetag-outline" size={20} color={projectColor} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Ex: Achat matériaux" 
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
                  <Ionicons name="document-text-outline" size={20} color={projectColor} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Détails..."
                    placeholderTextColor={theme.textTertiary}
                    value={value} 
                    onChangeText={onChange} 
                  />
                </View>
              )}
            />

            {/* Estimated Cost */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Coût estimé</Text>
            <Controller
              control={control}
              name="estimatedCost"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="calculator-outline" size={20} color={projectColor} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="0"
                    placeholderTextColor={theme.textTertiary}
                    value={value?.toString() || ''} 
                    onChangeText={onChange}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
            {errors.estimatedCost && <Text style={[styles.errorText, { color: theme.error }]}>{errors.estimatedCost.message}</Text>}

            {/* Real Cost */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Coût réel (optionnel)</Text>
            <Controller
              control={control}
              name="realCost"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="cash-outline" size={20} color={projectColor} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="0"
                    placeholderTextColor={theme.textTertiary}
                    value={value?.toString() || ''} 
                    onChangeText={onChange}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />

            {/* Preview Card */}
            <View style={[styles.previewCard, { backgroundColor: projectColor + '10', borderColor: projectColor + '30' }]}>
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Projet:</Text>
                <Text style={[styles.previewValue, { color: theme.text }]}>{project.name}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Transaction:</Text>
                <Text style={[styles.previewValue, { color: theme.text }]}>{transactionName || '-'}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Estimation:</Text>
                <Text style={[styles.previewValue, { color: projectColor }]}>{estimatedCost?.toLocaleString() || 0} Ar</Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: projectColor }, isCreating && { opacity: 0.7 }]} 
              onPress={handleSubmit(onSubmit)}
              disabled={isCreating}
            >
              {isCreating ? 
                <ActivityIndicator color="#fff" /> : 
                <View style={styles.submitContent}>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.submitBtnText}>Ajouter</Text>
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
    maxHeight: '90%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  handleBar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  titleIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleContent: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
  projectInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  projectName: { fontSize: 14, fontWeight: '600', flex: 1 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 },
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
  previewCard: { 
    padding: 14, 
    borderRadius: 14, 
    borderWidth: 1, 
    marginTop: 20,
  },
  previewRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8,
  },
  previewLabel: { fontSize: 13 },
  previewValue: { fontSize: 13, fontWeight: '600' },
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
