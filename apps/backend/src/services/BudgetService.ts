import { query } from '../database/connection';
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '../models/Budget';

export class BudgetService {
  async create(userId: string, data: CreateBudgetInput): Promise<Budget> {
    const { categoryId, amount, period, startDate, endDate, alertThreshold = 80 } = data;

    const result = await query(`
      INSERT INTO budgets (
        user_id, category_id, amount, period, start_date, end_date, alert_threshold
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, categoryId, amount, period, startDate, endDate, alertThreshold]);

    return this.mapBudget(result.rows[0]);
  }

  async getAll(userId: string): Promise<Budget[]> {
    const result = await query(`
      SELECT b.*, c.name as category_name
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = $1 AND b.is_active = true
      ORDER BY b.created_at DESC
    `, [userId]);

    return result.rows.map(this.mapBudget);
  }

  async getById(userId: string, id: string): Promise<Budget | null> {
    const result = await query(`
      SELECT b.*, c.name as category_name
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [id, userId]);

    return result.rows.length > 0 ? this.mapBudget(result.rows[0]) : null;
  }

  async update(userId: string, id: string, data: UpdateBudgetInput): Promise<Budget | null> {
    const fields = Object.keys(data).filter(key => data[key as keyof UpdateBudgetInput] !== undefined);
    
    if (fields.length === 0) {
      return this.getById(userId, id);
    }

    const setClause = fields.map((field, index) => `${this.mapFieldName(field)} = $${index + 3}`).join(', ');
    const values = fields.map(field => data[field as keyof UpdateBudgetInput]);

    const result = await query(`
      UPDATE budgets
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, userId, ...values]);

    return result.rows.length > 0 ? this.mapBudget(result.rows[0]) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  async updateSpent(userId: string, categoryId: string): Promise<void> {
    await query(`
      UPDATE budgets 
      SET spent = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM transactions 
        WHERE user_id = $1 
          AND category_id = $2 
          AND type = 'expense'
          AND date >= budgets.start_date 
          AND date <= budgets.end_date
      )
      WHERE user_id = $1 AND category_id = $2 AND is_active = true
    `, [userId, categoryId]);
  }

  private mapBudget(row: any): Budget {
    return {
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      amount: parseFloat(row.amount),
      spent: parseFloat(row.spent || 0),
      period: row.period,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      alertThreshold: parseFloat(row.alert_threshold),
      isActive: row.is_active
    };
  }

  private mapFieldName(field: string): string {
    const fieldMap: Record<string, string> = {
      categoryId: 'category_id',
      startDate: 'start_date',
      endDate: 'end_date',
      alertThreshold: 'alert_threshold',
      isActive: 'is_active'
    };
    return fieldMap[field] || field;
  }
}