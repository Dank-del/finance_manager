export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  isDefault: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt?: Date; // optional because defaults table definition may not include updated_at
}

export interface CreateCategoryInput {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}