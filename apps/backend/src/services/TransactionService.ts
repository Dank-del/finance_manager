import { query } from '../database/connection';
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../models/Transaction';

interface TransactionFilters {
  page: number;
  limit: number;
  type?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  categoryBreakdown: Array<{ category: string; amount: number; type: string }>;
}

export class TransactionService {
  async create(userId: string, data: CreateTransactionInput): Promise<Transaction> {
    const {
      amount,
      type,
      categoryId,
      description,
      date,
      isRecurring = false,
      recurringPeriod,
      recurringEndDate
    } = data;

    const result = await query(`
      INSERT INTO transactions (
        user_id, amount, type, category_id, description, date,
        is_recurring, recurring_period, recurring_end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      userId, amount, type, categoryId, description, date,
      isRecurring, recurringPeriod, recurringEndDate
    ]);

    return this.mapTransaction(result.rows[0]);
  }

  async getAll(userId: string, filters: TransactionFilters): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page, limit, type, categoryId, startDate, endDate } = filters;
    const offset = (page - 1) * limit;

    // Use table alias for transactions when joining to avoid ambiguous column references
    // We'll build two where clauses: one for the count (no alias) and one for the data query (with alias)
    let baseWhere = 'WHERE user_id = $1';
    const params: any[] = [userId];
    let paramCount = 1;

    if (type) {
      baseWhere += ` AND type = $${++paramCount}`;
      params.push(type);
    }

    if (categoryId) {
      baseWhere += ` AND category_id = $${++paramCount}`;
      params.push(categoryId);
    }

    if (startDate) {
      baseWhere += ` AND date >= $${++paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      baseWhere += ` AND date <= $${++paramCount}`;
      params.push(endDate);
    }

    const countResult = await query(`
      SELECT COUNT(*) as total FROM transactions ${baseWhere}
    `, params);

    const total = parseInt(countResult.rows[0].total);

    // Derive alias-qualified where clause for main select
    const aliasedWhere = baseWhere
      .replace(/\buser_id\b/g, 't.user_id')
      .replace(/\btype\b/g, 't.type')
      .replace(/\bcategory_id\b/g, 't.category_id')
      .replace(/\bdate\b/g, 't.date');

    const result = await query(`
      SELECT t.*, c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${aliasedWhere}
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `, [...params, limit, offset]);

    return {
      transactions: result.rows.map(this.mapTransaction),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getById(userId: string, id: string): Promise<Transaction | null> {
    const result = await query(`
      SELECT t.*, c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1 AND t.user_id = $2
    `, [id, userId]);

    return result.rows.length > 0 ? this.mapTransaction(result.rows[0]) : null;
  }

  async update(userId: string, id: string, data: UpdateTransactionInput): Promise<Transaction | null> {
    const fields = Object.keys(data).filter(key => data[key as keyof UpdateTransactionInput] !== undefined);
    
    if (fields.length === 0) {
      return this.getById(userId, id);
    }

    const setClause = fields.map((field, index) => `${this.mapFieldName(field)} = $${index + 3}`).join(', ');
    const values = fields.map(field => data[field as keyof UpdateTransactionInput]);

    const result = await query(`
      UPDATE transactions
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, userId, ...values]);

    return result.rows.length > 0 ? this.mapTransaction(result.rows[0]) : null;
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  async getStats(userId: string): Promise<TransactionStats> {
    const totalResult = await query(`
      SELECT 
        type,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = $1
      GROUP BY type
    `, [userId]);

    const monthlyResult = await query(`
      SELECT 
        type,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = $1 
        AND date >= DATE_TRUNC('month', CURRENT_DATE)
        AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      GROUP BY type
    `, [userId]);

    const categoryResult = await query(`
      SELECT 
        c.name as category,
        t.type,
        SUM(t.amount) as amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
      GROUP BY c.name, t.type
      ORDER BY amount DESC
    `, [userId]);

    const totals = totalResult.rows.reduce((acc, row) => {
      acc[row.type] = parseFloat(row.total);
      return acc;
    }, { income: 0, expense: 0 });

    const monthly = monthlyResult.rows.reduce((acc, row) => {
      acc[row.type] = parseFloat(row.total);
      return acc;
    }, { income: 0, expense: 0 });

    return {
      totalIncome: totals.income,
      totalExpenses: totals.expense,
      balance: totals.income - totals.expense,
      monthlyIncome: monthly.income,
      monthlyExpenses: monthly.expense,
      categoryBreakdown: categoryResult.rows.map(row => ({
        category: row.category,
        amount: parseFloat(row.amount),
        type: row.type
      }))
    };
  }

  private mapTransaction(row: any): Transaction {
    return {
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      type: row.type,
      categoryId: row.category_id,
      description: row.description,
      date: new Date(row.date),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      isRecurring: row.is_recurring,
      recurringPeriod: row.recurring_period,
      recurringEndDate: row.recurring_end_date ? new Date(row.recurring_end_date) : undefined
    };
  }

  private mapFieldName(field: string): string {
    const fieldMap: Record<string, string> = {
      categoryId: 'category_id',
      isRecurring: 'is_recurring',
      recurringPeriod: 'recurring_period',
      recurringEndDate: 'recurring_end_date'
    };
    return fieldMap[field] || field;
  }
}