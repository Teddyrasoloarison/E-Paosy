import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useLabels } from '../hooks/useLabels';
import { labelSchema, LabelFormData } from '../utils/labelSchema';
import { LabelItem, LabelPayload } from '../types/label';

interface Props {
    visible: boolean;
    onClose: () => void;
    label: LabelItem; // Le label sélectionné pour l'édition
}

// Palette suggérée pour les labels (Assure-toi qu'elle correspond à CreateLabelModal)
const COLORS = ['#4CAF50', '#457cac', '#ff0000', '#ff8c00', '#8E24AA',
    '#F44336', '#07353b', '#2196F3', '#9C27B0',
    '#d3a662', '#795548', '#000000', '#e41549'];

export default function EditLabelModal({ visible, onClose, label }: Props) {
    const { updateLabel, isUpdating } = useLabels();

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<LabelFormData>({
        resolver: zodResolver(labelSchema),
        defaultValues: {
            name: label.name,
            color: label.color,
        }
    });

    // 🔴 Synchronisation du formulaire quand la modale s'ouvre ou que le label change
    useEffect(() => {
        if (visible) {
            reset({
                name: label.name,
                color: label.color,
            });
        }
    }, [label, visible, reset]);

    const selectedColor = watch('color');

    const onSubmit = (data: LabelFormData) => {
        const payload: LabelPayload = {
            name: data.name,
            color: data.color
        };

        updateLabel(
            {
                labelId: label.id,
                data: payload
            },
            {
                onSuccess: () => {
                    Alert.alert("Succès", "Label mis à jour avec succès");
                    onClose();
                },
                onError: (error: any) => {
                    Alert.alert("Erreur", error.response?.data?.message || "Erreur de mise à jour");
                }
            }
        );
    };

    return (
        <Modal 
            visible={visible} 
            animationType="slide" 
            transparent={true} 
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Modifier le Label</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Nom du Label */}
                    <Text style={styles.label}>Nom du label</Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder="Ex: Alimentation"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

                    {/* Sélecteur de Couleur */}
                    <Text style={styles.label}>Couleur associée</Text>
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
                                activeOpacity={0.7}
                            >
                                {selectedColor === c && (
                                    <Ionicons name="checkmark" size={22} color="#fff" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, isUpdating && styles.btnDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Enregistrer les modifications</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'flex-end' 
    },
    content: { 
        backgroundColor: '#fff', 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        padding: 25, 
        paddingBottom: 40 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    title: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#1B5E20' 
    },
    label: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#444', 
        marginBottom: 8, 
        marginTop: 15 
    },
    input: { 
        backgroundColor: '#F5F5F5', 
        borderRadius: 12, 
        padding: 15, 
        fontSize: 16 
    },
    inputError: { 
        borderWidth: 1, 
        borderColor: '#D32F2F' 
    },
    errorText: { 
        color: '#D32F2F', 
        fontSize: 12, 
        marginTop: 4 
    },
    colorGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 12, 
        marginTop: 10 
    },
    colorOption: { 
        width: 42, 
        height: 42, 
        borderRadius: 21, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    colorSelected: { 
        borderWidth: 3, 
        borderColor: '#333' 
    },
    submitBtn: { 
        backgroundColor: '#2E7D32', 
        borderRadius: 15, 
        padding: 18, 
        alignItems: 'center', 
        marginTop: 35,
        elevation: 3
    },
    btnDisabled: { 
        backgroundColor: '#A5D6A7' 
    },
    submitBtnText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: 'bold' 
    }
});