export interface GoalItem {
  id: string;
  name: string;
  amount: number;
  currentAmount: number; // Montant actuel épargné pour cet objectif
  startingDate: string;
  endingDate: string;
  color: string;
  iconRef: string;
  walletId: string;
  accountId: string;
  createdAt?: string;
}

export interface GoalPayload {
  name: string;
  amount: number;
  startingDate: string;
  endingDate: string;
  color: string;
  iconRef: string;
  walletId: string;
  accountId: string;
}

export interface GoalFilters {
  walletId?: string;
  name?: string;
  minAmount?: number;
  maxAmount?: number;
  startingDateBeginning?: string;
  startingDateEnding?: string;
  endingDateBeginning?: string;
  endingDateEnding?: string;
  sort?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  status?: 'in_progress' | 'completed' | 'expired';
}

export interface GoalResponse {
  values: GoalItem[];
}
