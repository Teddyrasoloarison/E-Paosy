import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../src/services/authService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { fingerprintAuthService } from '../../src/services/fingerprintAuthService';
import { labelService } from '@/src/services/labelService';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../constants/colors';

const logoEpaosy = require('../../assets/images/logo-e-paosy.png');

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleSignup = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Mot de passe invalide", "Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.signUp({ username, password });
      const response = await authService.signIn({ username, password });
      await setAuth(response.token, response.account.id, response.account.username);

      // creer automatiquement quelques labels par defaut en arriere-plan
      (async (acctId: string) => {
        const LABEL_NAMES = ['frais', 'loyer', 'nouriture', 'écolage', 'électricité'];
        const COLORS = ['#0D9488', '#0EA5E9', '#EF4444', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#22C55E', '#A855F7',
    '#d3a662', '#795548', '#000000', '#e41549'];
        try {
          await Promise.all(
            LABEL_NAMES.map((name) => {
              const color = COLORS[Math.floor(Math.random() * COLORS.length)];
              return labelService.createLabel(acctId, { name, color });
            })
          );
        } catch (err) {
          // pas bloquant, juste log pour debug
          console.warn('Échec création labels par défaut', err);
        }
      })(response.account.id);

      // Demander si l'utilisateur souhaite associer son empreinte
      Alert.alert(
        "Compte créé !",
        "Souhaitez-vous associer votre empreinte digitale à ce compte pour une connexion plus rapide ?",
        [
          {
            text: "Non, merci",
            style: "cancel",
            onPress: () => router.replace('/(tabs)/dashboard'),
          },
          {
            text: "Oui",
            onPress: async () => {
              const result = await fingerprintAuthService.enrollFingerprint({
                username,
                password,
              });
              if (result.success) {
                Alert.alert(
                  "Empreinte associée",
                  "Votre empreinte a été associée à votre compte. Vous pourrez vous connecter en un instant !",
                  [{ text: "C'est parti !", onPress: () => router.replace('/(tabs)/dashboard') }]
                );
              } else {
                Alert.alert(
                  "Empreinte non associée",
                  result.error || "Impossible d'associer l'empreinte. Vous pouvez vous connecter avec votre nom et mot de passe.",
                  [{ text: "OK", onPress: () => router.replace('/(tabs)/dashboard') }]
                );
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Erreur d'inscription",
        error.response?.data?.message || "Une erreur est survenue lors de la création du compte."
      );
    } finally {
      setIsLoading(false);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary + '15' }]}>
            <Image source={logoEpaosy} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={[styles.appName, { color: theme.primary }]}>E-PAOSY</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Gérez vos finances intelligemment</Text>
        </View>

        <View style={[styles.form, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Créer un compte</Text>

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={20} color={theme.textSecondary} style={styles.icon} />
            <TextInput
              placeholder="Nom d'utilisateur"
              style={[styles.input, { color: theme.text }]}
              placeholderTextColor={theme.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.icon} />
            <TextInput
              placeholder="Mot de passe"
              style={[styles.input, { color: theme.text }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.textTertiary}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.textSecondary} style={styles.icon} />
            <TextInput
              placeholder="Confirmer le mot de passe"
              style={[styles.input, { color: theme.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={theme.textTertiary}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }, isLoading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Chargement..." : "Commencer"}
            </Text>
            {!isLoading && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.linkButton}
          >
            <Text style={[styles.linkText, { color: theme.textSecondary }]}>
              Déjà un compte ? <Text style={[styles.linkHighlight, { color: theme.primary }]}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', marginBottom: 16, paddingVertical: 8, paddingRight: 8 },
  header: { alignItems: 'center', marginBottom: 34 },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoImage: { width: '80%', height: '80%', borderRadius: 25 },
  appName: { fontSize: 32, fontWeight: '700', letterSpacing: 2 },
  subtitle: { fontSize: 15, marginTop: 8 },
  form: {
    width: '100%',
    borderRadius: 20,
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
  label: { fontSize: 22, fontWeight: '600', marginBottom: 24 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    height: 56,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, marginRight: 8 },
  button: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  linkButton: { marginTop: 28, alignItems: 'center' },
  linkText: { fontSize: 14 },
  linkHighlight: { fontWeight: '700' },
});
