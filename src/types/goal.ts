export interface GoalItem {
  amount: number;
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number; // Montant actuel épargnes pour cet objectif
  isCompleted: boolean; // Whether the goal has been completed
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
  targetAmount: number;
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
