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
  const accountId = useAuthStore((state) => state.accountId);
  
  // State for password change section
  const [oldPassword, setOldPassword] = useState('');
  const [confirmOldPassword, setConfirmOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmOldPassword, setShowConfirmOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // State for fingerprint section
  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [fingerprintPassword, setFingerprintPassword] = useState('');
  const [showFingerprintPassword, setShowFingerprintPassword] = useState(false);
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

  // Handle toggle change for fingerprint
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

  // Handle cancel for fingerprint
  const handleCancel = () => {
    checkFingerprintStatus();
    setHasChanges(false);
    setFingerprintPassword('');
    setShowFingerprintPassword(false);
    setShowActivationMessage(false);
    setShowNoHardwareWarning(false);
  };

  // Handle save for fingerprint
  const handleSaveFingerprint = async () => {
    if (!fingerprintPassword.trim()) {
      showWarning('Mot de passe requis', 'Veuillez entrer votre mot de passe pour continuer.');
      return;
    }

    setIsSaving(true);
    try {
      // First, verify the password by attempting to sign in

      if (isFingerprintEnabled) {
        // Activating fingerprint
        const result = await fingerprintAuthService.enrollFingerprint({
          username: username || '',
          password: fingerprintPassword,
        });

        if (result.success) {
          showSuccess(
            'Empreinte activée',
            'Votre empreinte digitale a été associée à votre compte.'
          );
          setHasChanges(false);
          setFingerprintPassword('');
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
        setFingerprintPassword('');
      }
    } catch {
      showError(
        'Erreur d\'authentification',
        'Mot de passe incorrect. Veuillez réessayer.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword.trim()) {
      showWarning('Mot de passe requis', 'Veuillez entrer votre ancien mot de passe.');
      return;
    }
    if (!confirmOldPassword.trim()) {
      showWarning('Confirmation requise', 'Veuillez confirmer votre ancien mot de passe.');
      return;
    }
    if (!newPassword.trim()) {
      showWarning('Nouveau mot de passe requis', 'Veuillez entrer un nouveau mot de passe.');
      return;
    }
    if (oldPassword !== confirmOldPassword) {
      showWarning('Erreur de confirmation', 'Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (oldPassword === newPassword) {
      showWarning('Erreur', 'Le nouveau mot de passe doit être différent de l\'ancien.');
      return;
    }
    if (newPassword.length < 4) {
      showWarning('Mot de passe trop court', 'Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(accountId || '', oldPassword, newPassword);
      showSuccess(
        'Mot de passe modifié',
        'Votre mot de passe a été changé avec succès.'
      );
      // Reset form
      setOldPassword('');
      setConfirmOldPassword('');
      setNewPassword('');
      setPasswordChangeSuccess(true);
      setTimeout(() => setPasswordChangeSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erreur lors du changement de mot de passe';
      showError(
        'Erreur',
        errorMessage
      );
    } finally {
      setIsChangingPassword(false);
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
      <DashboardShell title="Sécurité" subtitle="Gérez votre sécurité" icon="shield-checkmark">
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <Text style={{ color: theme.text }}>Chargement...</Text>
        </View>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Sécurité" subtitle="Gérez votre sécurité" icon="shield-checkmark">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1: Modification de mot de passe */}
        <Text style={[styles.mainSectionTitle, { color: theme.textSecondary }]}>
          MODIFICATION DE MOT DE PASSE
        </Text>
        
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="key" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Changer mon mot de passe
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                Mettez à jour votre mot de passe
              </Text>
            </View>
          </View>

          {/* Ancien mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Ancien mot de passe
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
            <TextInput
                placeholder="Entrez l'ancien mot de passe"
                style={[styles.input, { color: theme.text }]}
                placeholderTextColor={theme.textTertiary}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPassword}
                editable={!isChangingPassword}
              />
              <TouchableOpacity onPress={() => setShowOldPassword((prev) => !prev)}>
                <Ionicons
                  name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmation de l'ancien mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Confirmer l&apos;ancien mot de passe
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Confirmez l'ancien mot de passe"
                style={[styles.input, { color: theme.text }]}
                placeholderTextColor={theme.textTertiary}
                value={confirmOldPassword}
                onChangeText={setConfirmOldPassword}
                secureTextEntry={!showConfirmOldPassword}
                editable={!isChangingPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmOldPassword((prev) => !prev)}>
                <Ionicons
                  name={showConfirmOldPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Nouveau mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Nouveau mot de passe
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Ionicons name="key-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Entrez le nouveau mot de passe"
                style={[styles.input, { color: theme.text }]}
                placeholderTextColor={theme.textTertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                editable={!isChangingPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword((prev) => !prev)}>
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Success message */}
          {passwordChangeSuccess && (
            <View style={[styles.successBox, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text style={[styles.successText, { color: '#047857' }]}>
                Mot de passe modifié avec succès!
              </Text>
            </View>
          )}

          {/* Enregistrer button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }, isChangingPassword && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={isChangingPassword}
          >
            <Text style={styles.saveButtonText}>
              {isChangingPassword ? 'Enregistrement...' : 'Enregistrer'}
            </Text>
            {!isChangingPassword && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>

        {/* SECTION 2: Configuration d'empreinte */}
        <Text style={[styles.mainSectionTitle, { color: theme.textSecondary }]}>
          CONFIGURATION D&apos;EMPREINTE
        </Text>
        
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
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Confirmer avec votre mot de passe
            </Text>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Mot de passe"
                style={[styles.input, { color: theme.text }]}
                placeholderTextColor={theme.textTertiary}
                value={fingerprintPassword}
                onChangeText={setFingerprintPassword}
                secureTextEntry={!showFingerprintPassword}
                editable={!isSaving}
              />
              <TouchableOpacity onPress={() => setShowFingerprintPassword((prev) => !prev)}>
                <Ionicons
                  name={showFingerprintPassword ? 'eye-off-outline' : 'eye-outline'}
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
                onPress={handleSaveFingerprint}
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
  mainSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 4,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
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

