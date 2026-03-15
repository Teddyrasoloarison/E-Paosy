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
  const notificationHour = useNotificationStore(
    (state) => state.notificationHour,
  );
  const notificationMinute = useNotificationStore(
    (state) => state.notificationMinute,
  );
  const recurrence = useNotificationStore((state) => state.recurrence);
  const daysCount = useNotificationStore((state) => state.daysCount);

  useEffect(() => {
    console.log("[NotificationScheduler] Config changed:", {
      accountId,
      isEnabled,
      notificationHour,
      notificationMinute,
      recurrence,
      daysCount,
    });

    if (!accountId || !isEnabled) {
      console.log("[NotificationScheduler] Disabled - cancelling");
      notificationService.cancelExpenseSummaryNotification();
      return;
    }

    const setupNotifications = async () => {
      console.log("[NotificationScheduler] setupNotifications called");
      const hasPermission =
        await notificationService.requestNotificationPermission();
      if (!hasPermission) {
        console.warn("[NotificationScheduler] Permission denied");
        return;
      }

      // Cancel any existing before re-scheduling
      console.log("[NotificationScheduler] Calling cancel...");
      await notificationService.cancelExpenseSummaryNotification();
      console.log("[NotificationScheduler] Cancel done");

      // Fetch full config for scheduling
      const config = useNotificationStore.getState();
      console.log("[NotificationScheduler] Scheduling with config:", config);
      const notificationId =
        await notificationService.scheduleExpenseSummaryNotification(
          accountId,
          config,
        );
      console.log(
        "[NotificationScheduler] Scheduled notification ID:",
        notificationId,
      );
    };

    setupNotifications();
  }, [
    accountId,
    isEnabled,
    notificationHour,
    notificationMinute,
    recurrence,
    daysCount,
  ]);
}
