import { useEffect } from "react";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

/**
 * Hook to automatically schedule/reschedule notifications when config changes.
 * Place this in _layout.tsx or high-level component.
 * Simplified to prevent selector issues - only react to enabled/accountId changes.
 */
export function useNotificationScheduler() {
  const accountId = useAuthStore((state) => state.accountId);
  const isEnabled = useNotificationStore((state) => state.isEnabled);

  useEffect(() => {
    if (!accountId || !isEnabled) {
      notificationService.cancelExpenseSummaryNotification();
      return;
    }

    const setupNotifications = async () => {
      const hasPermission =
        await notificationService.requestNotificationPermission();
      if (!hasPermission) {
        console.warn("[NotificationScheduler] Permission denied");
        return;
      }

      // Fetch full config for scheduling
      const config = useNotificationStore.getState();
      await notificationService.scheduleExpenseSummaryNotification(
        accountId,
        config,
      );
    };

    setupNotifications();
  }, [accountId, isEnabled]);
}
