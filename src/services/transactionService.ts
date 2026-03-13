import {
  PaginatedTransactions,
  TransactionFilters,
  TransactionPayload,
} from "../types/transaction";
import api from "./api";

export const transactionService = {
  // GET avec tous les filtres du Swagger et pagination
  getTransactions: async (
    accountId: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedTransactions> => {
    try {
      // console.log("transactionService.getTransactions - calling API with:", { accountId, filters });
      
      // Ensure pagination params are integers (double safety)
      const params = {
        ...filters,
        page: filters?.page ? Number(filters.page) : 1,
        pageSize: filters?.pageSize ? Number(filters.pageSize) : 10,
      };
      
      const response = await api.get(`/account/${accountId}/transaction`, {
        params,
      });
      // console.log("transactionService.getTransactions - response:", response.data);
      return response.data;
    } catch (error: any) {
      // console.error("transactionService.getTransactions - error:", error.response?.data || error.message);
      throw error;
    }
  },

  // services/transactionService.ts
  createTransaction: async (
    accountId: string,
    walletId: string,
    payload: TransactionPayload,
  ) => {
    // On s'assure que l'objet envoyé contient TOUT ce que le Swagger demande
    const fullPayload = {
      ...payload,
      walletId: walletId, // Requis dans le body selon ton Swagger
      accountId: accountId, // Requis dans le body selon ton Swagger
    };

    const response = await api.post(
      `/account/${accountId}/wallet/${walletId}/transaction`,
      fullPayload,
    );
    return response.data;
  },

  deleteTransaction: async (
    accountId: string,
    walletId: string,
    transactionId: string,
  ) => {
    await api.delete(
      `/account/${accountId}/wallet/${walletId}/transaction/${transactionId}`,
    );
  },

  updateTransaction: async (
    accountId: string,
    walletId: string,
    transactionId: string,
    payload: TransactionPayload,
  ) => {
    // Ensure type is normalized to 'IN' or 'OUT' (trim + uppercase)
    const normalizedPayload = {
      ...payload,
      type:
        String(payload.type || "")
          .trim()
          .toUpperCase() === "IN"
          ? "IN"
          : "OUT",
    } as TransactionPayload;

    // Debug log to help trace issues when editing transactions
    console.log(
      "transactionService.updateTransaction -> sending payload:",
      normalizedPayload,
    );

    const response = await api.put(
      `/account/${accountId}/wallet/${walletId}/transaction/${transactionId}`,
      normalizedPayload,
    );
    return response.data;
  },
};
