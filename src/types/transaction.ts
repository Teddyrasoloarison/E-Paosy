export type TransactionType = 'IN' | 'OUT';

export interface TransactionItem {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  walletId: string;
  accountId: string;
  labels: { id: string; name: string; color: string }[];
}

export interface TransactionPayload {
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  labels: string[]; // IDs des labels
}

export interface TransactionFilters {
  walletId?: string;
  startingDate?: string;
  endingDate?: string;
  type?: TransactionType;
  label?: string[];
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount';
  sort?: 'asc' | 'desc';
}

export interface TransactionFormData {
  description: string;
  amount: number;
  type: TransactionType;
  date: string | Date;
  walletId: string;
  labels: string[];
}