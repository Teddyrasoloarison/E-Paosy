import React from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'; // Import important
import { Ionicons } from '@expo/vector-icons';
import { useWallets } from '../hooks/useWallets';
import { walletSchema, WalletFormData } from '../utils/walletSchema';
import { WalletType } from '../types/wallet';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const WALLET_TYPES: WalletType[] = ['CASH', 'MOBILE_MONEY', 'BANK', 'DEBT'];

export default function CreateWalletModal({ visible, onClose }: Props) {
  const { createWallet, isCreating } = useWallets();
  
  const { 
    control, 
    handleSubmit, 
    reset, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema), // Connexion Zod
    defaultValues: { name: '', description: '', type: 'CASH' }
  });

  const selectedType = watch('type');

  const onSubmit = (data: WalletFormData) => {
    createWallet(data, {
      onSuccess: () => {
        Alert.alert("Succès", "Portefeuille créé avec succès !");
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
            <Text style={styles.title}>Nouveau Wallet</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Nom du Wallet */}
          <Text style={styles.label}>Nom</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View>
                <TextInput 
                  style={[styles.input, errors.name && styles.inputError]} 
                  placeholder="Ex: Argent de poche" 
                  value={value} 
                  onChangeText={onChange} 
                />
                {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
              </View>
            )}
          />

          {/* Description */}
          <Text style={styles.label}>Description (optionnelle)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput 
                style={styles.input} 
                placeholder="Petite note..." 
                value={value} 
                onChangeText={onChange} 
              />
            )}
          />

          {/* Sélecteur de Type */}
          <Text style={styles.label}>Type de compte</Text>
          <View style={styles.typeContainer}>
            {WALLET_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, selectedType === type && styles.typeButtonSelected]}
                onPress={() => setValue('type', type)}
              >
                <Text style={[styles.typeText, selectedType === type && styles.typeTextSelected]}>
                  {type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}

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
  errorText: { color: '#E53935', fontSize: 12, marginBottom: 10, marginLeft: 5 },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  typeButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  typeButtonSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  typeText: { fontSize: 12, color: '#666' },
  typeTextSelected: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 30 },
  btnDisabled: { backgroundColor: '#A5D6A7' },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});