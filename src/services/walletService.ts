import api from './api';
import { 
  WalletResponse, 
  Wallet, 
  CreateWalletDto, 
  UpdateWalletDto, 
  UpdateAutomaticIncomeDto 
} from '../types/wallet';

export const walletService = {
  // GET : Récupérer tous les wallets
  getWallets: async (accountId: string): Promise<WalletResponse> => {
    const response = await api.get(`/account/${accountId}/wallet`);
    return response.data;
  },

  // GET : Récupérer un wallet spécifique
  getWalletById: async (accountId: string, walletId: string): Promise<Wallet> => {
    const response = await api.get(`/account/${accountId}/wallet/${walletId}`);
    return response.data;
  },

  // POST : Création d'un nouveau wallet
  createWallet: async (accountId: string, walletData: CreateWalletDto): Promise<Wallet> => {
    const response = await api.post(`/account/${accountId}/wallet`, walletData);
    return response.data;
  },

  // PUT : Mise à jour des infos de base (name, type, description)
  updateWallet: async (accountId: string, walletId: string, walletData: UpdateWalletDto): Promise<Wallet> => {
    const response = await api.put(`/account/${accountId}/wallet/${walletId}`, walletData);
    return response.data;
  },

  // PUT : Mise à jour du revenu automatique (spécifique)
  updateAutomaticIncome: async (
    accountId: string, 
    walletId: string, 
    incomeData: UpdateAutomaticIncomeDto
  ): Promise<Wallet> => {
    // Note: incomeData doit être { type: 'MENSUAL', amount: X, paymentDay: Y }
    const response = await api.put(`/account/${accountId}/wallet/${walletId}/automaticIncome`, incomeData);
    return response.data;
  },
};