import { query } from '../database/connection';
import type { UserPreference, CreateUserPreferenceInput, UpdateUserPreferenceInput } from '../models/UserPreference';

export class UserPreferenceService {
  async getByUserId(userId: string): Promise<UserPreference | null> {
    const result = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const pref = result.rows[0];
    return {
      id: pref.id,
      userId: pref.user_id,
      currency: pref.currency,
      theme: pref.theme,
      createdAt: pref.created_at,
      updatedAt: pref.updated_at
    };
  }

  async create(userId: string, data: CreateUserPreferenceInput): Promise<UserPreference> {
    const result = await query(`
      INSERT INTO user_preferences (user_id, currency, theme)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, data.currency, data.theme]);

    const pref = result.rows[0];
    return {
      id: pref.id,
      userId: pref.user_id,
      currency: pref.currency,
      theme: pref.theme,
      createdAt: pref.created_at,
      updatedAt: pref.updated_at
    };
  }

  async update(userId: string, data: UpdateUserPreferenceInput): Promise<UserPreference | null> {
    const fields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    
    if (fields.length === 0) {
      return this.getByUserId(userId);
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map(field => data[field as keyof typeof data]);

    const result = await query(`
      UPDATE user_preferences
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `, [userId, ...values]);

    if (result.rows.length === 0) {
      return null;
    }

    const pref = result.rows[0];
    return {
      id: pref.id,
      userId: pref.user_id,
      currency: pref.currency,
      theme: pref.theme,
      createdAt: pref.created_at,
      updatedAt: pref.updated_at
    };
  }

  async upsert(userId: string, data: CreateUserPreferenceInput): Promise<UserPreference> {
    const existing = await this.getByUserId(userId);
    
    if (existing) {
      return this.update(userId, data) as Promise<UserPreference>;
    } else {
      return this.create(userId, data);
    }
  }
}