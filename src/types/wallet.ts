export type WalletType = 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'DEBT';

// Interface pour les revenus automatiques (vu dans ton log API)
export interface WalletAutomaticIncome {
  amount: number;
  paymentDay: number;
  type: string;
}

// Ce que l'on reçoit du serveur (Modèle réel de l'API)
export interface Wallet {
  id: string;
  name: string;
  description: string;
  type: WalletType;
  amount: number;       // Corrigé : l'API utilise 'amount'
  accountId: string;
  isActive: boolean;
  walletAutomaticIncome?: WalletAutomaticIncome;
}

// Ce que l'on envoie au serveur (Le DTO pour le POST)
export interface CreateWalletDto {
  name: string;
  description?: string;
  type: WalletType;
}

// Structure de la réponse paginée
export interface WalletResponse {
  pagination: {
    totalPage: number;
    page: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  values: Wallet[];
}