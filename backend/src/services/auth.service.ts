import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../config/database';
import { env } from '../config/env';
import { User, Wallet, UserRole } from '../types';
import { AppError } from '../middleware/error.middleware';

interface RegisterInput {
  email: string;
  username: string;
  fullName: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthPayload {
  user: Omit<User, 'password_hash'>;
  token: string;
  wallet: Wallet;
}

interface JwtPayload {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export class AuthService {
  private static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  static async register(input: RegisterInput): Promise<AuthPayload> {
    const { email, username, fullName, password } = input;

    const existingUsers = await query<User>(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      throw new AppError('Email or username already in use', 409);
    }

    const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const userId = uuidv4();

      const userResult = await client.query(
        `INSERT INTO users (id, email, username, full_name, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, 'USER')
         RETURNING id, email, username, full_name, avatar_url, is_verified, role, created_at, updated_at`,
        [userId, email.toLowerCase(), username.toLowerCase(), fullName, passwordHash]
      );

      const walletResult = await client.query(
        `INSERT INTO wallets (user_id, balance, total_deposited)
         VALUES ($1, 1000000.00, 1000000.00)
         RETURNING *`,
        [userId]
      );

      await client.query(
        `INSERT INTO leaderboard (user_id, portfolio_value)
         VALUES ($1, 1000000.00)`,
        [userId]
      );

      await client.query('COMMIT');

      const user = userResult.rows[0] as User;
      const wallet = walletResult.rows[0] as Wallet;

      const token = this.generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      });

      return { user, token, wallet };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async login(input: LoginInput): Promise<AuthPayload> {
    const { email, password } = input;

    const users = await query<User & { password_hash: string }>(
      `SELECT id, email, username, full_name, avatar_url, is_verified,
              password_hash, role, created_at, updated_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = users[0];

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const wallets = await query<Wallet>(
      'SELECT * FROM wallets WHERE user_id = $1',
      [user.id]
    );

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
      wallet: wallets[0],
    };
  }

  static async getMe(userId: string): Promise<{ user: User; wallet: Wallet }> {
    const users = await query<User>(
      `SELECT id, email, username, full_name, avatar_url, is_verified, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    const wallets = await query<Wallet>(
      'SELECT * FROM wallets WHERE user_id = $1',
      [userId]
    );

    return { user: users[0], wallet: wallets[0] };
  }

  static async updateProfile(
    userId: string,
    updates: { fullName?: string; avatarUrl?: string }
  ): Promise<User> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.fullName) {
      fields.push(`full_name = $${paramIndex++}`);
      values.push(updates.fullName);
    }

    if (updates.avatarUrl) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(updates.avatarUrl);
    }

    if (fields.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query<User>(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, username, full_name, avatar_url, is_verified, role, created_at, updated_at`,
      values
    );

    return result[0];
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const users = await query<{ password_hash: string | null }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    if (!users[0].password_hash) {
      throw new AppError(
        'Password login is not enabled for this account. Please use Google login.',
        400
      );
    }

    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const newHash = await bcrypt.hash(newPassword, env.bcryptRounds);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, userId]
    );
  }
}