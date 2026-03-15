import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ModernAlertProvider } from '@/src/components/ModernAlert';
import { useInactivity } from '@/hooks/useInactivity';
import { useGoalNotifications } from '@/src/hooks/useGoalNotifications';
import { useGoals } from '@/src/hooks/useGoals';
import { notificationService } from '@/src/services/notificationService';
import { GoalItem } from '@/src/types/goal';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useNotificationScheduler } from '@/src/hooks/useNotificationScheduler';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 0,
    },
  },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const { resetTimer } = useInactivity();
  const { goals } = useGoals();
  const router = useRouter();
  const accountId = useAuthStore((state) => state.accountId);

  useNotificationScheduler();

  // Gérer le clic sur les notifications d'objectifs
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const notificationData = response.notification.request.content.data;
      
      // Vérifier si c'est une notification d'objectif
      if (notificationData && notificationData.type) {
        const notificationType = notificationData.type as string;
        
        // Types d'objectifs : 'completed', 'deadline', 'expired'
        if (notificationType === 'completed' || notificationType === 'deadline' || notificationType === 'expired') {
          router.push('/(tabs)/objectif');
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  useGoalNotifications(async (notification) => {
    // Find the goal from the goals array to get accurate data
    const goal = goals.find((g: GoalItem) => g.id === notification.goalId);
    
    // Use push notification for goal notifications
    if (notification.type === 'completed' && goal) {
      // For completed goals, use the notification service
      await notificationService.sendGoalCompletedNotification(
        notification.goalId,
        goal.name,
        goal.amount,
        goal.currentAmount || 0
      );
    } else if (notification.type === 'deadline' && goal) {
      // Calculate days remaining
      const now = new Date();
      const endingDate = new Date(goal.endingDate);
      const daysRemaining = Math.ceil((endingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      await notificationService.sendGoalDeadlineNotification(
        notification.goalId,
        goal.name,
        daysRemaining,
        goal.amount
      );
    } else if (notification.type === 'expired' && goal) {
      await notificationService.sendGoalExpiredNotification(
        notification.goalId,
        goal.name
      );
    }
  });

  return (
    <View style={{ flex: 1 }} onTouchStart={resetTimer}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ModernAlertProvider />
        <AppContent />
        <StatusBar style="auto" hidden={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

