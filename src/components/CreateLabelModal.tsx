import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, BackHandler, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useLabels } from '../hooks/useLabels';
import { useModernAlert } from '../hooks/useModernAlert';
import { useThemeStore } from '../store/useThemeStore';
import { LabelFormData, labelSchema, LABEL_ICONS, LABEL_COLORS } from '../utils/labelSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreateLabelModal({ visible, onClose }: Props) {
  const { createLabel, isCreating } = useLabels();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: { name: '', color: '#0D9488', iconRef: 'pricetag' }
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
  const selectedIcon = watch('iconRef') || 'pricetag';
  const labelName = watch('name');

  const { success: showSuccess, error: showError } = useModernAlert();

  const onSubmit = (data: LabelFormData) => {
    const payload = {
      ...data,
      iconRef: data.iconRef || 'pricetag',
    };
    createLabel(payload, {
      onSuccess: () => {
        showSuccess("Succès", "Label créé !");
        reset();
        onClose();
      },
      onError: (error: any) => {
        showError("Erreur", error.response?.data?.message || "Erreur serveur");
      }
    });
  };

  const handleIconSelect = (icon: string) => {
    setValue('iconRef', icon);
    setShowIconPicker(false);
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
              <View style={[styles.titleIcon, { backgroundColor: selectedColor + '15' }]}>
                <Ionicons name={(selectedIcon as any) || 'pricetag'} size={24} color={selectedColor} />
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

            {/* Icon Selector */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Icône</Text>
            <TouchableOpacity
              style={[styles.iconSelector, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => setShowIconPicker(!showIconPicker)}
            >
              <View style={[styles.selectedIconPreview, { backgroundColor: selectedColor + '20' }]}>
                <Ionicons name={(selectedIcon as any) || 'pricetag'} size={24} color={selectedColor} />
              </View>
              <Text style={[styles.iconSelectorText, { color: theme.text }]}>
                {selectedIcon || 'Sélectionner une icône'}
              </Text>
              <Ionicons name={showIconPicker ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Icon Picker */}
            {showIconPicker && (
              <View style={[styles.iconPicker, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.iconGrid}>
                    {LABEL_ICONS.map((icon) => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          styles.iconOption,
                          selectedIcon === icon && { backgroundColor: selectedColor + '30' },
                          selectedIcon === icon && { borderColor: selectedColor }
                        ]}
                        onPress={() => handleIconSelect(icon)}
                      >
                        <Ionicons
                          name={icon as any}
                          size={22}
                          color={selectedIcon === icon ? selectedColor : theme.textSecondary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Color Selector */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Couleur</Text>
            <View style={styles.colorContainer}>
              {LABEL_COLORS.map((item) => (
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
                <Ionicons name={(selectedIcon as any) || 'pricetag'} size={20} color="#fff" />
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
    maxHeight: '85%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
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
  // Icon selector styles
  iconSelector: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  selectedIconPreview: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  iconSelectorText: { flex: 1, fontSize: 16 },
  iconPicker: { marginTop: 10, padding: 10, borderRadius: 12, borderWidth: 1 },
  iconGrid: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  iconOption: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  // Color selector styles
  colorContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  colorCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  colorCircleSelected: { borderWidth: 3, borderColor: '#fff' },
  // Preview styles
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 20, gap: 12 },
  previewIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  previewContent: { flex: 1 },
  previewText: { fontSize: 15, fontWeight: '600' },
  previewSubtext: { fontSize: 12, marginTop: 2 },
  // Submit button styles
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
