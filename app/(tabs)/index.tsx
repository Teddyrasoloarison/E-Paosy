import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, BackHandler, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedLogo from '../../components/AnimatedLogo';
import { Colors } from '../../constants/colors';
import { useModernAlert } from '../../src/hooks/useModernAlert';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const { show } = useModernAlert();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        show({
          title: 'Quitter l\'application',
          message: 'Est-ce que tu veux vraiment quitter ?',
          type: 'confirm',
          buttons: [
            {
              text: 'Annuler',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Quitter',
              onPress: () => BackHandler.exitApp(),
              style: 'destructive',
            },
          ]
        });
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [show])
  );
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const footerFadeAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(footerFadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 1200,
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

        {/* Footer - Modern & Professional */}
        <Animated.View 
          style={[
            styles.footerContainer, 
            { 
              opacity: footerFadeAnim,
              backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.8)',
            }
          ]}
        >
          {/* Shield Icon Container */}
          <View style={[styles.footerIconContainer, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="shield-checkmark" size={18} color={theme.primary} />
          </View>
          
          {/* Main Footer Text */}
          <View style={styles.footerTextContainer}>
            <Text style={[styles.footerMainText, { color: theme.textSecondary }]}>
              Sécurisé par
            </Text>
            <Text style={[styles.footerBrandText, { color: theme.primary }]}>
              HEI Technology
            </Text>
          </View>
          
        </Animated.View>
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
    justifyContent: 'center', 
    paddingVertical: 28,
  },
  logoSection: { 
    alignItems: 'center', 
    marginTop: 20,
    marginBottom: 24,
  },
  featureCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 24,
    marginBottom: 24,
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
    marginTop: 8,
    marginBottom: 24,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 16,
    alignSelf: 'center',
    width: '100%',
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
  // New footer styles
  footerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  footerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  footerMainText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerBrandText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  footerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
