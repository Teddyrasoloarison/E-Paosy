export interface Project {
  id: string;
  name: string;
  description: string;
  initialBudget: number;
  accountId: string;
  color?: string;
  iconRef?: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  initialBudget?: number;
  color?: string;
  iconRef?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  initialBudget?: number;
  color?: string;
  iconRef?: string;
  isArchived?: boolean;
}

export interface ProjectStatistics {
  project?: Project;
  totalEstimatedCost: number;
  totalRealCost: number;
  remainingBudget: number;
  transactionCount: number;
}

export interface ProjectResponse {
  pagination: {
    totalPage: number;
    page: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  values: Project[];
}

// Project Transaction types
export interface ProjectTransaction {
  id: string;
  projectId: string;
  accountId: string;
  name: string;
  description: string;
  estimatedCost: number;
  realCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectTransactionDto {
  name: string;
  description?: string;
  estimatedCost: number;
  realCost?: number;
}

export interface UpdateProjectTransactionDto {
  name?: string;
  description?: string;
  estimatedCost?: number;
  realCost?: number;
}
