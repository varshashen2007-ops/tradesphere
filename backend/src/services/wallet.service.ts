import { query, getClient } from '../config/database';
import { Wallet } from '../types';
import { AppError } from '../middleware/error.middleware';

export interface Transaction {
  id: string;
  user_id: string;
  order_id?: string;
  transaction_type: 'DEPOSIT' | 'WITHDRAWAL' | 'BUY' | 'SELL';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: Date;
}

export class WalletService {
  static async getWallet(userId: string): Promise<Wallet> {
    const result = await query<Wallet>(
      'SELECT * FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (result.length === 0) {
      throw new AppError('Wallet not found', 404);
    }

    return result[0];
  }

  static async getTransactionHistory(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const countResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = $1',
      [userId]
    );

    const transactions = await query<Transaction>(
      `SELECT 
        t.*, 
        o.order_type, 
        s.symbol
      FROM transactions t
      LEFT JOIN orders o ON o.id = t.order_id
      LEFT JOIN stocks s ON s.id = o.stock_id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      transactions,
      total: parseInt(countResult[0].count, 10),
    };
  }

  static async debitWallet(
    client: Awaited<ReturnType<typeof getClient>>,
    userId: string,
    amount: number,
    description: string,
    orderId?: string
  ): Promise<Wallet> {
    const walletResult = await client.query(
      'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      throw new AppError('Wallet not found', 404);
    }

    const wallet = walletResult.rows[0] as Wallet;
    const currentBalance = Number(wallet.balance);

    if (currentBalance < amount) {
      throw new AppError(
        `Insufficient funds. Available: ₹${currentBalance.toLocaleString('en-IN')}`,
        400
      );
    }

    const newBalance = Number((currentBalance - amount).toFixed(2));

    await client.query(
      `UPDATE wallets
       SET balance = $1, updated_at = NOW()
       WHERE user_id = $2`,
      [newBalance, userId]
    );

    await client.query(
      `INSERT INTO transactions
       (user_id, order_id, transaction_type, amount, balance_before, balance_after, description)
       VALUES ($1, $2, 'BUY', $3, $4, $5, $6)`,
      [userId, orderId ?? null, amount, currentBalance, newBalance, description]
    );

    return {
      ...wallet,
      balance: newBalance,
    };
  }

  static async creditWallet(
    client: Awaited<ReturnType<typeof getClient>>,
    userId: string,
    amount: number,
    description: string,
    orderId?: string
  ): Promise<Wallet> {
    const walletResult = await client.query(
      'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      throw new AppError('Wallet not found', 404);
    }

    const wallet = walletResult.rows[0] as Wallet;
    const currentBalance = Number(wallet.balance);
    const newBalance = Number((currentBalance + amount).toFixed(2));

    await client.query(
      `UPDATE wallets
       SET balance = $1, updated_at = NOW()
       WHERE user_id = $2`,
      [newBalance, userId]
    );

    await client.query(
      `INSERT INTO transactions
       (user_id, order_id, transaction_type, amount, balance_before, balance_after, description)
       VALUES ($1, $2, 'SELL', $3, $4, $5, $6)`,
      [userId, orderId ?? null, amount, currentBalance, newBalance, description]
    );

    return {
      ...wallet,
      balance: newBalance,
    };
  }
}