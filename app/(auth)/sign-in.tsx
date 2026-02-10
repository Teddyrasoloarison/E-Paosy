import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { authSchema, AuthFormData } from '../../src/utils/authSchema';
import { authService } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { username: '', password: '' }
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      const response = await authService.signIn(data);
      // On enregistre dans le store global
      await setAuth(response.token, response.account.id);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.message || "Connexion échouée");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <View style={[styles.inputGroup, errors.username && styles.inputError]}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput 
              style={styles.input} 
              placeholder="Username" 
              value={value} 
              onChangeText={onChange} 
              autoCapitalize="none"
            />
          </View>
        )}
      />
      {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={[styles.inputGroup, errors.password && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              secureTextEntry 
              value={value} 
              onChangeText={onChange} 
            />
          </View>
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? "Chargement..." : "Se connecter"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  inputGroup: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 5 
  },
  input: { flex: 1, marginLeft: 10 },
  inputError: { borderColor: '#E53935' },
  errorText: { color: '#E53935', fontSize: 12, marginBottom: 15, marginLeft: 5 },
  button: { backgroundColor: '#4CAF50', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});