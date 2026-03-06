import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGoals } from './useGoals';
import { useAuthStore } from '../store/useAuthStore';
import { notificationService } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_HISTORY_KEY = 'notification_history';

interface NotificationRecord {
  goalId: string;
  type: 'completed' | 'deadline' | 'expired' | 'deadline-today' | 'deadline-tomorrow' | 'deadline-week';
  sentAt: string;
}

export interface GoalNotification {
  id: string;
  title: string;
  message: string;
  goalId: string;
  type: 'deadline' | 'completed' | 'expired';
}

// Type for notification types (extended for deadline variations)
type NotificationType = 'completed' | 'deadline' | 'expired' | 'deadline-today' | 'deadline-tomorrow' | 'deadline-week';

// Helper functions to manage notification history
const getNotificationHistory = async (): Promise<NotificationRecord[]> => {
  try {
    const historyJson = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch {
    return [];
  }
};

const hasNotificationBeenSent = async (goalId: string, type: NotificationType): Promise<boolean> => {
  const history = await getNotificationHistory();
  return history.some((record) => record.goalId === goalId && record.type === type);
};

const markNotificationAsSent = async (goalId: string, type: NotificationType): Promise<void> => {
  try {
    const history = await getNotificationHistory();
    history.push({ goalId, type, sentAt: new Date().toISOString() });
    // Keep only last 100 records
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(history.slice(-100)));
  } catch (error) {
    console.error('Error saving notification history:', error);
  }
};

export const useGoalNotifications = (onNotification?: (notification: GoalNotification) => void) => {
  const accountId = useAuthStore((state) => state.accountId);
  const { goals, refetch } = useGoals();
  const checkedGoalsRef = useRef<Set<string>>(new Set());

  const checkGoalDeadlines = useCallback(async () => {
    if (!accountId || goals.length === 0) return;

    const now = new Date();

    for (const goal of goals) {
      const endingDate = new Date(goal.endingDate);
      const daysUntilDeadline = Math.ceil((endingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate progress
      const progress = (goal.currentAmount || 0) / goal.amount;
      const isCompleted = progress >= 1;

      // Check if goal was just completed
      if (isCompleted && !checkedGoalsRef.current.has(`${goal.id}-completed`)) {
        checkedGoalsRef.current.add(`${goal.id}-completed`);
        
        // Check if notification already sent
        const alreadySent = await hasNotificationBeenSent(goal.id, 'completed');
        
        if (!alreadySent) {
          if (onNotification) {
            onNotification({
              id: `${goal.id}-completed`,
              title: `Félicitations ! Objectif "${goal.name}" atteint ! 🎉`,
              message: `Vous avez atteint votre objectif de ${goal.amount.toLocaleString()} Ar avec ${(goal.currentAmount || 0).toLocaleString()} Ar d'épargne.`,
              goalId: goal.id,
              type: 'completed',
            });
          } else {
            // Send notification directly if no callback
            try {
              await notificationService.sendGoalCompletedNotification(
                goal.id,
                goal.name,
                goal.amount,
                goal.currentAmount || 0
              );
              await markNotificationAsSent(goal.id, 'completed');
            } catch (error) {
              console.error('Error sending goal completion notification:', error);
            }
          }
        }
      }

      // Send notification based on deadline (only if goal is not completed)
      if (!isCompleted) {
        if (daysUntilDeadline === 0) {
          const alreadySent = await hasNotificationBeenSent(goal.id, 'deadline-today');
          if (!alreadySent) {
            onNotification?.({
              id: `${goal.id}-today`,
              title: `Objectif "${goal.name}" expire aujourd'hui !`,
              message: `Vous avez jusqu'à aujourd'hui pour atteindre votre objectif de ${goal.amount.toLocaleString()} Ar.`,
              goalId: goal.id,
              type: 'deadline',
            });
            await markNotificationAsSent(goal.id, 'deadline-today');
          }
        } else if (daysUntilDeadline === 1) {
          const alreadySent = await hasNotificationBeenSent(goal.id, 'deadline-tomorrow');
          if (!alreadySent) {
            onNotification?.({
              id: `${goal.id}-tomorrow`,
              title: `Objectif "${goal.name}" expire demain !`,
              message: `Plus que 1 jour pour atteindre votre objectif.`,
              goalId: goal.id,
              type: 'deadline',
            });
            await markNotificationAsSent(goal.id, 'deadline-tomorrow');
          }
        } else if (daysUntilDeadline === 7) {
          const alreadySent = await hasNotificationBeenSent(goal.id, 'deadline-week');
          if (!alreadySent) {
            onNotification?.({
              id: `${goal.id}-week`,
              title: `Objectif "${goal.name}" : 7 jours restants`,
              message: `Il vous reste 7 jours pour atteindre votre objectif.`,
              goalId: goal.id,
              type: 'deadline',
            });
            await markNotificationAsSent(goal.id, 'deadline-week');
          }
        } else if (daysUntilDeadline < 0) {
          const alreadySent = await hasNotificationBeenSent(goal.id, 'expired');
          if (!alreadySent) {
            onNotification?.({
              id: `${goal.id}-expired`,
              title: `Objectif "${goal.name}" expiré`,
              message: `Le délai pour atteindre votre objectif est dépassé.`,
              goalId: goal.id,
              type: 'expired',
            });
            await markNotificationAsSent(goal.id, 'expired');
          }
        }
      }
    }
  }, [accountId, goals, onNotification]);

  // Check for goal completion immediately when goals change
  useEffect(() => {
    if (goals.length > 0) {
      checkGoalDeadlines();
    }
  }, [goals, checkGoalDeadlines]);

  useEffect(() => {
    // Check when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refetch();
        checkGoalDeadlines();
      }
    });

    // Initial check after a short delay
    const timer = setTimeout(checkGoalDeadlines, 3000);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [checkGoalDeadlines, refetch]);

  return {
    checkGoalDeadlines,
  };
};

// Export a function to check a single goal for completion (callable after transaction)
export const checkGoalCompletion = async (
  goalId: string,
  goalName: string,
  targetAmount: number,
  currentAmount: number
): Promise<boolean> => {
  if (currentAmount >= targetAmount) {
    const alreadySent = await hasNotificationBeenSent(goalId, 'completed');
    if (!alreadySent) {
      try {
        await notificationService.sendGoalCompletedNotification(
          goalId,
          goalName,
          targetAmount,
          currentAmount
        );
        await markNotificationAsSent(goalId, 'completed');
        return true;
      } catch (error) {
        console.error('Error sending goal completion notification:', error);
      }
    }
  }
  return false;
};

