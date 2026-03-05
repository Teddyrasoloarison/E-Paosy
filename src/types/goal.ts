export interface Goal {
  id: string;
  name: string;
  amount: number;
  walletId: string;
  startingDate: string; // ISO String
  endingDate: string;   // ISO String
}

export interface CreateGoalDto {
  name: string;
  amount: number;
  walletId: string;
  startingDate: string;
  endingDate: string;
}

export interface GoalResponse {
  pagination: {
    totalPage: number;
    page: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  values: Goal[];
}