# TODO: Fix Period-Based Expense Notifications

## Plan Breakdown (Approved by User)

### Step 1: [PENDING] Update src/hooks/useNotificationScheduler.ts

- Add full config deps to useEffect ([accountId, isEnabled, notificationHour, notificationMinute, recurrence, daysCount])
- Cancel before re-schedule on config changes
- Add debug logs

### Step 2: [PENDING] Update src/store/useNotificationStore.ts

- Change DEFAULT_CONFIG: notificationHour:7, notificationMinute:5

### Step 3: [PENDING] Update src/services/notificationService.ts

- Align notification text prefix to "Total des dépenses [period]: X Ar"
- Improve period labels for multi-day quotidienne
- Add debug logs

### Step 4: [PENDING] Test & Verify

- Restart app → Change periods/time in settings
- Check console logs for re-scheduling
- Verify notification texts match expectations (semaine/mois/année)
- Test at 7h05 for quotidienne

### Step 5: [PENDING] Complete

- Update this TODO.md with ✓
- attempt_completion

Current Progress: Ready for Step 1 edits.
