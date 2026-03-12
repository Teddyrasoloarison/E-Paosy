import { useEffect } from 'react';
import { useNotificationStore } from '../store/usenotificationstore';
import { useAuthStore } from '../store/useAuthStore';
import {
  scheduleDailyExpenseNotification,
  cancelDailyExpenseNotification,
  requestNotificationPermission,
  setupNotificationHandler,
} from '../services/notificationService';

/**
 * Ce hook doit être placé UNE SEULE FOIS dans un composant parent haut
 * dans l'arbre (ex: _layout.tsx ou App.tsx).
 *
 * Il écoute les changements de config et reprogramme automatiquement
 * la notification en appelant transactionService pour calculer les dépenses.
 */
export function useNotificationScheduler() {
  const accountId = useAuthStore((state) => state.accountId);
  const config = useNotificationStore((state) => ({
    isEnabled: state.isEnabled,
    recurrence: state.recurrence,
    daysCount: state.daysCount,
    notificationHour: state.notificationHour,
    notificationMinute: state.notificationMinute,
    walletId: state.walletId,
  }));

  useEffect(() => {
    // Configure le handler une seule fois au montage
    setupNotificationHandler();
  }, []);

  useEffect(() => {
    if (!accountId) return;

    const schedule = async () => {
      // Demander la permission si nécessaire
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        console.warn('[Notification] Permission refusée par l\'utilisateur');
        return;
      }

      if (!config.isEnabled) {
        // Si désactivé, on annule tout
        await cancelDailyExpenseNotification();
        console.log('[Notification] Désactivées, annulation des notifications programmées');
        return;
      }

      // Reprogrammer avec la nouvelle config
      await scheduleDailyExpenseNotification(accountId, config);
    };

    schedule();
  }, [
    accountId,
    config.isEnabled,
    config.recurrence,
    config.daysCount,
    config.notificationHour,
    config.notificationMinute,
    config.walletId,
  ]);
}