export type WalletType = 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'DEBT';

// Type de fréquence pour les versements automatiques
// Both frontend and backend use: NOT_SPECIFIED, DAILY, MENSUAL, YEARLY
export type AutomaticIncomeFrequencyType = 'NOT_SPECIFIED' | 'DAILY' | 'MENSUAL' | 'YEARLY';

export interface WalletAutomaticIncome {
  amount: number;
  paymentDay: number;
  type: AutomaticIncomeFrequencyType;
}

export interface Wallet {
  id: string;
  name: string;
  description: string;
  type: WalletType;
  amount: number;
  accountId: string;
  isActive: boolean;
  walletAutomaticIncome?: WalletAutomaticIncome;
  color?: string;
  iconRef?: string;
  createdAt?: string;
}

export interface CreateWalletDto {
  name: string;
  description?: string;
  type: WalletType;
  color?: string;
  iconRef?: string;
  walletAutomaticIncome?: WalletAutomaticIncome;
}

export interface UpdateWalletDto {
  name?: string;
  description?: string;
  type?: WalletType;
  color?: string;
  iconRef?: string;
  isActive?: boolean;
  walletAutomaticIncome?: WalletAutomaticIncome;
}

// DTO pour les versements automatiques
export interface UpdateAutomaticIncomeDto {
  amount: number;
  paymentDay: number;
  type: AutomaticIncomeFrequencyType;
  haveAutomaticIncome?: boolean;
}
export interface WalletResponse {
  pagination: {
    totalPage: number;
    page: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  values: Wallet[];
}

export interface WalletStatistics {
  wallet?: Wallet;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}
