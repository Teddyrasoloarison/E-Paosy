import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const logoEpaosy = require('../../assets/images/logo-e-paosy.png');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Image source={logoEpaosy} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>E-PAOSY</Text>
          <Text style={styles.tagline}>Votre argent, partout, tout le temps.</Text>
          <Text style={styles.description}>
            Une application simple et elegante pour suivre vos operations,
            garder le controle de votre compte et agir en toute securite.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#1B5E20" />
            <Text style={styles.featureText}>Connexion securisee</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="flash-outline" size={20} color="#1B5E20" />
            <Text style={styles.featureText}>Acces rapide au dashboard</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="phone-portrait-outline" size={20} color="#1B5E20" />
            <Text style={styles.featureText}>Experience mobile fluide</Text>
          </View>
        </View>

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

        <Text style={styles.footerText}>Sécurisé par HEI Technology</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FBF5' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingVertical: 28 },
  logoSection: { alignItems: 'center', marginTop: 20 },
  logoCircle: {
    width: 140,
    height: 140,
    overflow: 'hidden',
    padding: 8,
    backgroundColor: '#F1F8E9',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
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
  logoImage: { width: '95%', height: '95%', borderRadius: 100 },
  appName: { fontSize: 34, fontWeight: '800', color: '#1B5E20', letterSpacing: 2.5 },
  tagline: { fontSize: 16, color: '#2E7D32', marginTop: 8, textAlign: 'center', fontWeight: '600' },
  description: {
    marginTop: 14,
    textAlign: 'center',
    color: '#51705A',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 320,
  },
  featureCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E3EFE5',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.06)' },
    }),
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, color: '#365A41', fontWeight: '500' },
  actionSection: { gap: 14, marginBottom: 14 },
  primaryButton: { backgroundColor: '#4CAF50', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#FFFFFF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#4CAF50' },
  secondaryButtonText: { color: '#4CAF50', fontSize: 18, fontWeight: '700' },
  footerText: { textAlign: 'center', color: '#AAA', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
});