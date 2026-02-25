import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { authSchema, AuthFormData } from '../../src/utils/authSchema';
import { authService } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { fingerprintAuthService } from '../../src/services/fingerprintAuthService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../constants/colors';

export default function SignInScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isFingerprintLoading, setIsFingerprintLoading] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { username: '', password: '' }
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      const response = await authService.signIn(data);
      await setAuth(response.token, response.account.id, response.account.username);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erreur de connexion",
        error.response?.data?.message || "Identifiants incorrects ou problème serveur"
      );
    }
  };

  const handleFingerprintSignIn = async () => {
    setIsFingerprintLoading(true);
    try {
      const result = await fingerprintAuthService.signInWithFingerprint();
      if (result.success && result.credentials) {
        const response = await authService.signIn(result.credentials);
        await setAuth(response.token, response.account.id, response.account.username);
        router.replace('/(tabs)/dashboard');
      } else {
        Alert.alert(
          "Connexion empreinte",
          result.error || "Impossible de se connecter avec l'empreinte."
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.message || "Une erreur est survenue lors de la connexion par empreinte."
      );
    } finally {
      setIsFingerprintLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </Pressable>

        <View style={styles.header}>
          <View style={[styles.logoBadge, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="person-outline" size={34} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Connexion</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Accédez à votre compte E-PAOSY</Text>
        </View>

        <View style={[styles.form, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <View style={[
                styles.inputGroup, 
                { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                errors.username && styles.inputError
              ]}>
                <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Nom d'utilisateur"
                  placeholderTextColor={theme.textTertiary}
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
              <View style={[
                styles.inputGroup, 
                { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                errors.password && styles.inputError
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Mot de passe"
                  placeholderTextColor={theme.textTertiary}
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Chargement..." : "Se connecter"}
            </Text>
            {!isSubmitting && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fingerprintButton, { borderColor: theme.border }]}
            onPress={handleFingerprintSignIn}
            disabled={isFingerprintLoading}
          >
            <Ionicons name="finger-print" size={22} color={theme.primary} />
            <Text style={[styles.fingerprintButtonText, { color: theme.primary }]}>
              {isFingerprintLoading ? 'Connexion...' : 'Connexion via empreinte'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.linkButton}>
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>
              Pas encore de compte ? <Text style={[styles.linkHighlight, { color: theme.primary }]}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 20 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' },
    }),
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    marginTop: 12,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  fingerprintButton: {
    marginTop: 16,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  fingerprintButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14 },
  linkHighlight: { fontWeight: '700' },
});
