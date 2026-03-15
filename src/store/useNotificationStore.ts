import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Storage compatible Expo Go
const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn("[NotificationStore] setItem échoué:", e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn("[NotificationStore] removeItem échoué:", e);
    }
  },
};

// Récurrence : valeurs standard + \"Tous les X jours\" pour le custom
export type Recurrence =
  | "Quotidienne"
  | "Hebdomadaire"
  | "Mensuelle"
  | "Annuelle";

export interface NotificationConfig {
  isEnabled: boolean;
  recurrence: Recurrence;
  daysCount: number; // Période de calcul des dépenses (1–365 jours)
  notificationHour: number; // Heure d'envoi (0–23)
  notificationMinute: number; // Minutes (0–59)
  walletId: string | null; // null = tous les wallets
}

interface NotificationStore extends NotificationConfig {
  setConfig: (config: Partial<NotificationConfig>) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: NotificationConfig = {
  isEnabled: true,
  recurrence: "Quotidienne",
  daysCount: 1,
  notificationHour: 7,
  notificationMinute: 5,
  walletId: null,
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      ...DEFAULT_CONFIG,
      setConfig: (config) => set((state) => ({ ...state, ...config })),
      resetConfig: () => set(DEFAULT_CONFIG),
    }),
    {
      name: "notification-config",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
