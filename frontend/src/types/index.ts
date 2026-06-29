export interface User {
  id: string;
  name?: string;
  full_name?: string;
  username?: string;
  email: string;
  avatar_url?: string | null;
  is_verified?: boolean;

  
  role?: 'USER' | 'ADMIN';

  created_at?: string;
  updated_at?: string;
}

export interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  previous_close: number;
  day_high: number;
  day_low: number;
  volume: number;
  market_cap?: number;
}

export interface Holding {
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

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  day_pnl: number;
  holdings_count: number;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  holdings_count: number;
  percentage: number;
}

export interface Order {
  id: string;
  stock_id: string;
  user_id: string;

  order_type: 'BUY' | 'SELL';
  order_mode: 'MARKET' | 'LIMIT';

  quantity: number;
  price: string;
  total_value: string;

  status: string;

  symbol: string;
  company_name: string;
  sector: string;

  created_at: string;
  executed_at: string | null;
}

export interface Wallet {
  id: string;
  user_id: string;

  balance: string;
  total_deposited: string;
  total_withdrawn: string;

  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}