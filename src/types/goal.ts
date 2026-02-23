export interface GoalItem {
  id: string;
  name: string;
  amount: number;
  currentAmount: number; // Souvent calculé par le backend
  startingDate: string;
  endingDate: string;
  color: string;
  iconRef: string;
  walletId: string;
  accountId: string;
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
}

export interface GoalResponse {
  pagination: {
    totalPage: number;
    page: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  values: GoalItem[];
}