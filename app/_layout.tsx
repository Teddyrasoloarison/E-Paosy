import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Importation de React Query
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ModernAlertProvider } from '@/src/components/ModernAlert';
import { useInactivity } from '@/hooks/useInactivity';

// 1. On crée le client en dehors du composant pour éviter qu'il ne soit recréé à chaque render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Nombre de tentatives en cas d'échec
      staleTime: 0, // Les données sont considérées obsolètes immédiatement pour forcer le rechargement
    },
  },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isActive, resetTimer } = useInactivity();

  return (
    // 2. On enveloppe tout avec le Provider
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ModernAlertProvider />
        <View style={{ flex: 1 }} onTouchStart={resetTimer}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </View>
        <StatusBar style="auto" hidden={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
