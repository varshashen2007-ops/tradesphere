export interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;

  current_price: number;
  previous_close: number;

  day_high: number;
  day_low: number;

  market_cap: number;
  volume: number;

  created_at: Date;
  updated_at: Date;
}

export interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}