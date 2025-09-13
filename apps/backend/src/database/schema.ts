export const createTables = async () => {
  const { query } = await import('./connection');
  
  await query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      reset_token VARCHAR(255),
      reset_token_expiry TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
      color VARCHAR(7) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(12, 2) NOT NULL,
      type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
      category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      description TEXT,
      date DATE NOT NULL,
      is_recurring BOOLEAN DEFAULT FALSE,
      recurring_period VARCHAR(10) CHECK (recurring_period IN ('daily', 'weekly', 'monthly', 'yearly')),
      recurring_end_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS budgets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      amount DECIMAL(12, 2) NOT NULL,
      spent DECIMAL(12, 2) DEFAULT 0,
      period VARCHAR(10) CHECK (period IN ('weekly', 'monthly', 'yearly')) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      alert_threshold DECIMAL(5, 2) DEFAULT 80,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS goals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      target_amount DECIMAL(12, 2) NOT NULL,
      current_amount DECIMAL(12, 2) DEFAULT 0,
      target_date DATE NOT NULL,
      priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
    CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
    CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      currency VARCHAR(3) DEFAULT 'USD',
      theme VARCHAR(10) DEFAULT 'light',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
  `);

  await insertDefaultCategories();
};

const insertDefaultCategories = async () => {
  const { query } = await import('./connection');
  
  const existingDefaults = await query(`
    SELECT COUNT(*) as count FROM categories WHERE is_default = true
  `);
  
  if (existingDefaults.rows[0].count > 0) {
    return;
  }
  
  const defaultCategories = [
    { name: 'Salary', type: 'income', color: '#10b981', icon: '💰' },
    { name: 'Investment', type: 'income', color: '#3b82f6', icon: '📈' },
    { name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: '🍕' },
    { name: 'Transportation', type: 'expense', color: '#f59e0b', icon: '🚗' },
    { name: 'Utilities', type: 'expense', color: '#8b5cf6', icon: '⚡' },
    { name: 'Entertainment', type: 'expense', color: '#ec4899', icon: '🎬' },
    { name: 'Healthcare', type: 'expense', color: '#06b6d4', icon: '🏥' },
    { name: 'Shopping', type: 'expense', color: '#84cc16', icon: '🛒' },
  ];

  for (const category of defaultCategories) {
    await query(`
      INSERT INTO categories (name, type, color, icon, is_default)
      VALUES ($1, $2, $3, $4, true)
    `, [category.name, category.type, category.color, category.icon]);
  }
};