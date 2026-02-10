import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; // On importe le store

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// L'intercepteur : il s'exécute AVANT chaque requête
api.interceptors.request.use(
  async (config) => {
    // On récupère le token depuis Zustand (pas depuis SecureStore directement, c'est plus rapide)
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;