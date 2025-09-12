import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../database/connection';
import type { User, CreateUserInput, LoginInput, UserResponse } from '../models/User';

export class AuthService {
  private readonly jwtSecret: string = process.env.JWT_SECRET || 'fallback_secret';
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  async register(userData: CreateUserInput): Promise<{ user: UserResponse; token: string }> {
    const { email, password, firstName, lastName } = userData;
    
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await query(`
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, created_at
    `, [email, hashedPassword, firstName, lastName]);

    const user = result.rows[0];
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      },
      token
    };
  }

  async login(credentials: LoginInput): Promise<{ user: UserResponse; token: string }> {
    const { email, password } = credentials;
    
    const result = await query(
      'SELECT id, email, password, first_name, last_name, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      },
      token
    };
  }

  async requestPasswordReset(email: string): Promise<string> {
    const user = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetToken, resetTokenExpiry, email]
    );

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2',
      [hashedPassword, token]
    );
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const result = await query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at
    };
  }

  private generateToken(userId: string): string {
    const options: jwt.SignOptions = { expiresIn: this.jwtExpiresIn };
    return jwt.sign({ userId }, this.jwtSecret, options);
  }
}