import React from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useWallets } from '../hooks/useWallets';
import { automaticIncomeSchema, AutomaticIncomeFormData } from '../utils/walletSchema';
import { Wallet, UpdateAutomaticIncomeDto } from '../types/wallet';

interface Props {
    visible: boolean;
    onClose: () => void;
    wallet: Wallet;
}

export default function EditAutomaticIncomeModal({ visible, onClose, wallet }: Props) {
    const { updateIncome, isUpdatingIncome } = useWallets();

    const { control, handleSubmit, formState: { errors } } = useForm<AutomaticIncomeFormData>({
        resolver: zodResolver(automaticIncomeSchema) as any,
        defaultValues: {
            // Initialisation basée sur tes interfaces
            type: wallet.walletAutomaticIncome?.type || 'NOT_SPECIFIED',
            amount: wallet.walletAutomaticIncome?.amount || 0,
            paymentDay: wallet.walletAutomaticIncome?.paymentDay || 1,
        }
    });

    const onSubmit = (data: AutomaticIncomeFormData) => {
        // On prépare l'objet exactement comme l'interface UpdateAutomaticIncomeDto
        const payload: UpdateAutomaticIncomeDto = {
            amount: Number(data.amount),
            paymentDay: Number(data.paymentDay),
            type: data.type,
            haveAutomaticIncome: Number(data.amount) > 0
        };

        // 🔴 LOG À VÉRIFIER DANS TON TERMINAL/DEBUGGER
        console.log("PAYLOAD ENVOYÉ AU HOOK:", JSON.stringify(payload, null, 2));

        updateIncome(
            {
                walletId: wallet.id,
                data: payload // Vérifie si ton hook useWallets n'attend pas { walletAutomaticIncome: payload }
            },
            {
                onSuccess: (updatedWallet) => {
                    // 🔴 LOG DU RETOUR SERVEUR
                    console.log("RÉPONSE SERVEUR:", updatedWallet);

                    Alert.alert(
                        "Succès",
                        `Config : ${payload.amount} Ar / Jour ${payload.paymentDay}`
                    );
                    onClose();
                },
                onError: (error: any) => {
                    console.error("ERREUR API:", error.response?.data);
                    Alert.alert("Erreur", error.response?.data?.message || "Erreur de synchro");
                }
            }
        );
    };
    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Revenu Automatique</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description}>
                        Définissez un montant mensuel. Le système l'ajoutera à votre solde au jour indiqué.
                    </Text>

                    {/* Sélecteur de Type */}
                    <Text style={styles.label}>Fréquence</Text>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.typeSelector}>
                                {(['NOT_SPECIFIED', 'MENSUAL'] as const).map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeOption, value === t && styles.typeOptionSelected]}
                                        onPress={() => onChange(t)}
                                    >
                                        <Text style={[styles.typeOptionText, value === t && styles.typeOptionTextSelected]}>
                                            {t === 'MENSUAL' ? 'Mensuel' : 'Non spécifié'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    />

                    {/* Montant */}
                    <Text style={styles.label}>Montant du revenu (Ar)</Text>
                    <Controller
                        control={control}
                        name="amount"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.amount && styles.inputError]}
                                placeholder="Ex: 5000"
                                keyboardType="numeric"
                                value={value.toString()}
                                onChangeText={onChange}
                            />
                        )}
                    />
                    {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

                    {/* Jour de paiement */}
                    <Text style={styles.label}>Jour du prélèvement (1-31)</Text>
                    <Controller
                        control={control}
                        name="paymentDay"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.paymentDay && styles.inputError]}
                                placeholder="Ex: 1"
                                keyboardType="numeric"
                                value={value.toString()}
                                onChangeText={onChange}
                            />
                        )}
                    />
                    {errors.paymentDay && <Text style={styles.errorText}>{errors.paymentDay.message}</Text>}

                    <TouchableOpacity
                        style={[styles.submitBtn, isUpdatingIncome && styles.btnDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isUpdatingIncome}
                    >
                        {isUpdatingIncome ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Confirmer et Activer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    content: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20' },
    description: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 15, fontSize: 16, borderColor: '#EEE' },
    inputError: { borderWidth: 1, borderColor: '#D32F2F' },
    errorText: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
    typeSelector: { flexDirection: 'row', gap: 10 },
    typeOption: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
    typeOptionSelected: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
    typeOptionText: { color: '#666', fontWeight: '500' },
    typeOptionTextSelected: { color: '#2E7D32', fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#2E7D32', borderRadius: 15, padding: 18, alignItems: 'center', marginTop: 30, elevation: 3 },
    btnDisabled: { backgroundColor: '#A5D6A7' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});