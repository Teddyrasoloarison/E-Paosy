import api from './api';
import { Goal, GoalResponse, CreateGoalDto } from '../types/goal';

export const goalService = {
  // GET : Liste des objectifs avec filtres optionnels
  getGoals: async (accountId: string, params?: { name?: string; startingDate?: string; endingDate?: string }): Promise<GoalResponse> => {
    const response = await api.get(`/account/${accountId}/goal`, { params });
    return response.data;
  },

  // POST : Créer un objectif
  createGoal: async (accountId: string, goalData: CreateGoalDto): Promise<GoalResponse> => {
    const response = await api.post(`/account/${accountId}/goal`, goalData);
    return response.data;
  },

  // PUT : Modifier un objectif
  updateGoal: async (accountId: string, goalId: string, goalData: Goal): Promise<Goal> => {
    const response = await api.put(`/account/${accountId}/goal/${goalId}`, goalData);
    return response.data;
  },

  // GET : Un seul objectif par ID
  getGoalById: async (accountId: string, goalId: string): Promise<Goal> => {
    const response = await api.get(`/account/${accountId}/goal/${goalId}`);
    return response.data;
  }
};