import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Importation de React Query

import { useColorScheme } from '@/hooks/use-color-scheme';

// 1. On crée le client en dehors du composant pour éviter qu'il ne soit recréé à chaque render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Nombre de tentatives en cas d'échec
      staleTime: 1000 * 60 * 5, // Les données sont considérées "fraîches" pendant 5 minutes
    },
  },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // 2. On enveloppe tout avec le Provider
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}