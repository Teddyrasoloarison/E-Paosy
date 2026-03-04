import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGoals } from './useGoals';
import { useAuthStore } from '../store/useAuthStore';

export interface GoalNotification {
  id: string;
  title: string;
  message: string;
  goalId: string;
  type: 'deadline' | 'completed' | 'expired';
}

export const useGoalNotifications = (onNotification?: (notification: GoalNotification) => void) => {
  const accountId = useAuthStore((state) => state.accountId);
  const { goals, refetch } = useGoals();

  const checkGoalDeadlines = useCallback(() => {
    if (!accountId || goals.length === 0 || !onNotification) return;

    const now = new Date();

    // Check each goal for deadline notifications
    for (const goal of goals) {
      const endingDate = new Date(goal.endingDate);
      const daysUntilDeadline = Math.ceil((endingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate progress
      const progress = (goal.currentAmount || 0) / goal.amount;
      const isCompleted = progress >= 1;

      // Send notification when goal is completed
      if (isCompleted) {
        onNotification({
          id: `${goal.id}-completed`,
          title: `Félicitations ! Objectif "${goal.name}" atteint ! 🎉`,
          message: `Vous avez atteint votre objectif de ${goal.amount.toLocaleString()} Ar avec ${(goal.currentAmount || 0).toLocaleString()} Ar d'épargne.`,
          goalId: goal.id,
          type: 'completed',
        });
        continue;
      }

      // Send notification based on deadline
      if (daysUntilDeadline === 0) {
        // Deadline is today
        onNotification({
          id: `${goal.id}-today`,
          title: `Objectif "${goal.name}" expire aujourd'hui !`,
          message: `Vous avez jusqu'à aujourd'hui pour atteindre votre objectif de ${goal.amount.toLocaleString()} Ar.`,
          goalId: goal.id,
          type: 'deadline',
        });
      } else if (daysUntilDeadline === 1) {
        // Deadline is tomorrow
        onNotification({
          id: `${goal.id}-tomorrow`,
          title: `Objectif "${goal.name}" expire demain !`,
          message: `Plus que 1 jour pour atteindre votre objectif.`,
          goalId: goal.id,
          type: 'deadline',
        });
      } else if (daysUntilDeadline === 7) {
        // One week before deadline
        onNotification({
          id: `${goal.id}-week`,
          title: `Objectif "${goal.name}" : 7 jours restants`,
          message: `Il vous reste 7 jours pour atteindre votre objectif.`,
          goalId: goal.id,
          type: 'deadline',
        });
      } else if (daysUntilDeadline < 0) {
        // Deadline has passed
        onNotification({
          id: `${goal.id}-expired`,
          title: `Objectif "${goal.name}" expiré`,
          message: `Le délai pour atteindre votre objectif est dépassé.`,
          goalId: goal.id,
          type: 'expired',
        });
      }
    }
  }, [accountId, goals, onNotification]);

  useEffect(() => {
    // Check when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Refetch goals and check deadlines
        refetch();
        checkGoalDeadlines();
      }
    });

    // Initial check
    const timer = setTimeout(checkGoalDeadlines, 3000); // Wait 3 seconds after mount

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [checkGoalDeadlines, refetch]);

  return {
    checkGoalDeadlines,
  };
};

