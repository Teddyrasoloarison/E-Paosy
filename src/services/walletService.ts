import api from './api';
import { WalletResponse, Wallet, CreateWalletDto } from '../types/wallet';

export const walletService = {
  // GET /account/{accountId}/wallet
  getWallets: async (accountId: string): Promise<WalletResponse> => {
    const response = await api.get(`/account/${accountId}/wallet`);
    return response.data;
  },

  // GET /account/{accountId}/wallet/{walletId}
  getWalletById: async (accountId: string, walletId: string): Promise<Wallet> => {
    const response = await api.get(`/account/${accountId}/wallet/${walletId}`);
    return response.data;
  },

  // POST /account/{accountId}/wallet
  createWallet: async (accountId: string, walletData: CreateWalletDto): Promise<Wallet> => {
    const response = await api.post(`/account/${accountId}/wallet`, walletData);
    return response.data;
  },
};