import { query } from '../config/database';

interface HoldingWithLiveData {
  id: string;
  stock_id: string;
  symbol: string;
  company_name: string;
  sector: string;
  quantity: number;
  average_buy_price: number;
  total_invested: number;
  current_price: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  day_change_percent: number;
}

interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  day_pnl: number;
  holdings_count: number;
}

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  holdings_count: number;
}

export class PortfolioService {
  static async getHoldings(userId: string): Promise<{
    holdings: HoldingWithLiveData[];
    summary: PortfolioSummary;
  }> {
    const holdings = await query<HoldingWithLiveData>(
      `SELECT
        h.id,
        h.stock_id,
        s.symbol,
        s.company_name,
        s.sector,
        h.quantity,
        h.average_buy_price::float AS average_buy_price,
        h.total_invested::float AS total_invested,
        s.current_price::float AS current_price,
        (h.quantity * s.current_price)::float AS current_value,
        ((h.quantity * s.current_price) - h.total_invested)::float AS unrealized_pnl,
        ROUND(
          (((h.quantity * s.current_price) - h.total_invested) / h.total_invested) * 100,
          2
        )::float AS unrealized_pnl_percent,
        ROUND(
          ((s.current_price - s.previous_close) / s.previous_close) * 100,
          2
        )::float AS day_change_percent
      FROM holdings h
      JOIN stocks s ON s.id = h.stock_id
      WHERE h.user_id = $1
      ORDER BY current_value DESC`,
      [userId]
    );

    const totalInvested = holdings.reduce(
      (sum, holding) => sum + Number(holding.total_invested),
      0
    );

    const currentValue = holdings.reduce(
      (sum, holding) => sum + Number(holding.current_value),
      0
    );

    const totalPnl = currentValue - totalInvested;

    const totalPnlPercent =
      totalInvested > 0
        ? Number(((totalPnl / totalInvested) * 100).toFixed(2))
        : 0;

    const dayPnl = holdings.reduce((sum, holding) => {
      const dayChangePercent = Number(holding.day_change_percent);
      const currentPrice = Number(holding.current_price);
      const quantity = Number(holding.quantity);

      const previousCloseApprox = currentPrice / (1 + dayChangePercent / 100);

      return sum + quantity * (currentPrice - previousCloseApprox);
    }, 0);

    return {
      holdings,
      summary: {
        total_invested: Number(totalInvested.toFixed(2)),
        current_value: Number(currentValue.toFixed(2)),
        total_pnl: Number(totalPnl.toFixed(2)),
        total_pnl_percent: totalPnlPercent,
        day_pnl: Number(dayPnl.toFixed(2)),
        holdings_count: holdings.length,
      },
    };
  }

  static async getSectorAllocation(userId: string): Promise<SectorAllocation[]> {
    const rows = await query<{
      sector: string;
      value: number;
      holdings_count: number;
    }>(
      `SELECT
        s.sector,
        SUM(h.quantity * s.current_price)::float AS value,
        COUNT(*)::int AS holdings_count
      FROM holdings h
      JOIN stocks s ON s.id = h.stock_id
      WHERE h.user_id = $1
      GROUP BY s.sector
      ORDER BY value DESC`,
      [userId]
    );

    const totalValue = rows.reduce((sum, row) => sum + Number(row.value), 0);

    if (totalValue === 0) {
      return [];
    }

    return rows.map((row) => ({
      sector: row.sector,
      value: Number(Number(row.value).toFixed(2)),
      holdings_count: Number(row.holdings_count),
      percentage: Number(((Number(row.value) / totalValue) * 100).toFixed(2)),
    }));
  }
}