import api from './api';
import { GoalItem, GoalPayload, GoalFilters, GoalResponse } from '../types/goal';

export const goalService = {
  getGoals: async (accountId: string, filters?: GoalFilters): Promise<GoalResponse> => {
    const response = await api.get(`/account/${accountId}/goal`, { params: filters });
    return response.data;
  },

  createGoal: async (accountId: string, walletId: string, payload: GoalPayload): Promise<GoalItem> => {
    const response = await api.post(`/account/${accountId}/wallet/${walletId}/goal`, payload);
    return response.data;
  },

  updateGoal: async (accountId: string, walletId: string, goalId: string, payload: GoalPayload): Promise<GoalItem> => {
    const response = await api.put(`/account/${accountId}/wallet/${walletId}/goal/${goalId}`, payload);
    return response.data;
  },

  archiveGoal: async (accountId: string, walletId: string, goalId: string): Promise<void> => {
    await api.post(`/account/${accountId}/wallet/${walletId}/goal/${goalId}/archive`);
  }
};