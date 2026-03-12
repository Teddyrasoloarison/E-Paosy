import * as Notifications from 'expo-notifications';
import { transactionService } from './transactionService';
import { NotificationConfig } from '../store/usenotificationstore';

// Configuration globale du handler (à appeler au démarrage de l'app)
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
  await cancelDailyExpenseNotification();

  if (!config.isEnabled) return null;

  const now = new Date();
  const startingDate = new Date(now);
  startingDate.setDate(startingDate.getDate() - config.daysCount);

  try {
    const transactions = await transactionService.getTransactions(accountId, {
      startingDate: startingDate.toISOString(),
      endingDate: now.toISOString(),
      type: 'OUT',
      walletId: config.walletId ?? undefined,
    });

    const totalExpenses = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const formattedAmount = totalExpenses.toLocaleString('fr-FR');
    const trigger = buildTrigger(config);

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

export async function cancelDailyExpenseNotification() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const expenseNotifs = scheduled.filter(
    (n) => n.content.data?.type === 'daily_expense_summary'
  );
  await Promise.all(
    expenseNotifs.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// --- HELPERS PRIVÉS ---

/**
 * Détecte si la récurrence est un intervalle custom "Tous les X jours"
 * et retourne le nombre de jours, sinon null.
 */
function parseCustomInterval(recurrence: string): number | null {
  const match = recurrence.match(/^Tous les (\d+) jours$/);
  return match ? parseInt(match[1]) : null;
}

function buildTrigger(config: NotificationConfig): Notifications.NotificationTriggerInput {
  const { notificationHour, notificationMinute, recurrence } = config;

  // Récurrence custom : "Tous les X jours"
  const customDays = parseCustomInterval(recurrence);
  if (customDays !== null) {
    // Expo ne supporte pas nativement "tous les X jours" avec un trigger calendrier.
    // On programme la prochaine occurrence avec un délai en secondes.
    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: customDays * 24 * 60 * 60,
      repeats: true,
    };
  }

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
        weekday: 2, // Lundi
        hour: notificationHour,
        minute: notificationMinute,
      };

    case 'Mensuelle':
      return {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: 1,
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
  const customDays = parseCustomInterval(config.recurrence);
  const periodLabel =
    config.daysCount === 1
      ? "aujourd'hui"
      : `ces ${config.daysCount} derniers jours`;

  const recurrenceLabel = customDays
    ? `(intervalle : tous les ${customDays} jours)`
    : '';

  if (total === 0) {
    return `Aucune dépense enregistrée ${periodLabel}. 🎉`;
  }

  return `Vous avez dépensé ${formattedAmount} Ar ${periodLabel}. ${recurrenceLabel}`.trim();
}