import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { authSchema, AuthFormData } from '../../src/utils/authSchema';
import { authService } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { googleAuthService } from '../../src/services/googleAuthService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { username: '', password: '' }
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      const response = await authService.signIn(data);
      
      // On enregistre le token et l'ID du compte dans Zustand
      await setAuth(response.token, response.account.id, response.account.username);
      
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

  const handleGoogleSignIn = async () => {
    if (!googleRequest) {
      Alert.alert('Google indisponible', 'Configuration Google manquante.');
      return;
    }

    setIsGoogleLoading(true);
    await googlePromptAsync();
  };

  useEffect(() => {
    const run = async () => {
      if (googleResponse?.type !== 'success') {
        if (googleResponse?.type === 'cancel') {
          setIsGoogleLoading(false);
        }
        return;
      }

      try {
        const accessToken = googleResponse.authentication?.accessToken;
        if (!accessToken) {
          throw new Error("Connexion Google impossible.");
        }

        const profile = await googleAuthService.getProfile(accessToken);
        const credentials = googleAuthService.toCredentials(profile);

        try {
          const response = await authService.signIn(credentials);
          await setAuth(response.token, response.account.id, response.account.username);
          router.replace('/(tabs)/dashboard');
        } catch (_error: any) {
          Alert.alert(
            'Compte introuvable',
            "Ce compte Google n'existe pas encore ici. Veuillez creer un compte avec Google d'abord."
          );
        }
      } catch (error: any) {
        Alert.alert('Erreur Google', error.message || 'Echec de la connexion Google.');
      } finally {
        setIsGoogleLoading(false);
      }
    };

    run();
  }, [googleResponse, router, setAuth]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="log-in-outline" size={34} color="#2E7D32" />
          </View>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Accedez a votre compte E-PAOSY</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.inputGroup, errors.username && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#5D7564" />
                <TextInput
                  style={styles.input}
                  placeholder="Nom d'utilisateur"
                  placeholderTextColor="#8CA092"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  editable={!isSubmitting}
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
                <Ionicons name="lock-closed-outline" size={20} color="#5D7564" />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#8CA092"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#5D7564"
                  />
                </Pressable>
              </View>
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Chargement..." : "Se connecter"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleButton, isGoogleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <Ionicons name="logo-google" size={18} color="#1B5E20" />
            <Text style={styles.googleButtonText}>
              {isGoogleLoading ? 'Connexion...' : 'Continuer avec Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.linkButton}>
            <Text style={styles.linkText}>
              Pas encore de compte ? <Text style={styles.linkHighlight}>Creer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAF5',
  },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 20 },
  backButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingRight: 10,
  },
  header: { alignItems: 'center', marginTop: 12, marginBottom: 30 },
  logoBadge: {
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: '#E6F4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1B5E20',
  },
  subtitle: {
    marginTop: 8,
    color: '#5D7564',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2ECE4',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.06)' },
    }),
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D8E6DC',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 55,
    marginTop: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E53935',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
    fontWeight: '700',
  },
  googleButton: {
    marginTop: 10,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CFE1D3',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  googleButtonText: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: { marginTop: 18, alignItems: 'center' },
  linkText: { color: '#607566', fontSize: 14 },
  linkHighlight: { color: '#2E7D32', fontWeight: '700' },
});