import React from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useLabels } from '../hooks/useLabels';
import { labelSchema, LabelFormData } from '../utils/labelSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Liste de couleurs prédéfinies pour ton UI
const PRESET_COLORS = [
  '#4CAF50', '#2196F3', '#9C27B0', '#F44336', 
  '#FF9800', '#795548', '#607D8B', '#009688'
];

export default function CreateLabelModal({ visible, onClose }: Props) {
  const { createLabel, isCreating } = useLabels();
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: { name: '', color: '#4CAF50' }
  });

  // On surveille la couleur sélectionnée pour l'affichage visuel
  const selectedColor = watch('color');

  const onSubmit = (data: LabelFormData) => {
    createLabel(data, {
      onSuccess: () => {
        Alert.alert("Succès", "Label créé !");
        reset();
        onClose();
      },
      onError: (error: any) => {
        Alert.alert("Erreur", error.response?.data?.message || "Erreur serveur");
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Nouveau Label</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* CHAMP NOM */}
          <Text style={styles.label}>Nom du Label</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput 
                  style={[styles.input, errors.name && styles.inputError]} 
                  placeholder="Ex: Alimentation, Loyer..." 
                  value={value} 
                  onChangeText={onChange} 
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </View>
            )}
          />

          {/* SÉLECTEUR DE COULEUR */}
          <Text style={[styles.label, { marginTop: 20 }]}>Couleur</Text>
          <View style={styles.colorContainer}>
            {PRESET_COLORS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.colorCircle, 
                  { backgroundColor: item },
                  selectedColor === item && styles.colorCircleSelected
                ]}
                onPress={() => setValue('color', item)}
              >
                {selectedColor === item && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          {errors.color && <Text style={styles.errorText}>{errors.color.message}</Text>}

          <TouchableOpacity 
            style={[styles.submitBtn, isCreating && styles.btnDisabled]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isCreating}
          >
            {isCreating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Confirmer</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 450 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 5 },
  inputError: { borderWidth: 1, borderColor: '#E53935' },
  errorText: { color: '#E53935', fontSize: 12, marginBottom: 10 },
  
  // Styles pour les cercles de couleur
  colorContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 5 },
  colorCircle: { 
    width: 35, 
    height: 35, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#333',
  },

  submitBtn: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 35 },
  btnDisabled: { backgroundColor: '#A5D6A7' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});