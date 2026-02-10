import api from './api';
import { AuthFormData } from '../utils/authSchema';

// Interface pour la réponse du Sign-In (ce que renvoie ton Swagger)
export interface SignInResponse {
  account: {
    id: string;
    username: string;
  };
  token: string;
}

export const authService = {
  // Inscription
  signUp: async (data: AuthFormData) => {
    try {
      const response = await api.post('/auth/sign-up', {
        username: data.username,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Connexion
  signIn: async (data: AuthFormData): Promise<SignInResponse> => {
    try {
      const response = await api.post('/auth/sign-in', {
        username: data.username,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};