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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../src/services/authService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useAuthStore';
import { fingerprintAuthService } from '../../src/services/fingerprintAuthService';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Ionicons name="wallet" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.appName}>E-PAOSY</Text>
          <Text style={styles.subtitle}>Gérez vos finances intelligemment</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Créer un compte</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Nom d'utilisateur"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Mot de passe"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#8CA092"
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Confirmer le mot de passe"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#8CA092"
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Chargement..." : "Commencer"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Déjà un compte ? <Text style={styles.linkHighlight}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3FAF5' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 10, paddingVertical: 8, paddingRight: 8 },
  header: { alignItems: 'center', marginBottom: 34 },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#E8F5E9',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: { fontSize: 30, fontWeight: '700', color: '#1B5E20', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#5D7564', marginTop: 5 },
  form: {
    width: '100%',
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
  label: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D8E6DC',
    height: 55,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 16, marginRight: 8 },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...Platform.select({
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 6px rgba(0,0,0,0.1)' }
    })
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  linkButton: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#607566', fontSize: 14 },
  linkHighlight: { color: '#2E7D32', fontWeight: '700' },
});
