import DashboardShell from '@/components/dashboard-shell';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useModernAlert } from '../../src/hooks/useModernAlert';
import { authService } from '../../src/services/authService';
import { fingerprintAuthService } from '../../src/services/fingerprintAuthService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function EmpreinteScreen() {
  const router = useRouter();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { error: showError, success: showSuccess, warning: showWarning } = useModernAlert();
  
  // Auth store
  const username = useAuthStore((state) => state.username);
  
  // State
  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNoHardwareWarning, setShowNoHardwareWarning] = useState(false);
  const [showActivationMessage, setShowActivationMessage] = useState(false);

  // Check initial fingerprint status
  useEffect(() => {
    checkFingerprintStatus();
  }, []);

  const checkFingerprintStatus = async () => {
    try {
      const hasCredentials = await fingerprintAuthService.hasStoredCredentials();
      setIsFingerprintEnabled(hasCredentials);
    } catch (error) {
      console.error('Error checking fingerprint status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle change
  const handleToggleFingerprint = async (value: boolean) => {
    if (value) {
      // Trying to activate fingerprint
      const hasHardware = await fingerprintAuthService.hasHardware();
      if (!hasHardware) {
        // Show warning immediately if no hardware
        setShowNoHardwareWarning(true);
        setTimeout(() => setShowNoHardwareWarning(false), 5000);
        return;
      }
      // Show activation message
      setShowActivationMessage(true);
    } else {
      setShowActivationMessage(false);
    }
    
    setHasChanges(true);
    setIsFingerprintEnabled(value);
  };

  // Handle cancel
  const handleCancel = () => {
    checkFingerprintStatus();
    setHasChanges(false);
    setPassword('');
    setShowPassword(false);
    setShowActivationMessage(false);
    setShowNoHardwareWarning(false);
  };

  // Handle save
  const handleSave = async () => {
    if (!password.trim()) {
      showWarning('Mot de passe requis', 'Veuillez entrer votre mot de passe pour continuer.');
      return;
    }

    setIsSaving(true);
    try {
      // First, verify the password by attempting to sign in
      const signInResponse = await authService.signIn({
        username: username || '',
        password: password,
      });

      if (isFingerprintEnabled) {
        // Activating fingerprint
        const result = await fingerprintAuthService.enrollFingerprint({
          username: username || '',
          password: password,
        });

        if (result.success) {
          showSuccess(
            'Empreinte activée',
            'Votre empreinte digitale a été associée à votre compte.'
          );
          setHasChanges(false);
          setPassword('');
          setShowActivationMessage(false);
        } else {
          showWarning(
            'Empreinte non activée',
            result.error || 'Impossible d\'activer l\'empreinte.'
          );
        }
      } else {
        // Deactivating fingerprint - just clear credentials after password verification
        await fingerprintAuthService.clearCredentials();
        showSuccess(
          'Empreinte désactivée',
          'L\'empreinte digitale a été retirée de votre compte.'
        );
        setHasChanges(false);
        setPassword('');
      }
    } catch (error: any) {
      showError(
        'Erreur d\'authentification',
        'Mot de passe incorrect. Veuillez réessayer.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android') {
          router.replace('/(tabs)/configuration');
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  if (isLoading) {
    return (
      <DashboardShell title="Empreinte digitale" subtitle="Configuration de l'empreinte" icon="finger-print">
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <Text style={{ color: theme.text }}>Chargement...</Text>
        </View>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Empreinte digitale" subtitle="Configuration de l'empreinte" icon="finger-print">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Warning message when device has no hardware */}
        {showNoHardwareWarning && (
          <View style={[styles.warningBox, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Ionicons name="warning" size={24} color="#B45309" />
            <Text style={[styles.warningText, { color: '#92400E' }]}>
              Ce téléphone ne contient pas de lecteur d&apos;empreinte digitale.
            </Text>
          </View>
        )}

        {/* Main fingerprint toggle */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="finger-print" size={28} color={theme.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Empreinte digitale
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                {isFingerprintEnabled ? 'Activé' : 'Désactivé'}
              </Text>
            </View>
            <Switch
              value={isFingerprintEnabled}
              onValueChange={handleToggleFingerprint}
              trackColor={{ false: theme.border, true: theme.primary + '50' }}
              thumbColor={isFingerprintEnabled ? theme.primary : '#f4f3f4'}
            />
          </View>

          {/* Info text */}
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {isFingerprintEnabled
              ? 'Votre compte est sécurisé par votre empreinte digitale. Vous pouvez vous connecter rapidement.'
              : 'Activez l\'empreinte digitale pour sécuriser votre compte et vous connecter plus rapidement.'}
          </Text>
        </View>

        {/* Activation message */}
        {showActivationMessage && isFingerprintEnabled && (
          <View style={[styles.infoBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
            <Ionicons name="information-circle" size={22} color={theme.primary} />
            <Text style={[styles.infoBoxText, { color: theme.text }]}>
              Après la saisie du mot de passe, cliquez sur Enregistrer pour vous authentifier puis ajouter l&apos;empreinte.
            </Text>
          </View>
        )}

        {/* Password input and buttons - only shown when there are changes */}
        {hasChanges && (
          <View style={[styles.passwordSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Confirmer avec votre mot de passe
            </Text>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Mot de passe"
                style={[styles.input, { color: theme.text }]}
                placeholderTextColor={theme.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isSaving}
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={handleCancel}
                disabled={isSaving}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }, isSaving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Text>
                {!isSaving && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security info */}
        <View style={[styles.securityInfo, { backgroundColor: theme.primary + '08' }]}>
          <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
          <Text style={[styles.securityText, { color: theme.textSecondary }]}>
            Vos identifiants sont chiffrés et stockés de manière sécurisée sur votre appareil.
          </Text>
        </View>

      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    marginTop: 14,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  passwordSection: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    height: 52,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

