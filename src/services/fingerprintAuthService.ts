import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { AuthFormData } from '../utils/authSchema';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export interface BiometricCredentials {
  username: string;
  password: string;
}

export const fingerprintAuthService = {
  /** Vérifie si l'appareil possède un lecteur d'empreinte/Face ID */
  isAvailable: async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  /** Authentifie l'utilisateur via empreinte/Face ID */
  authenticate: async (
    promptMessage = 'Vérifiez votre identité pour continuer'
  ): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Annuler',
    });
    return result.success;
  },

  /** Enregistre les identifiants pour la connexion par empreinte (après authentification réussie) */
  saveCredentials: async (credentials: BiometricCredentials): Promise<void> => {
    await SecureStore.setItemAsync(
      BIOMETRIC_CREDENTIALS_KEY,
      JSON.stringify(credentials)
    );
  },

  /** Récupère les identifiants stockés (à utiliser après authenticate() réussi) */
  getCredentials: async (): Promise<BiometricCredentials | null> => {
    const stored = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as BiometricCredentials;
    } catch {
      return null;
    }
  },

  /** Vérifie si un compte est associé à l'empreinte */
  hasStoredCredentials: async (): Promise<boolean> => {
    const creds = await fingerprintAuthService.getCredentials();
    return creds !== null && !!creds.username;
  },

  /** Supprime les identifiants stockés (ex: au logout) */
  clearCredentials: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
  },

  /**
   * Associe l'empreinte au compte : authentifie puis enregistre les identifiants.
   * Retourne true si succès, false si annulé ou erreur.
   */
  enrollFingerprint: async (
    credentials: AuthFormData
  ): Promise<{ success: boolean; error?: string }> => {
    const available = await fingerprintAuthService.isAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Empreinte digitale non disponible sur cet appareil.',
      };
    }

    const authenticated = await fingerprintAuthService.authenticate(
      'Placez votre doigt pour associer votre empreinte à ce compte'
    );

    if (!authenticated) {
      return { success: false, error: 'Authentification annulée.' };
    }

    await fingerprintAuthService.saveCredentials({
      username: credentials.username,
      password: credentials.password,
    });
    return { success: true };
  },

  /**
   * Connexion par empreinte : authentifie puis récupère les identifiants et les retourne.
   */
  signInWithFingerprint: async (): Promise<{
    success: boolean;
    credentials?: AuthFormData;
    error?: string;
  }> => {
    const available = await fingerprintAuthService.isAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Empreinte digitale non disponible sur cet appareil.',
      };
    }

    const credentials = await fingerprintAuthService.getCredentials();
    if (!credentials) {
      return {
        success: false,
        error: 'Aucun compte associé à l\'empreinte. Connectez-vous d\'abord avec nom et mot de passe, puis associez votre empreinte.',
      };
    }

    const authenticated = await fingerprintAuthService.authenticate(
      'Placez votre doigt pour vous connecter'
    );

    if (!authenticated) {
      return { success: false, error: 'Authentification annulée.' };
    }

    return { success: true, credentials };
  },
};