import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { ApiResponse } from '../utils/ApiResponse';

export class AdminController {
  static async getDashboard(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM users'
      );

      const orders = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM orders'
      );

      const stocks = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM stocks'
      );

      const wallets = await query<{ total: string }>(
        'SELECT COALESCE(SUM(balance),0) as total FROM wallets'
      );

      const recentUsers = await query(
        `SELECT id, email, username, full_name, role, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 5`
      );

      const recentOrders = await query(
        `SELECT 
           o.id,
           o.order_type,
           o.order_mode,
           o.quantity,
           o.price,
           o.total_value,
           o.status,
           o.created_at,
           u.email,
           u.full_name,
           s.symbol,
           s.company_name
         FROM orders o
         JOIN users u ON u.id = o.user_id
         JOIN stocks s ON s.id = o.stock_id
         ORDER BY o.created_at DESC
         LIMIT 5`
      );

      ApiResponse.success(res, {
        stats: {
          totalUsers: Number(users[0].count),
          totalOrders: Number(orders[0].count),
          totalStocks: Number(stocks[0].count),
          totalWalletBalance: Number(wallets[0].total),
        },
        recentUsers,
        recentOrders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await query(
        `SELECT 
           id,
           email,
           username,
           full_name,
           avatar_url,
           is_verified,
           role,
           created_at,
           updated_at
         FROM users
         ORDER BY created_at DESC`
      );

      ApiResponse.success(res, { users });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['USER', 'ADMIN'].includes(role)) {
        ApiResponse.badRequest(res, 'Invalid role');
        return;
      }

      const result = await query(
        `UPDATE users
         SET role = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, email, username, full_name, role`,
        [role, userId]
      );

      if (result.length === 0) {
        ApiResponse.notFound(res, 'User not found');
        return;
      }

      ApiResponse.success(res, { user: result[0] }, 'User role updated');
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orders = await query(
        `SELECT 
           o.id,
           o.order_type,
           o.order_mode,
           o.quantity,
           o.price,
           o.total_value,
           o.status,
           o.created_at,
           o.executed_at,
           u.email,
           u.full_name,
           s.symbol,
           s.company_name
         FROM orders o
         JOIN users u ON u.id = o.user_id
         JOIN stocks s ON s.id = o.stock_id
         ORDER BY o.created_at DESC`
      );

      ApiResponse.success(res, { orders });
    } catch (error) {
      next(error);
    }
  }

  static async getStocks(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stocks = await query(
        `SELECT 
           id,
           symbol,
           company_name,
           sector,
           current_price,
           previous_close,
           day_high,
           day_low,
           volume,
           market_cap,
           is_active,
           updated_at
         FROM stocks
         ORDER BY symbol ASC`
      );

      ApiResponse.success(res, { stocks });
    } catch (error) {
      next(error);
    }
  }
}