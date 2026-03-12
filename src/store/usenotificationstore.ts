import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Recurrence = 'Quotidienne' | 'Hebdomadaire' | 'Mensuelle';

export interface NotificationConfig {
  isEnabled: boolean;
  recurrence: Recurrence;
  daysCount: number;         // Période de calcul des dépenses (7, 30, 90 jours)
  notificationHour: number;  // Heure d'envoi (ex: 20 = 20h00)
  notificationMinute: number;
  walletId: string | null;   // null = tous les wallets
}

interface NotificationStore extends NotificationConfig {
  setConfig: (config: Partial<NotificationConfig>) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: NotificationConfig = {
  isEnabled: true,
  recurrence: 'Quotidienne',
  daysCount: 30,
  notificationHour: 20,
  notificationMinute: 0,
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
      name: 'notification-config', // Clé AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);