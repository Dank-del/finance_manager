export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  isRecurring: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: Date;
}

export interface CreateTransactionInput {
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: Date;
  isRecurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: Date;
}

export interface UpdateTransactionInput {
  amount?: number;
  type?: 'income' | 'expense';
  categoryId?: string;
  description?: string;
  date?: Date;
  isRecurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: Date;
}