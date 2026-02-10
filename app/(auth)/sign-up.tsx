import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, 
  Platform, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../src/services/authService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Pour éviter les doubles clics
  const router = useRouter();

  const handleSignup = async () => {
    // 1. Validation simple
    if (!username.trim() || !password.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.signUp({ username, password });
      
      // 2. Alerte de succès avec redirection au clic sur OK
      Alert.alert(
        "Compte créé !",
        `Bienvenue sur E-PAOSY ${username}. Votre compte a été configuré avec succès.`,
        [
          { 
            text: "C'est parti !", 
            onPress: () => router.replace('/(tabs)') 
          }
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
        {/* LOGO & HEADER */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Ionicons name="wallet" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.appName}>E-PAOSY</Text>
          <Text style={styles.subtitle}>Gérez vos finances intelligemment</Text>
        </View>

        {/* FORMULAIRE */}
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
              secureTextEntry
              editable={!isLoading}
            />
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logoPlaceholder: {
    width: 100, height: 100, backgroundColor: '#E8F5E9',
    borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#1B5E20', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  form: { width: '100%' },
  label: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, paddingHorizontal: 15, marginBottom: 15,
    borderWidth: 1, borderColor: '#E0E0E0', height: 55,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 16 },
  button: {
    backgroundColor: '#4CAF50', borderRadius: 12, height: 55,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    ...Platform.select({
        android: { elevation: 3 },
        web: { boxShadow: '0px 4px 6px rgba(0,0,0,0.1)' }
    })
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#666', fontSize: 14 },
  linkHighlight: { color: '#4CAF50', fontWeight: 'bold' },
});