export interface LabelItem {
  id: string;
  name: string;
  color: string;
  iconRef?: string | null;
}

export interface LabelPayload {
  name: string;
  color: string;
  iconRef?: string | null;
}

export interface LabelResponse {
  pagination: {
    totalPage: number;
    page: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  values: LabelItem[];
}

// Pour React Hook Form / Zod
export type LabelFormData = LabelPayload;