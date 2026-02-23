import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  accountId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, accountId: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  accountId: null,
  isAuthenticated: false,

  setAuth: async (token, accountId) => {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('accountId', accountId);
    set({ token, accountId, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('accountId');
    set({ token: null, accountId: null, isAuthenticated: false });
  },

  loadStorage: async () => {
    const token = await SecureStore.getItemAsync('userToken');
    const accountId = await SecureStore.getItemAsync('accountId');
    if (token && accountId) {
      set({ token, accountId, isAuthenticated: true });
    }
  }
}));