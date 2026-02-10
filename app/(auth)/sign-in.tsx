import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Pressable } from 'react-native';
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
      
      // On enregistre le token et l'ID du compte dans Zustand
      await setAuth(response.token, response.account.id);
      
      // REDIRECTION : On va spécifiquement vers la page dashboard dans le dossier tabs
      router.replace('/(tabs)/dashboard'); 
      
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erreur de connexion", 
        error.response?.data?.message || "Identifiants incorrects ou problème serveur"
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Bouton Retour vers la Landing Page */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>

      <Text style={styles.title}>Connexion</Text>

      {/* Champ Username */}
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <View style={[styles.inputGroup, errors.username && styles.inputError]}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput 
              style={styles.input} 
              placeholder="Nom d'utilisateur" 
              value={value} 
              onChangeText={onChange} 
              autoCapitalize="none"
            />
          </View>
        )}
      />
      {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}

      {/* Champ Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={[styles.inputGroup, errors.password && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput 
              style={styles.input} 
              placeholder="Mot de passe" 
              secureTextEntry 
              value={value} 
              onChangeText={onChange} 
            />
          </View>
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      {/* Bouton de validation */}
      <TouchableOpacity 
        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Chargement..." : "Se connecter"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 30, 
    backgroundColor: '#F8F9FA' 
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 40, 
    textAlign: 'center',
    color: '#1B5E20'
  },
  inputGroup: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    height: 55, 
    marginBottom: 5 
  },
  input: { 
    flex: 1, 
    marginLeft: 10,
    fontSize: 16
  },
  inputError: { 
    borderColor: '#E53935' 
  },
  errorText: { 
    color: '#E53935', 
    fontSize: 12, 
    marginBottom: 15, 
    marginLeft: 5 
  },
  button: { 
    backgroundColor: '#4CAF50', 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20,
    // Ombre pour Android/iOS
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  }
});