export interface UserPreference {
  id: string;
  userId: string;
  currency: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPreferenceInput {
  currency: string;
  theme: string;
}

export interface UpdateUserPreferenceInput {
  currency?: string;
  theme?: string;
}