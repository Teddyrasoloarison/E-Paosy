export type WalletType = 'CASH' | 'MOBILE_MONEY' | 'BANK' | 'DEBT';

// ✅ Correction : L'API n'accepte que ces deux valeurs pour l'income
export type AutomaticIncomeType = 'NOT_SPECIFIED' | 'MENSUAL';

export interface WalletAutomaticIncome {
  amount: number;
  paymentDay: number;
  type: AutomaticIncomeType; 
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
}

export interface CreateWalletDto {
  name: string;
  description?: string;
  type: WalletType;
  color?: string;
  iconRef?: string;
}

export interface UpdateWalletDto {
  name?: string;
  description?: string;
  type?: WalletType;
  color?: string;
  iconRef?: string;
  isActive?: boolean;
}

// ✅ Doit être identique à WalletAutomaticIncome pour le PUT
// ✅ À corriger comme ceci :
export interface UpdateAutomaticIncomeDto {
  amount: number;
  paymentDay: number;
  type: AutomaticIncomeType;           // On garde le type ici
  haveAutomaticIncome?: boolean;       // On ajoute la propriété sur sa propre ligne
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