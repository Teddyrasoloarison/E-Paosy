import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const notificationService = {
  /**
   * Request permissions to show notifications
   */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions');
      return false;
    }

    // Set notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('goal-notifications', {
        name: 'Objectifs',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E6F4FE',
        sound: 'default',
      });
    }

    return true;
  },

  /**
   * Send a local notification for goal completion
   */
  async sendGoalCompletedNotification(
    goalId: string,
    goalName: string,
    targetAmount: number,
    currentAmount: number
  ): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const title = `🎉 Objectif "${goalName}" atteint !`;
    const body = `Félicitations ! Vous avez atteint votre objectif de ${targetAmount.toLocaleString()} Ar avec ${currentAmount.toLocaleString()} Ar d'épargne.`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { goalId, type: 'completed' },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  },

  /**
   * Send a local notification for goal deadline
   */
  async sendGoalDeadlineNotification(
    goalId: string,
    goalName: string,
    daysRemaining: number,
    targetAmount: number
  ): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    let title: string;
    let body: string;

    if (daysRemaining === 0) {
      title = `⚠️ Objectif "${goalName}" expire aujourd'hui !`;
      body = `Vous avez jusqu'à aujourd'hui pour atteindre votre objectif de ${targetAmount.toLocaleString()} Ar.`;
    } else if (daysRemaining === 1) {
      title = `⏰ Objectif "${goalName}" expire demain !`;
      body = `Plus que 1 jour pour atteindre votre objectif.`;
    } else {
      title = `📅 Objectif "${goalName}" : ${daysRemaining} jours restants`;
      body = `Il vous reste ${daysRemaining} jours pour atteindre votre objectif.`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { goalId, type: 'deadline' },
        sound: 'default',
      },
      trigger: null,
    });
  },

  /**
   * Send a local notification for expired goal
   */
  async sendGoalExpiredNotification(
    goalId: string,
    goalName: string
  ): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const title = `❌ Objectif "${goalName}" expiré`;
    const body = `Le délai pour atteindre votre objectif est dépassé.`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { goalId, type: 'expired' },
        sound: 'default',
      },
      trigger: null,
    });
  },

  /**
   * Send a generic notification
   */
  async sendNotification(content: NotificationContent): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: 'default',
      },
      trigger: null,
    });
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Get the notification categories (for handling notification taps)
   */
  async setNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('goal', [
      {
        identifier: 'view',
        buttonTitle: 'Voir l\'objectif',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Fermer',
        options: { isDestructive: true },
      },
    ]);
  },
};

export default notificationService;
