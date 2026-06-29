import { Request } from 'express';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  is_verified: boolean;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  created_at: Date;
  updated_at: Date;
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
  volume: bigint;
  market_cap: bigint;
  pe_ratio?: number;
  updated_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  stock_id: string;
  order_type: 'BUY' | 'SELL';
  order_mode: 'MARKET' | 'LIMIT';
  quantity: number;
  price: number;
  limit_price?: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED';
  created_at: Date;
  executed_at?: Date;
}

export interface Holding {
  id: string;
  user_id: string;
  stock_id: string;
  quantity: number;
  average_buy_price: number;
  total_invested: number;
  created_at: Date;
  updated_at: Date;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>[];
  stack?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}