import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, BackHandler, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { useLabels } from '../hooks/useLabels';
import { useModernAlert } from '../hooks/useModernAlert';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LabelItem, LabelPayload } from '../types/label';
import { LabelFormData, labelSchema } from '../utils/labelSchema';

interface Props {
    visible: boolean;
    onClose: () => void;
    label: LabelItem;
}

const COLORS = ['#0D9488', '#1565C0', '#C62828', '#F9A825', '#6A1B9A', '#37474F', '#2563EB', '#059669', '#DC2626', '#7C3AED', '#0891B2', '#4F46E5'];

export default function EditLabelModal({ visible, onClose, label }: Props) {
    const { updateLabel, isUpdating } = useLabels();
    const accountId = useAuthStore((state) => state.accountId);
    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    const theme = isDarkMode ? Colors.dark : Colors.light;
    
    // State to track the initial color from the label prop
    const [initialColor, setInitialColor] = useState(label.color);

    // Update initial color when label changes
    useEffect(() => {
        setInitialColor(label.color);
    }, [label.id, label.color]);

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<LabelFormData>({
        resolver: zodResolver(labelSchema),
        defaultValues: {
            name: label.name,
            color: label.color,
        }
    });

    useEffect(() => {
        if (visible) {
            // Reset form with the label's current color when modal opens
            setInitialColor(label.color);
            reset({
                name: label.name,
                color: label.color,
            });
        }
    }, [visible, label.id, label.name, label.color, reset]);

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

    // alert helpers must be obtained at top level of component
    const { success: showSuccess, error: showError } = useModernAlert();

    const onSubmit = (data: LabelFormData) => {
        const payload: LabelPayload = {
            name: data.name,
            color: data.color,
            accountId: accountId!
        };

        updateLabel(
            {
                labelId: label.id,
                data: payload
            },
            {
                onSuccess: () => {
                    showSuccess("Succès", "Label mis à jour");
                    onClose();
                },
                onError: (error: any) => {
                    showError("Erreur", error.response?.data?.message || "Erreur de mise à jour");
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
                        <View style={[styles.titleIcon, { backgroundColor: selectedColor + '15' }]}>
                            <Ionicons name="pricetag" size={24} color={selectedColor} />
                        </View>
                        <View style={styles.titleContent}>
                            <Text style={[styles.title, { color: theme.text }]}>Modifier le Label</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Mettez a jour les details</Text>
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
                                    placeholder="Ex: Alimentation"
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
                    <View style={styles.colorGrid}>
                        {COLORS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={[
                                    styles.colorOption, 
                                    { backgroundColor: c },
                                    selectedColor === c && styles.colorSelected
                                ]}
                                onPress={() => setValue('color', c)}
                            >
                                {selectedColor === c && (
                                    <Ionicons name="checkmark" size={18} color="#fff" />
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
                        style={[styles.submitBtn, { backgroundColor: selectedColor }, isUpdating && { opacity: 0.7 }]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.submitContent}>
                                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                <Text style={styles.submitBtnText}>Enregistrer</Text>
                            </View>
                        )}
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
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
    colorOption: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    colorSelected: { borderWidth: 3, borderColor: '#fff' },
    previewCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 20, gap: 12 },
    previewIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    previewContent: { flex: 1 },
    previewText: { fontSize: 15, fontWeight: '600' },
    previewSubtext: { fontSize: 12, marginTop: 2 },
    submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
    submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
