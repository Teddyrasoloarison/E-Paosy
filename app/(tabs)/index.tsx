import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AnimatedLogo from '../../components/AnimatedLogo';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Colors } from '../../constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animations for content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleButtonPress = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View 
        style={[
          styles.content, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Animated Logo Section */}
        <View style={styles.logoSection}>
          <AnimatedLogo showText={true} size="large" />
        </View>

        {/* Feature Card */}
        <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.featureText, { color: theme.text }]}>Connexion sécurisée</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="flash-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.featureText, { color: theme.text }]}>Accès rapide au dashboard</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="phone-portrait-outline" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.featureText, { color: theme.text }]}>Expérience mobile fluide</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                handleButtonPress(buttonScaleAnim);
                router.push("/(auth)/sign-up");
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Ouvrir un compte</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
              onPress={() => {
                handleButtonPress(buttonScaleAnim);
                router.push("/(auth)/sign-in");
              }}
              activeOpacity={0.9}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>Se connecter</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={[styles.footerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>Sécurisé par HEI Technology</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    justifyContent: 'space-between', 
    paddingVertical: 28,
  },
  logoSection: { 
    alignItems: 'center', 
    marginTop: 40,
  },
  featureCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    gap: 14,
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
  featureRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { 
    fontSize: 15, 
    fontWeight: '500',
  },
  actionSection: { 
    gap: 14, 
    marginBottom: 14,
  },
  primaryButton: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0D9488',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0px 4px 12px rgba(13, 148, 136, 0.3)' },
    }),
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '700',
  },
  secondaryButton: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    borderWidth: 2,
  },
  secondaryButtonText: { 
    fontSize: 18, 
    fontWeight: '700',
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
    marginBottom: 14,
  },
  footerText: { 
    textAlign: 'center', 
    fontSize: 12, 
    textTransform: 'uppercase', 
    letterSpacing: 1,
  },
});
