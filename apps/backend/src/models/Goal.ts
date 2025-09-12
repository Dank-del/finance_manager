export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface CreateGoalInput {
  title: string;
  description: string;
  targetAmount: number;
  targetDate: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
}