export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  alertThreshold: number;
  isActive: boolean;
}

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  alertThreshold?: number;
}

export interface UpdateBudgetInput {
  amount?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  alertThreshold?: number;
  isActive?: boolean;
}