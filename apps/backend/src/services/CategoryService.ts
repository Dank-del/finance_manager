import { query } from '../database/connection';
import type { Category, CreateCategoryInput } from '../models/Category';

export class CategoryService {
  async getAll(userId?: string): Promise<Category[]> {
    let whereClause = 'WHERE is_default = true';
    const params: any[] = [];

    if (userId) {
      whereClause += ' OR user_id = $1';
      params.push(userId);
    }

    const result = await query(`
      SELECT * FROM categories ${whereClause}
      ORDER BY name ASC
    `, params);

    return result.rows.map(this.mapCategory);
  }

  async getById(id: string, userId?: string): Promise<Category | null> {
    let whereClause = 'WHERE id = $1 AND (is_default = true';
    const params: any[] = [id];

    if (userId) {
      whereClause += ' OR user_id = $2)';
      params.push(userId);
    } else {
      whereClause += ')';
    }

    const result = await query(`
      SELECT * FROM categories ${whereClause}
    `, params);

    return result.rows.length > 0 ? this.mapCategory(result.rows[0]) : null;
  }

  async getByType(type: 'income' | 'expense', userId?: string): Promise<Category[]> {
    let whereClause = 'WHERE type = $1 AND (is_default = true';
    const params: any[] = [type];

    if (userId) {
      whereClause += ' OR user_id = $2)';
      params.push(userId);
    } else {
      whereClause += ')';
    }

    const result = await query(`
      SELECT * FROM categories ${whereClause}
      ORDER BY name ASC
    `, params);

    return result.rows.map(this.mapCategory);
  }

  async findByName(name: string, userId: string, type: 'income' | 'expense'): Promise<Category | null> {
    const result = await query(`
      SELECT * FROM categories 
      WHERE LOWER(name) = LOWER($1) AND type = $2 AND (is_default = true OR user_id = $3)
    `, [name, type, userId]);

    return result.rows.length > 0 ? this.mapCategory(result.rows[0]) : null;
  }

  async create(userId: string, data: CreateCategoryInput): Promise<Category> {
    const { name, type, color, icon } = data;

    const result = await query(`
      INSERT INTO categories (name, type, color, icon, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, type, color, icon, userId]);

    return this.mapCategory(result.rows[0]);
  }

  async update(id: string, userId: string, data: Partial<CreateCategoryInput>): Promise<Category | null> {
    const fields = Object.keys(data).filter(key => data[key as keyof CreateCategoryInput] !== undefined);
    
    if (fields.length === 0) {
      return this.getById(id, userId);
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
    const values = fields.map(field => data[field as keyof CreateCategoryInput]);

    const result = await query(`
      UPDATE categories
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND is_default = false
      RETURNING *
    `, [id, userId, ...values]);

    return result.rows.length > 0 ? this.mapCategory(result.rows[0]) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await query(`
      DELETE FROM categories 
      WHERE id = $1 AND user_id = $2 AND is_default = false
    `, [id, userId]);

    return (result.rowCount ?? 0) > 0;
  }

  async hasTransactions(categoryId: string): Promise<boolean> {
    const result = await query(`
      SELECT COUNT(*) as count FROM transactions WHERE category_id = $1
    `, [categoryId]);

    return parseInt(result.rows[0].count) > 0;
  }

  async getUsageStats(userId: string): Promise<any[]> {
    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.type,
        c.color,
        c.icon,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_amount
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = $1
      WHERE c.is_default = true OR c.user_id = $1
      GROUP BY c.id, c.name, c.type, c.color, c.icon
      ORDER BY transaction_count DESC, c.name ASC
    `, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      color: row.color,
      icon: row.icon,
      transactionCount: parseInt(row.transaction_count),
      totalAmount: parseFloat(row.total_amount)
    }));
  }

  private mapCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      color: row.color,
      icon: row.icon,
      isDefault: row.is_default,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    };
  }
}