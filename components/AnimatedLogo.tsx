import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { useThemeStore } from '../src/store/useThemeStore';
import { Colors } from '../constants/colors';

const logoEpaosy = require('../assets/images/logo-e-paosy.png');

interface AnimatedLogoProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function AnimatedLogo({ showText = true, size = 'large' }: AnimatedLogoProps) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const sizes = {
    small:  { container: 60,  icon: 30, text: 16 },
    medium: { container: 100, icon: 50, text: 22 },
    large:  { container: 140, icon: 70, text: 34 },
  };
  const currentSize = sizes[size];

  // --- Animation values ---
  const logoScale    = useRef(new Animated.Value(0)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const ringScale    = useRef(new Animated.Value(0)).current;
  const ringOpacity  = useRef(new Animated.Value(0)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const bgScale      = useRef(new Animated.Value(3)).current;
  const bgOpacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Étape 1 : cercle de fond se contracte depuis grand vers normal (effet "zoom in inversé")
      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bgScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),

      // Étape 2 : ring s'expand puis disparait (one-shot)
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.8,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0.6,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Étape 3 : logo apparaît avec un léger overshoot
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // Étape 4 : texte glisse vers le haut
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* Wrapper qui regroupe cercle + ring + logo → alignement parfait garanti */}
      <View style={{
        width: currentSize.container,
        height: currentSize.container,
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* Cercle de fond qui se contracte */}
        <Animated.View
          style={{
            position: 'absolute',
            width: currentSize.container + 20,
            height: currentSize.container + 20,
            borderRadius: (currentSize.container + 20) / 2,
            backgroundColor: theme.primary,
            opacity: bgOpacity,
            transform: [{ scale: bgScale }],
          }}
        />

        {/* Ring one-shot */}
        <Animated.View
          style={{
            position: 'absolute',
            width: currentSize.container + 20,
            height: currentSize.container + 20,
            borderRadius: (currentSize.container + 20) / 2,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: theme.primary,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          }}
        />

        {/* Logo — rendu en dernier = par-dessus le cercle et le ring */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              width: currentSize.container,
              height: currentSize.container,
              borderRadius: currentSize.container / 2,
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={logoEpaosy}
            style={{ width: currentSize.icon, height: currentSize.icon }}
            resizeMode="contain"
          />
        </Animated.View>

      </View>

      {/* Texte */}
      {showText && (
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={[styles.appName, { color: theme.primary }]}>
            E-PAOSY
          </Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Votre argent, partout, tout le temps.
          </Text>
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});