import React from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useWallets } from '../hooks/useWallets';
import { automaticIncomeSchema, AutomaticIncomeFormData } from '../utils/walletSchema';
import { Wallet, UpdateAutomaticIncomeDto } from '../types/wallet';
import { Colors } from '../../constants/colors';
import { useThemeStore } from '../store/useThemeStore';

interface Props {
    visible: boolean;
    onClose: () => void;
    wallet: Wallet;
}

const WALLET_TYPES: { type: string; icon: string; label: string }[] = [
  { type: 'CASH', icon: 'cash', label: 'Especes' },
  { type: 'MOBILE_MONEY', icon: 'phone-portrait', label: 'Mobile Money' },
  { type: 'BANK', icon: 'business', label: 'Banque' },
  { type: 'DEBT', icon: 'person-remove', label: 'Dette' },
];

export default function EditAutomaticIncomeModal({ visible, onClose, wallet }: Props) {
    const { updateIncome, isUpdatingIncome } = useWallets();
    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    const theme = isDarkMode ? Colors.dark : Colors.light;

    const { control, handleSubmit, formState: { errors } } = useForm<AutomaticIncomeFormData>({
        resolver: zodResolver(automaticIncomeSchema) as any,
        defaultValues: {
            type: wallet.walletAutomaticIncome?.type || 'NOT_SPECIFIED',
            amount: wallet.walletAutomaticIncome?.amount || 0,
            paymentDay: wallet.walletAutomaticIncome?.paymentDay || 1,
        }
    });

    const onSubmit = (data: AutomaticIncomeFormData) => {
        const payload: UpdateAutomaticIncomeDto = {
            amount: Number(data.amount),
            paymentDay: Number(data.paymentDay),
            type: data.type,
            haveAutomaticIncome: Number(data.amount) > 0
        };

        updateIncome(
            {
                walletId: wallet.id,
                data: payload
            },
            {
                onSuccess: () => {
                    Alert.alert("Succes", "Portefeuille mis a jour avec succes !");
                    onClose();
                },
                onError: (error: any) => {
                    Alert.alert("Erreur", error.response?.data?.message || "Erreur de mise a jour");
                }
            }
        );
    };

    // Get the icon for the wallet type
    const walletTypeIcon = WALLET_TYPES.find(t => t.type === wallet.type)?.icon || 'wallet';

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.content, { backgroundColor: theme.surface }]}>
                    <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
                    
                    <View style={styles.header}>
                        <View style={[styles.titleIcon, { backgroundColor: theme.primary + '15' }]}>
                            <Ionicons name={walletTypeIcon as any} size={24} color={theme.primary} />
                        </View>
                        <View style={styles.titleContent}>
                            <Text style={[styles.title, { color: theme.text }]}>Modifier Portefeuille</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{wallet.name}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    {/* Wallet Info Preview */}
                    <View style={[styles.previewCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                        <View style={[styles.previewIcon, { backgroundColor: theme.primary }]}>
                            <Ionicons name={walletTypeIcon as any} size={24} color="#fff" />
                        </View>
                        <View style={styles.previewContent}>
                            <Text style={[styles.previewName, { color: theme.text }]}>
                                {wallet.name}
                            </Text>
                            <Text style={[styles.previewType, { color: theme.textSecondary }]}>
                                {wallet.type?.replace('_', ' ')}
                            </Text>
                            <Text style={[styles.previewHint, { color: theme.textTertiary }]}>
                                Solde: {(wallet.amount ?? 0).toLocaleString()} Ar
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    {wallet.description && (
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
                    )}
                    {wallet.description && (
                        <View style={[styles.infoBox, { backgroundColor: theme.background }]}>
                            <Text style={{ color: theme.text }}>{wallet.description}</Text>
                        </View>
                    )}

                    {/* Income Type Selector */}
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Revenu automatique</Text>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.typeContainer}>
                                {(['NOT_SPECIFIED', 'MENSUAL'] as const).map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[
                                            styles.typeButton, 
                                            { backgroundColor: theme.background },
                                            value === t && { backgroundColor: theme.primary }
                                        ]}
                                        onPress={() => onChange(t)}
                                    >
                                        <Ionicons 
                                            name={t === 'MENSUAL' ? 'calendar' : 'remove-circle-outline'} 
                                            size={18} 
                                            color={value === t ? '#fff' : theme.textSecondary} 
                                        />
                                        <Text style={[
                                            styles.typeText, 
                                            { color: value === t ? '#fff' : theme.textSecondary }
                                        ]}>
                                            {t === 'MENSUAL' ? 'Mensuel' : 'Non specifie'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    />

                    {/* Amount */}
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Montant du revenu (Ar)</Text>
                    <Controller
                        control={control}
                        name="amount"
                        render={({ field: { onChange, value } }) => (
                            <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                                <Ionicons name="cash-outline" size={20} color={theme.primary} />
                                <TextInput 
                                    style={[styles.input, { color: theme.text }]} 
                                    placeholder="Ex: 5000"
                                    placeholderTextColor={theme.textTertiary}
                                    keyboardType="numeric"
                                    value={value?.toString() || ''}
                                    onChangeText={onChange}
                                />
                            </View>
                        )}
                    />
                    {errors.amount && <Text style={[styles.errorText, { color: theme.error }]}>{errors.amount.message}</Text>}

                    {/* Payment Day */}
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Jour du prelevement (1-31)</Text>
                    <Controller
                        control={control}
                        name="paymentDay"
                        render={({ field: { onChange, value } }) => (
                            <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                                <Ionicons name="calendar-number" size={20} color={theme.primary} />
                                <TextInput 
                                    style={[styles.input, { color: theme.text }]} 
                                    placeholder="Ex: 1"
                                    placeholderTextColor={theme.textTertiary}
                                    keyboardType="numeric"
                                    value={value?.toString() || ''}
                                    onChangeText={onChange}
                                />
                            </View>
                        )}
                    />
                    {errors.paymentDay && <Text style={[styles.errorText, { color: theme.error }]}>{errors.paymentDay.message}</Text>}

                    {/* Submit Button */}
                    <TouchableOpacity 
                        style={[styles.submitBtn, { backgroundColor: theme.primary }, isUpdatingIncome && { opacity: 0.7 }]} 
                        onPress={handleSubmit(onSubmit)}
                        disabled={isUpdatingIncome}
                    >
                        {isUpdatingIncome ? 
                            <ActivityIndicator color="#fff" /> : 
                            <View style={styles.submitContent}>
                                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                <Text style={styles.submitBtnText}>Confirmer</Text>
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
    errorText: { fontSize: 12, marginTop: 4, marginLeft: 4 },
    typeContainer: { flexDirection: 'row', gap: 10, marginTop: 4 },
    typeButton: { 
        flex: 1,
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: 14, 
        paddingVertical: 12, 
        borderRadius: 12,
        gap: 8,
        justifyContent: 'center',
    },
    typeText: { fontSize: 13, fontWeight: '600' },
    infoBox: { 
        padding: 14, 
        borderRadius: 12, 
        marginTop: 4,
        marginBottom: 8,
    },
    previewCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 8, gap: 12 },
    previewIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    previewContent: { flex: 1 },
    previewName: { fontSize: 16, fontWeight: '600' },
    previewType: { fontSize: 13, marginTop: 2 },
    previewHint: { fontSize: 11, marginTop: 4 },
    submitBtn: { padding: 18, borderRadius: 14, marginTop: 24, alignItems: 'center' },
    submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
