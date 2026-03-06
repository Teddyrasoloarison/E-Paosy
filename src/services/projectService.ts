import api from './api';
import { Project, CreateProjectDto, UpdateProjectDto, ProjectResponse, ProjectStatistics, ProjectTransaction, CreateProjectTransactionDto, UpdateProjectTransactionDto } from '../types/project';

export const projectService = {
  // GET : Récupérer tous les projets
  getProjects: async (accountId: string, page?: number, pageSize?: number, name?: string, isArchived?: boolean): Promise<ProjectResponse> => {
    const response = await api.get(`/account/${accountId}/project`, {
      params: { page, pageSize, name, isArchived },
    });
    
    // Backend returns just an array, so we need to wrap it with pagination metadata
    const data = response.data;
    
    // If backend returns array directly (current behavior), transform it
    if (Array.isArray(data)) {
      return {
        pagination: {
          totalPage: 1,
          page: page || 1,
          hasNext: false,
          hasPrev: false,
        },
        values: data,
      };
    }
    
    // If already in correct format, return as is
    return data;
  },

  // GET : Récupérer un projet spécifique
  getProjectById: async (accountId: string, projectId: string): Promise<Project> => {
    const response = await api.get(`/account/${accountId}/project/${projectId}`);
    return response.data;
  },

  // POST : Création d'un nouveau projet
  createProject: async (accountId: string, projectData: CreateProjectDto): Promise<Project> => {
    const response = await api.post(`/account/${accountId}/project`, projectData);
    return response.data;
  },

  // PUT : Mise à jour d'un projet
  updateProject: async (accountId: string, projectId: string, projectData: UpdateProjectDto): Promise<Project> => {
    const response = await api.put(`/account/${accountId}/project/${projectId}`, projectData);
    return response.data;
  },

  // DELETE : Supprimer un projet
  deleteProject: async (accountId: string, projectId: string): Promise<void> => {
    await api.delete(`/account/${accountId}/project/${projectId}`);
  },

  // POST : Archiver un projet
  archiveProject: async (accountId: string, projectId: string): Promise<Project> => {
    const response = await api.post(`/account/${accountId}/project/${projectId}/archive`);
    return response.data;
  },

  // GET : Récupérer les statistiques d'un projet
  getProjectStatistics: async (accountId: string, projectId: string): Promise<ProjectStatistics> => {
    const response = await api.get(`/account/${accountId}/project/${projectId}/statistics`);
    return response.data;
  },

  // ========== PROJECT TRANSACTIONS ==========

  // GET : Récupérer toutes les transactions d'un projet
  getProjectTransactions: async (accountId: string, projectId: string): Promise<ProjectTransaction[]> => {
    const response = await api.get(`/account/${accountId}/project/${projectId}/transaction`);
    return response.data;
  },

  // GET : Récupérer une transaction spécifique d'un projet
  getProjectTransactionById: async (accountId: string, projectId: string, transactionId: string): Promise<ProjectTransaction> => {
    const response = await api.get(`/account/${accountId}/project/${projectId}/transaction/${transactionId}`);
    return response.data;
  },

  // POST : Créer une transaction pour un projet
  createProjectTransaction: async (accountId: string, projectId: string, transactionData: CreateProjectTransactionDto): Promise<ProjectTransaction> => {
    const response = await api.post(`/account/${accountId}/project/${projectId}/transaction`, transactionData);
    return response.data;
  },

  // PUT : Mettre à jour une transaction d'un projet
  updateProjectTransaction: async (accountId: string, projectId: string, transactionId: string, transactionData: UpdateProjectTransactionDto): Promise<ProjectTransaction> => {
    const response = await api.put(`/account/${accountId}/project/${projectId}/transaction/${transactionId}`, transactionData);
    return response.data;
  },

  // DELETE : Supprimer une transaction d'un projet
  deleteProjectTransaction: async (accountId: string, projectId: string, transactionId: string): Promise<void> => {
    await api.delete(`/account/${accountId}/project/${projectId}/transaction/${transactionId}`);
  },

  // ========== PDF DOWNLOAD ==========

  // GET : Télécharger les statistiques en PDF
  downloadStatisticsPDF: async (accountId: string, projectId: string): Promise<ArrayBuffer> => {
    const response = await api.get(`/account/${accountId}/project/${projectId}/pdf/statistics`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  // GET : Télécharger la facture en PDF
  downloadInvoicePDF: async (accountId: string, projectId: string): Promise<ArrayBuffer> => {
    const response = await api.get(`/account/${accountId}/project/${projectId}/pdf/invoice`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  // GET : Télécharger le résumé en PDF
  downloadSummaryPDF: async (accountId: string, projectId: string): Promise<ArrayBuffer> => {
    const response = await api.get(`/account/${accountId}/project/${projectId}/pdf/summary`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },
};
