import api from './api';

export interface LabelItem {
  id: string;
  name: string;
  color: string;
  iconRef?: string | null;
}

export interface LabelPayload {
  name: string;
  color: string;
  iconRef?: string | null;
}

export interface PaginationResult {
  totalPage: number;
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LabelListResponse {
  pagination: PaginationResult;
  values: LabelItem[];
}

interface ApiErrorBody {
  code?: number;
  message?: string;
}

const normalizeApiError = (data: unknown) => {
  if (!data || typeof data !== 'object') {
    return;
  }

  const body = data as ApiErrorBody;
  if (typeof body.code === 'number' && typeof body.message === 'string') {
    throw new Error(body.message);
  }
};

export const labelService = {
  getAll: async (accountId: string, page = 1, pageSize = 10, name?: string): Promise<LabelListResponse> => {
    const response = await api.get(`/account/${accountId}/label`, {
      params: { page, pageSize, ...(name ? { name } : {}) },
    });
    normalizeApiError(response.data);
    return response.data;
  },

  createOne: async (accountId: string, payload: LabelPayload): Promise<LabelItem> => {
    const response = await api.post(`/account/${accountId}/label`, payload);
    normalizeApiError(response.data);
    return response.data;
  },

  updateOne: async (accountId: string, labelId: string, payload: LabelPayload): Promise<LabelItem> => {
    const response = await api.put(`/account/${accountId}/label/${labelId}`, payload);
    normalizeApiError(response.data);
    return response.data;
  },

  archiveOne: async (accountId: string, labelId: string): Promise<LabelItem> => {
    const response = await api.post(`/account/${accountId}/label/${labelId}/archive`);
    normalizeApiError(response.data);
    return response.data;
  },
};
