import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Section Logo et Branding */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="wallet" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.appName}>E-PAOSY</Text>
          <Text style={styles.tagline}>Votre argent, partout, tout le temps.</Text>
        </View>

        {/* Section Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text style={styles.primaryButtonText}>Ouvrir un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.secondaryButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Sécurisé par HEI Technology</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'space-between', paddingVertical: 50 },
  logoSection: { alignItems: 'center', marginTop: 60 },
  logoCircle: {
    width: 140,
    height: 140,
    backgroundColor: '#F1F8E9',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }
    })
  },
  appName: { fontSize: 32, fontWeight: '800', color: '#1B5E20', letterSpacing: 3 },
  tagline: { fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center' },
  actionSection: { gap: 15, marginBottom: 20 },
  primaryButton: { backgroundColor: '#4CAF50', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#FFFFFF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#4CAF50' },
  secondaryButtonText: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
  footerText: { textAlign: 'center', color: '#AAA', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
});