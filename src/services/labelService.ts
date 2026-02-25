import api from './api';
import { LabelResponse, LabelItem, LabelPayload } from '../types/label';

export const labelService = {
  getLabels: async (accountId: string, page = 1, pageSize = 10): Promise<LabelResponse> => {
    const response = await api.get(`/account/${accountId}/label`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  createLabel: async (accountId: string, payload: LabelPayload): Promise<LabelItem> => {
    const response = await api.post(`/account/${accountId}/label`, payload);
    return response.data;
  },

  updateLabel: async (accountId: string, labelId: string, payload: LabelPayload): Promise<LabelItem> => {
    const response = await api.put(`/account/${accountId}/label/${labelId}`, payload);
    return response.data;
  },

  archiveLabel: async (accountId: string, labelId: string): Promise<void> => {
    await api.post(`/account/${accountId}/label/${labelId}/archive`);
  },
};