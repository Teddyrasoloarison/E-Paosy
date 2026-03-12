import * as Notifications from 'expo-notifications';
import { transactionService } from './transactionService';
import { NotificationConfig } from '../store/usenotificationstore';

// Configuration globale de l'affichage des notifications (à appeler au démarrage de l'app)
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
     shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Calcule le total des dépenses (type OUT) sur la période configurée
 * et programme une notification locale avec ce montant.
 */
export async function scheduleDailyExpenseNotification(
  accountId: string,
  config: NotificationConfig
): Promise<string | null> {
  // 1. Annuler toutes les notifications précédemment programmées par ce service
  await cancelDailyExpenseNotification();

  if (!config.isEnabled) return null;

  // 2. Calculer la date de début selon daysCount
  const now = new Date();
  const startingDate = new Date(now);
  startingDate.setDate(startingDate.getDate() - config.daysCount);

  try {
    // 3. Récupérer les transactions via ton service existant
    const transactions = await transactionService.getTransactions(accountId, {
      startingDate: startingDate.toISOString(),
      endingDate: now.toISOString(),
      type: 'OUT',                          // Uniquement les dépenses
      walletId: config.walletId ?? undefined, // null = tous les wallets
    });

    // 4. Calculer le total des dépenses
    const totalExpenses = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const formattedAmount = totalExpenses.toLocaleString('fr-FR');

    // 5. Construire le trigger selon la récurrence
    const trigger = buildTrigger(config);

    // 6. Programmer la notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💸 Résumé de vos dépenses',
        body: buildNotificationBody(totalExpenses, formattedAmount, config),
        data: {
          type: 'daily_expense_summary',
          totalExpenses,
          daysCount: config.daysCount,
          walletId: config.walletId,
        },
      },
      trigger,
    });

    console.log(`[Notification] Programmée (id: ${notificationId}) - Total: ${formattedAmount} Ar`);
    return notificationId;

  } catch (error) {
    console.error('[Notification] Erreur lors du calcul des dépenses:', error);
    return null;
  }
}

/**
 * Annule toutes les notifications de dépenses programmées
 */
export async function cancelDailyExpenseNotification() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const expenseNotifs = scheduled.filter(
    (n) => n.content.data?.type === 'daily_expense_summary'
  );
  await Promise.all(expenseNotifs.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

/**
 * Demande la permission d'envoyer des notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// --- HELPERS PRIVÉS ---

function buildTrigger(config: NotificationConfig): Notifications.NotificationTriggerInput {
  const { notificationHour, notificationMinute, recurrence } = config;

  switch (recurrence) {
    case 'Quotidienne':
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: notificationHour,
        minute: notificationMinute,
      };

    case 'Hebdomadaire':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 2, // Lundi (1=Dimanche, 2=Lundi... selon Expo)
        hour: notificationHour,
        minute: notificationMinute,
      };

    case 'Mensuelle':
      return {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: 1, // Le 1er de chaque mois
        hour: notificationHour,
        minute: notificationMinute,
      };

    default:
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: notificationHour,
        minute: notificationMinute,
      };
  }
}

function buildNotificationBody(
  total: number,
  formattedAmount: string,
  config: NotificationConfig
): string {
  const periodLabel =
    config.daysCount === 1
      ? "aujourd'hui"
      : `ces ${config.daysCount} derniers jours`;

  if (total === 0) {
    return `Aucune dépense enregistrée ${periodLabel}. 🎉`;
  }

  return `Vous avez dépensé ${formattedAmount} Ar ${periodLabel}.`;
}