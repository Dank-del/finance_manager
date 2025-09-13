import { query } from '../database/connection';
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../models/Goal';

export class GoalService {
  async create(userId: string, data: CreateGoalInput): Promise<Goal> {
    const { title, description, targetAmount, targetDate, priority = 'medium' } = data;

    const result = await query(`
      INSERT INTO goals (
        user_id, title, description, target_amount, target_date, priority
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, title, description, targetAmount, targetDate, priority]);

    return this.mapGoal(result.rows[0]);
  }

  async getAll(userId: string): Promise<Goal[]> {
    const result = await query(`
      SELECT * FROM goals
      WHERE user_id = $1
      ORDER BY priority DESC, target_date ASC
    `, [userId]);

    return result.rows.map(this.mapGoal);
  }

  async getById(userId: string, id: string): Promise<Goal | null> {
    const result = await query(`
      SELECT * FROM goals
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    return result.rows.length > 0 ? this.mapGoal(result.rows[0]) : null;
  }

  async update(userId: string, id: string, data: UpdateGoalInput): Promise<Goal | null> {
    const fields = Object.keys(data).filter(key => data[key as keyof UpdateGoalInput] !== undefined);
    
    if (fields.length === 0) {
      return this.getById(userId, id);
    }

    const setClause = fields.map((field, index) => `${this.mapFieldName(field)} = $${index + 3}`).join(', ');
    const values = fields.map(field => data[field as keyof UpdateGoalInput]);

    const result = await query(`
      UPDATE goals
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, userId, ...values]);

    return result.rows.length > 0 ? this.mapGoal(result.rows[0]) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  async addProgress(userId: string, id: string, amount: number): Promise<Goal | null> {
    const result = await query(`
      UPDATE goals
      SET 
        current_amount = current_amount + $3,
        is_completed = (current_amount + $3) >= target_amount,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, userId, amount]);

    return result.rows.length > 0 ? this.mapGoal(result.rows[0]) : null;
  }

  private mapGoal(row: any): Goal {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description || '',
      targetAmount: parseFloat(row.target_amount),
      currentAmount: parseFloat(row.current_amount || 0),
      targetDate: new Date(row.target_date),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      isCompleted: row.is_completed,
      priority: row.priority
    };
  }

  private mapFieldName(field: string): string {
    const fieldMap: Record<string, string> = {
      targetAmount: 'target_amount',
      currentAmount: 'current_amount',
      targetDate: 'target_date',
      isCompleted: 'is_completed'
    };
    return fieldMap[field] || field;
  }
}