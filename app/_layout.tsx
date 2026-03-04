import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ModernAlertProvider } from '@/src/components/ModernAlert';
import { useInactivity } from '@/hooks/useInactivity';
import { useGoalNotifications } from '@/src/hooks/useGoalNotifications';
import { getModernAlertHandler } from '@/src/components/ModernAlert';

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

  useGoalNotifications((notification) => {
    const alertHandler = getModernAlertHandler();
    if (alertHandler) {
      alertHandler.show({
        title: notification.title,
        message: notification.message,
        type: notification.type === 'completed' ? 'success' : 'warning',
      });
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

