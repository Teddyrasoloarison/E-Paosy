import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, Platform, BackHandler } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useLabels } from '../hooks/useLabels';
import { labelSchema, LabelFormData } from '../utils/labelSchema';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PRESET_COLORS = ['#0D9488', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#37474F', '#2563EB', '#059669', '#DC2626', '#7C3AED', '#0891B2', '#4F46E5'];

export default function CreateLabelModal({ visible, onClose }: Props) {
  const { createLabel, isCreating } = useLabels();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: { name: '', color: '#0D9488' }
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

  const selectedColor = watch('color');
  const labelName = watch('name');

  const onSubmit = (data: LabelFormData) => {
    createLabel(data, {
      onSuccess: () => {
        Alert.alert("Succes", "Label cree !");
        reset();
        onClose();
      },
      onError: (error: any) => {
        Alert.alert("Erreur", error.response?.data?.message || "Erreur serveur");
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
          
          <View style={styles.header}>
            <View style={[styles.titleIcon, { backgroundColor: selectedColor + '15' }]}>
              <Ionicons name="pricetag" size={24} color={selectedColor} />
            </View>
            <View style={styles.titleContent}>
              <Text style={[styles.title, { color: theme.text }]}>Nouveau Label</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Creez une nouvelle etiquette</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Name Field */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Nom du label</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="pricetag-outline" size={20} color={selectedColor} />
                <TextInput 
                  style={[styles.input, { color: theme.text }]} 
                  placeholder="Ex: Alimentation, Loyer..."
                  placeholderTextColor={theme.textTertiary}
                  value={value} 
                  onChangeText={onChange} 
                />
              </View>
            )}
          />
          {errors.name && <Text style={[styles.errorText, { color: theme.error }]}>{errors.name.message}</Text>}

          {/* Color Selector */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Couleur</Text>
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
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <View style={[styles.previewCard, { backgroundColor: selectedColor + '15', borderColor: selectedColor }]}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
              <Ionicons name="pricetag" size={20} color="#fff" />
            </View>
            <View style={styles.previewContent}>
              <Text style={[styles.previewText, { color: theme.text }]}>
                {labelName || 'Apercu du label'}
              </Text>
              <Text style={[styles.previewSubtext, { color: theme.textSecondary }]}>
                Comment il apparaitra
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: selectedColor }, isCreating && { opacity: 0.7 }]} 
            onPress={handleSubmit(onSubmit)}
            disabled={isCreating}
          >
            {isCreating ? 
              <ActivityIndicator color="#fff" /> : 
              <View style={styles.submitContent}>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.submitBtnText}>Creer le label</Text>
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
    maxHeight: '75%',
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
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, gap: 10 },
  input: { flex: 1, fontSize: 16 },
  errorText: { fontSize: 12, marginTop: 4 },
  colorContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  colorCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  colorCircleSelected: { borderWidth: 3, borderColor: '#fff' },
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 20, gap: 12 },
  previewIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  previewContent: { flex: 1 },
  previewText: { fontSize: 15, fontWeight: '600' },
  previewSubtext: { fontSize: 12, marginTop: 2 },
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
