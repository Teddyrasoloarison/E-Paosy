import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  accountId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, accountId: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  accountId: null,
  username: null,
  isAuthenticated: false,

  setAuth: async (token, accountId, username) => {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('accountId', accountId);
    await SecureStore.setItemAsync('username', username);
    set({ token, accountId, username, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('accountId');
    await SecureStore.deleteItemAsync('username');
    set({ token: null, accountId: null, username: null, isAuthenticated: false });
  },

  loadStorage: async () => {
    const token = await SecureStore.getItemAsync('userToken');
    const accountId = await SecureStore.getItemAsync('accountId');
    const username = await SecureStore.getItemAsync('username');
    if (token && accountId) {
      set({ token, accountId, username: username ?? 'Utilisateur', isAuthenticated: true });
    }
  }
}));