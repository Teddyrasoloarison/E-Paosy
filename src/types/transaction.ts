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

// 🟢 Mis à jour pour correspondre à l'attente du Backend (objets pour les labels)
export interface TransactionPayload {
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  labels: { id: string }[]; // On envoie des objets avec ID
  walletId: string;         // Requis dans le body selon Swagger
  accountId: string;        // Requis dans le body selon Swagger
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

// Ce que React Hook Form manipule localement
export interface TransactionFormData {
  description: string;
  amount: number;
  type: TransactionType;
  date: string | Date;
  walletId: string;
  labels: string[]; // Le formulaire garde des strings pour la sélection
}