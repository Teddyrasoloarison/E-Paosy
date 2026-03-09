// E-Tech Modern Color Palette
// Elegant, modern, and clean design

export const Colors = {
  light: {
    // Primary colors - Elegant Green Teal
    primary: '#0D9488',
    primaryLight: '#14B8A6',
    primaryDark: '#0F766E',
    
    // Secondary colors - Modern Teal
    secondary: '#06B6D4',
    secondaryLight: '#22D3EE',
    secondaryDark: '#0891B2',
    
    // Background colors
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Text colors
    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',
    
    // Accent colors
    accent: '#8B5CF6',
    accentLight: '#A78BFA',
    accentPink: '#EC4899',
    accentOrange: '#F97316',
    accentGreen: '#10B981',
    accentRed: '#EF4444',
    accentYellow: '#F59E0B',
    
    // Border colors
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',
    
    // Shadow colors
    shadow: 'rgba(15, 23, 42, 0.08)',
    shadowMedium: 'rgba(15, 23, 42, 0.12)',
    shadowStrong: 'rgba(15, 23, 42, 0.16)',
    
    // Gradient colors
    gradientStart: '#0D9488',
    gradientEnd: '#06B6D4',
    
    // Overlay
    overlay: 'rgba(15, 23, 42, 0.5)',
    
    // Special
    cardGradient: ['#FFFFFF', '#F8FAFC'],
    highlight: '#0D9488',
  },
  
  dark: {
    // Primary colors - Elegant Teal for dark
    primary: '#14B8A6',
    primaryLight: '#2DD4BF',
    primaryDark: '#0D9488',
    
    // Secondary colors
    secondary: '#22D3EE',
    secondaryLight: '#67E8F9',
    secondaryDark: '#06B6D4',
    
    // Background colors
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    surface: '#1E293B',
    surfaceElevated: '#334155',
    
    // Text colors
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textInverse: '#0F172A',
    
    // Accent colors
    accent: '#A78BFA',
    accentLight: '#C4B5FD',
    accentPink: '#F472B6',
    accentOrange: '#FB923C',
    accentGreen: '#34D399',
    accentRed: '#F87171',
    accentYellow: '#FBBF24',
    
    // Border colors
    border: '#334155',
    borderLight: '#1E293B',
    
    // Status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#38BDF8',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
    shadowStrong: 'rgba(0, 0, 0, 0.5)',
    
    // Gradient colors
    gradientStart: '#14B8A6',
    gradientEnd: '#22D3EE',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Special
    cardGradient: ['#1E293B', '#0F172A'],
    highlight: '#14B8A6',
  },
};

// Typography
export const Typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
    '6xl': 48,
  },
  
  fontWeights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// Border Radius
export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Shadows (for iOS)
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
};
