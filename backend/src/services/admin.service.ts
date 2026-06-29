import { query } from '../config/database';

type CountResult = {
  count: string;
};

export class AdminService {
  // =========================
  // DASHBOARD
  // =========================
  static async getDashboardStats() {
    const users = await query<CountResult>(
      'SELECT COUNT(*) AS count FROM users'
    );

    const orders = await query<CountResult>(
      'SELECT COUNT(*) AS count FROM orders'
    );

    const stocks = await query<CountResult>(
      'SELECT COUNT(*) AS count FROM stocks'
    );

    const wallets = await query<{ total: string }>(
      'SELECT COALESCE(SUM(balance),0) AS total FROM wallets'
    );

    return {
      totalUsers: Number(users[0].count),
      totalOrders: Number(orders[0].count),
      totalStocks: Number(stocks[0].count),
      totalWalletBalance: Number(wallets[0].total),
    };
  }

  static async getRecentUsers(limit = 5) {
    return query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        role,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit]
    );
  }

  static async getRecentOrders(limit = 5) {
    return query(
      `
      SELECT
        o.id,
        o.order_type,
        o.order_mode,
        o.quantity,
        o.price,
        o.status,
        o.created_at,
        s.symbol,
        s.company_name,
        u.full_name,
        u.email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN stocks s ON s.id = o.stock_id
      ORDER BY o.created_at DESC
      LIMIT $1
      `,
      [limit]
    );
  }

  // =========================
  // USERS
  // =========================
  static async getUsers() {
    return query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        role,
        is_verified,
        created_at
      FROM users
      ORDER BY created_at DESC
      `
    );
  }

  static async updateUserRole(
    userId: string,
    role: 'USER' | 'ADMIN'
  ) {
    const result = await query(
      `
      UPDATE users
      SET role = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        full_name,
        username,
        email,
        role
      `,
      [role, userId]
    );

    return result[0];
  }

  // =========================
  // ORDERS
  // =========================
  static async getOrders() {
    return query(
      `
      SELECT
        o.id,
        o.order_type,
        o.order_mode,
        o.quantity,
        o.price,
        o.status,
        o.created_at,
        o.executed_at,
        s.symbol,
        s.company_name,
        u.full_name,
        u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN stocks s ON o.stock_id = s.id
      ORDER BY o.created_at DESC
      `
    );
  }

  // =========================
  // STOCKS
  // =========================
  static async getStocks() {
    return query(
      `
      SELECT
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
        updated_at
      FROM stocks
      ORDER BY symbol
      `
    );
  }

  static async updateStockPrice(
    stockId: string,
    price: number
  ) {
    const result = await query(
      `
      UPDATE stocks
      SET current_price = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [price, stockId]
    );

    return result[0];
  }
}