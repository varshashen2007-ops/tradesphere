import { query } from '../config/database';
import { Stock } from '../types';
import { AppError } from '../middleware/error.middleware';

interface StockSearchResult extends Stock {
  change: number;
  change_percent: number;
}

interface MarketMover {
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  sector: string;
}

export class StocksService {
  static async getAllStocks(
    search?: string,
    sector?: string,
    limit = 50,
    offset = 0
  ): Promise<{ stocks: StockSearchResult[]; total: number }> {
    let whereClause = 'WHERE s.is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (
        UPPER(s.symbol) LIKE UPPER($${paramIndex}) OR
        UPPER(s.company_name) LIKE UPPER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (sector) {
      whereClause += ` AND s.sector = $${paramIndex}`;
      params.push(sector);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM stocks s ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0].count, 10);

    params.push(limit, offset);

    const stocks = await query<StockSearchResult>(
      `SELECT
         s.*,
         ROUND(s.current_price - s.previous_close, 2) AS change,
         ROUND(((s.current_price - s.previous_close) / s.previous_close) * 100, 2) AS change_percent
       FROM stocks s
       ${whereClause}
       ORDER BY s.market_cap DESC NULLS LAST
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return { stocks, total };
  }

  static async getStockBySymbol(symbol: string): Promise<StockSearchResult> {
    const stocks = await query<StockSearchResult>(
      `SELECT
         s.*,
         ROUND(s.current_price - s.previous_close, 2) AS change,
         ROUND(((s.current_price - s.previous_close) / s.previous_close) * 100, 2) AS change_percent
       FROM stocks s
       WHERE UPPER(s.symbol) = UPPER($1) AND s.is_active = true`,
      [symbol]
    );

    if (stocks.length === 0) {
      throw new AppError(`Stock '${symbol}' not found`, 404);
    }

    return stocks[0];
  }

  static async getStockById(id: string): Promise<StockSearchResult> {
    const stocks = await query<StockSearchResult>(
      `SELECT
         s.*,
         ROUND(s.current_price - s.previous_close, 2) AS change,
         ROUND(((s.current_price - s.previous_close) / s.previous_close) * 100, 2) AS change_percent
       FROM stocks s
       WHERE s.id = $1 AND s.is_active = true`,
      [id]
    );

    if (stocks.length === 0) {
      throw new AppError('Stock not found', 404);
    }

    return stocks[0];
  }

  static async getMarketMovers(): Promise<{
    gainers: MarketMover[];
    losers: MarketMover[];
    mostActive: MarketMover[];
  }> {
    const moversQuery = `
      SELECT
        symbol,
        company_name,
        sector,
        current_price,
        ROUND(((current_price - previous_close) / previous_close) * 100, 2) AS change_percent,
        volume
      FROM stocks
      WHERE is_active = true AND previous_close > 0
    `;

    const allStocks = await query<MarketMover & { volume: number }>(moversQuery);

    const sorted = [...allStocks].sort(
      (a, b) => b.change_percent - a.change_percent
    );

    const gainers = sorted.filter((s) => s.change_percent > 0).slice(0, 5);
    const losers = sorted.filter((s) => s.change_percent < 0).slice(-5).reverse();
    const mostActive = [...allStocks]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    return { gainers, losers, mostActive };
  }

  static async getSectors(): Promise<{ sector: string; count: number }[]> {
    return query<{ sector: string; count: number }>(
      `SELECT sector, COUNT(*) as count
       FROM stocks
       WHERE is_active = true AND sector IS NOT NULL
       GROUP BY sector
       ORDER BY count DESC`
    );
  }

  // Watchlist methods
  static async getWatchlist(userId: string): Promise<StockSearchResult[]> {
    return query<StockSearchResult>(
      `SELECT
         s.*,
         ROUND(s.current_price - s.previous_close, 2) AS change,
         ROUND(((s.current_price - s.previous_close) / s.previous_close) * 100, 2) AS change_percent,
         w.created_at AS added_at
       FROM watchlists w
       JOIN stocks s ON s.id = w.stock_id
       WHERE w.user_id = $1 AND s.is_active = true
       ORDER BY w.created_at DESC`,
      [userId]
    );
  }

  static async addToWatchlist(userId: string, stockId: string): Promise<void> {
    // Check stock exists
    const stocks = await query<{ id: string }>(
      'SELECT id FROM stocks WHERE id = $1 AND is_active = true',
      [stockId]
    );

    if (stocks.length === 0) {
      throw new AppError('Stock not found', 404);
    }

    // Check if already in watchlist
    const existing = await query<{ id: string }>(
      'SELECT id FROM watchlists WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );

    if (existing.length > 0) {
      throw new AppError('Stock already in watchlist', 409);
    }

    await query(
      'INSERT INTO watchlists (user_id, stock_id) VALUES ($1, $2)',
      [userId, stockId]
    );
  }

  static async removeFromWatchlist(userId: string, stockId: string): Promise<void> {
    const result = await query<{ id: string }>(
      'DELETE FROM watchlists WHERE user_id = $1 AND stock_id = $2 RETURNING id',
      [userId, stockId]
    );

    if (result.length === 0) {
      throw new AppError('Stock not in watchlist', 404);
    }
  }

  static async isInWatchlist(userId: string, stockId: string): Promise<boolean> {
    const result = await query<{ id: string }>(
      'SELECT id FROM watchlists WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );
    return result.length > 0;
  }
}