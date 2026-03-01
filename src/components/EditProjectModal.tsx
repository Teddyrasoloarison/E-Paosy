import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, BackHandler, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useModernAlert } from '../hooks/useModernAlert';
import { useProjects } from '../hooks/useProjects';
import { useThemeStore } from '../store/useThemeStore';
import { Project } from '../types/project';
import { ProjectFormData, projectSchema } from '../utils/projectSchema';

interface Props {
  visible: boolean;
  onClose: () => void;
  project: Project;
}

const PRESET_COLORS = ['#0D9488', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#37474F', '#2563EB', '#059669'];

const PROJECT_ICONS = [
  { key: 'folder', icon: 'folder' },
  { key: 'construction', icon: 'construct' },
  { key: 'home', icon: 'home' },
  { key: 'car', icon: 'car' },
  { key: 'airplane', icon: 'airplane' },
  { key: 'gift', icon: 'gift' },
  { key: 'school', icon: 'school' },
  { key: 'heart', icon: 'heart' },
  { key: 'cart', icon: 'cart' },
  { key: 'briefcase', icon: 'briefcase' },
];

export default function EditProjectModal({ visible, onClose, project }: Props) {
  const { updateProject, isUpdating } = useProjects();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { success: showSuccess, error: showError } = useModernAlert();
  
  const [localColor, setLocalColor] = useState(project.color || PRESET_COLORS[0]);
  const [localIcon, setLocalIcon] = useState(project.iconRef || 'folder');
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    watch,  
    formState: { errors } 
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { 
      name: project.name || '', 
      description: project.description || '', 
      initialBudget: project.initialBudget || 0,
      color: project.color || PRESET_COLORS[0],
      iconRef: project.iconRef || 'folder',
    }
  });

  // Reset form when modal opens with new project
  useEffect(() => {
    if (visible && project) {
      setLocalColor(project.color || PRESET_COLORS[0]);
      setLocalIcon(project.iconRef || 'folder');
      reset({
        name: project.name || '',
        description: project.description || '',
        initialBudget: project.initialBudget || 0,
        color: project.color || PRESET_COLORS[0],
        iconRef: project.iconRef || 'folder',
      });
    }
  }, [visible, project, reset]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible && project) {
      reset({
        name: project.name || '',
        description: project.description || '',
        initialBudget: project.initialBudget || 0,
        color: project.color || PRESET_COLORS[0],
        iconRef: project.iconRef || 'folder',
      });
      setLocalColor(project.color || PRESET_COLORS[0]);
      setLocalIcon(project.iconRef || 'folder');
    }
  }, [visible, project, reset]);

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

  const projectName = watch('name');
  const isLoading = isUpdating;

  const onSubmit = (data: ProjectFormData) => {
    const dataWithIconAndColor = {
      ...data,
      initialBudget: data.initialBudget ?? undefined,
      color: localColor,
      iconRef: localIcon,
    };
    
    updateProject({ projectId: project.id, data: dataWithIconAndColor }, {
      onSuccess: () => {
        showSuccess("Succès", "Projet mis à jour avec succès !");
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
              <View style={[styles.titleIcon, { backgroundColor: (localColor || theme.primary) + '15' }]}>
                <Ionicons name="folder" size={24} color={localColor || theme.primary} />
              </View>
              <View style={styles.titleContent}>
                <Text style={[styles.title, { color: theme.text }]}>Modifier le Projet</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Mettez à jour les informations</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Project Name */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nom du projet</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="folder-outline" size={20} color={localColor || theme.primary} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Ex: Rénovation maison" 
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
                <View style={[styles.descriptionContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Ionicons name="document-text-outline" size={20} color={localColor || theme.primary} style={styles.descriptionIcon} />
                  <TextInput 
                    style={[styles.descriptionInput, { color: theme.text }]} 
                    placeholder="Petite note..."
                    placeholderTextColor={theme.textTertiary}
                    value={value} 
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              )}
            />

            {/* Initial Budget */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Budget initial (optionnel)</Text>
            <Controller
              control={control}
              name="initialBudget"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                  <Ionicons name="wallet-outline" size={20} color={localColor || theme.primary} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="0"
                    placeholderTextColor={theme.textTertiary}
                    value={value === undefined ? '' : value.toString()}
                    onChangeText={(text) => {
                      if (text === '') {
                        onChange(undefined);
                      } else {
                        const num = Number(text);
                        if (!isNaN(num)) {
                          onChange(num);
                        }
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>
              )}
            />

            {/* Color Grid */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Couleur</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map(color => (
                <TouchableOpacity 
                  key={color}
                  onPress={() => setLocalColor(color)}
                  style={[
                    styles.colorCircle, 
                    { backgroundColor: color },
                    localColor === color && styles.colorActive
                  ]}
                >
                  {localColor === color && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Icon Grid */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Icône</Text>
            <View style={styles.iconGrid}>
              {PROJECT_ICONS.map((item) => (
                <TouchableOpacity 
                  key={item.key}
                  onPress={() => setLocalIcon(item.icon)}
                  style={[
                    styles.iconCircle, 
                    { backgroundColor: theme.background },
                    localIcon === item.icon && { backgroundColor: localColor + '20', borderColor: localColor }
                  ]}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={localIcon === item.icon ? localColor : theme.textSecondary} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview Card */}
            <View style={[styles.previewCard, { backgroundColor: (localColor || theme.primary) + '10', borderColor: (localColor || theme.primary) + '30' }]}>
              <View style={[styles.previewIcon, { backgroundColor: localColor || theme.primary }]}>
                <Ionicons name={localIcon as any} size={24} color="#fff" />
              </View>
              <View style={styles.previewContent}>
                <Text style={[styles.previewName, { color: theme.text }]}>
                  {projectName || 'Nom du projet'}
                </Text>
                <Text style={[styles.previewHint, { color: theme.textTertiary }]}>
                  Aperçu
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: localColor || theme.primary }, isLoading && { opacity: 0.7 }]} 
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? 
                <ActivityIndicator color="#fff" /> : 
                <View style={styles.submitContent}>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.submitBtnText}>Enregistrer</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  titleIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  titleContent: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 2 },
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
  descriptionContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    minHeight: 80,
  },
  descriptionIcon: { marginTop: 2 },
  descriptionInput: { 
    flex: 1, 
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  errorText: { fontSize: 12, marginTop: 4, marginLeft: 4 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  colorActive: { borderWidth: 3, borderColor: '#fff' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 20, gap: 12 },
  previewIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  previewContent: { flex: 1 },
  previewName: { fontSize: 16, fontWeight: '600' },
  previewHint: { fontSize: 11, marginTop: 4 },
  submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
  submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
