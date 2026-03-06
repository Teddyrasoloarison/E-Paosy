export type TransactionType = 'IN' | 'OUT';

export interface TransactionItem {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  walletId: string;
  accountId: string;
  goalId?: string | null;   // ID de l'objectif lié (pour épargner vers un objectif)
  createdAt?: string | null;
  labels: { id: string; name: string; color: string; iconRef?: string | null }[];
}

// 🟢 Mis à jour pour correspondre à l'attente du Backend (objets pour les labels)
export interface TransactionPayload {
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  labels: { id: string }[]; // On envoie des objets avec ID
  walletId: string;         // Requis dans le body selon Swagger
  accountId: string;        // Requis dans le body selon Swagger
  goalId?: string;          // ID de l'objectif lié (optionnel)
}

export interface TransactionFilters {
  walletId?: string;
  startingDate?: string;
  endingDate?: string;
  type?: TransactionType;
  label?: string[];
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sort?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Response type for paginated transactions
export interface PaginatedTransactions {
  data: TransactionItem[];
  total: number;
}

// Ce que React Hook Form manipule localement
export interface TransactionFormData {
  description: string;
  amount: number;
  type: TransactionType;
  date: string | Date;
  walletId: string;
  labels: string; // Un seul label (ou chaîne vide si aucun)
  goalId?: string; // Objectif lié (optionnel)
}
