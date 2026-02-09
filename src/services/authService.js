import api from './api';

export const authService = {
  signUp: async (username, password) => {
    try {
      const response = await api.post('/auth/sign-up', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      // On propage l'erreur pour que le composant puisse l'afficher
      throw error;
    }
  },

  signIn: async (username, password) => {
    const response = await api.post('/auth/sign-in', {
      username,
      password,
    });
    return response.data;
  }
};