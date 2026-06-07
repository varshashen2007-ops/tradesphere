import { Server as SocketIOServer } from 'socket.io';
import { query } from '../config/database';
import { OrdersService } from './orders.service';

interface StockPrice {
  id: string;
  symbol: string;
  current_price: number;
  previous_close: number;
  day_high: number;
  day_low: number;
  volume: number;
  sector: string;
}

interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  timestamp: string;
}

const SECTOR_VOLATILITY: Record<string, number> = {
  'Information Technology': 0.018,
  'Financial Services': 0.014,
  Energy: 0.016,
  Automobile: 0.02,
  Healthcare: 0.012,
  FMCG: 0.008,
  'Consumer Discretionary': 0.015,
  default: 0.013,
};

export class PriceSimulator {
  private io: SocketIOServer;
  private intervalId: NodeJS.Timeout | null = null;
  private prices: Map<string, StockPrice> = new Map();
  private isRunning = false;
  private tickCount = 0;
  private readonly TICK_INTERVAL_MS = 3000;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    await this.loadInitialPrices();
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      await this.tick();
    }, this.TICK_INTERVAL_MS);

    console.log('Price simulator started — ticking every 3 seconds');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('Price simulator stopped');
  }

  private async loadInitialPrices(): Promise<void> {
    const stocks = await query<StockPrice>(
      `SELECT 
        id, 
        symbol, 
        current_price, 
        previous_close, 
        day_high, 
        day_low, 
        volume, 
        sector 
      FROM stocks 
      WHERE is_active = true`
    );

    stocks.forEach((stock) => {
      this.prices.set(stock.symbol, {
        ...stock,
        current_price: Number(stock.current_price),
        previous_close: Number(stock.previous_close),
        day_high: Number(stock.day_high),
        day_low: Number(stock.day_low),
        volume: Number(stock.volume),
      });
    });

    console.log(`Price simulator loaded ${stocks.length} stocks`);
  }

  private async tick(): Promise<void> {
    const ticks: PriceTick[] = [];
    const updates: {
      id: string;
      price: number;
      high: number;
      low: number;
      volume: number;
    }[] = [];

    this.prices.forEach((stock) => {
      const newPrice = this.calculateNewPrice(stock);

      const change = newPrice - stock.previous_close;
      const changePercent = (change / stock.previous_close) * 100;

      const newHigh = Math.max(stock.day_high, newPrice);
      const newLow = Math.min(stock.day_low, newPrice);

      const volumeAdd = Math.floor(Math.random() * 5000) + 500;
      const newVolume = stock.volume + volumeAdd;

      this.prices.set(stock.symbol, {
        ...stock,
        current_price: newPrice,
        day_high: newHigh,
        day_low: newLow,
        volume: newVolume,
      });

      ticks.push({
        symbol: stock.symbol,
        price: newPrice,
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        dayHigh: newHigh,
        dayLow: newLow,
        volume: newVolume,
        timestamp: new Date().toISOString(),
      });

      updates.push({
        id: stock.id,
        price: newPrice,
        high: newHigh,
        low: newLow,
        volume: newVolume,
      });
    });

    ticks.forEach((tick) => {
      this.io.to(`stock:${tick.symbol}`).emit('price:tick', tick);
    });

    this.io.emit('market:tick', ticks);

    this.tickCount++;

    if (this.tickCount % 60 === 0) {
      await this.snapshotPrices();
    }

    await this.batchUpdatePrices(updates);

    const priceMap = new Map<string, number>();

    ticks.forEach((tick) => {
      priceMap.set(tick.symbol, tick.price);
    });

    await OrdersService.processLimitOrders(priceMap);
  }

  private calculateNewPrice(stock: StockPrice): number {
    const volatility =
      SECTOR_VOLATILITY[stock.sector] ?? SECTOR_VOLATILITY.default;

    const dt = this.TICK_INTERVAL_MS / (252 * 24 * 60 * 60 * 1000);
    const drift = 0.005 * dt;
    const randomShock = volatility * this.gaussianRandom() * Math.sqrt(dt);

    const priceChange = stock.current_price * (drift + randomShock);
    const newPrice = stock.current_price + priceChange;

    const maxChange = stock.previous_close * 0.1;
    const minPrice = stock.previous_close - maxChange;
    const maxPrice = stock.previous_close + maxChange;

    return Number(Math.max(minPrice, Math.min(maxPrice, newPrice)).toFixed(2));
  }

  private gaussianRandom(): number {
    let u = 0;
    let v = 0;

    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  private async batchUpdatePrices(
    updates: {
      id: string;
      price: number;
      high: number;
      low: number;
      volume: number;
    }[]
  ): Promise<void> {
    if (updates.length === 0) return;

    try {
      const ids = updates.map((u) => u.id);
      const prices = updates.map((u) => u.price);
      const highs = updates.map((u) => u.high);
      const lows = updates.map((u) => u.low);
      const volumes = updates.map((u) => u.volume);

      await query(
        `UPDATE stocks SET
          current_price = data.price,
          day_high = data.high,
          day_low = data.low,
          volume = data.volume,
          updated_at = NOW()
        FROM (
          SELECT
            unnest($1::uuid[]) AS id,
            unnest($2::decimal[]) AS price,
            unnest($3::decimal[]) AS high,
            unnest($4::decimal[]) AS low,
            unnest($5::bigint[]) AS volume
        ) AS data
        WHERE stocks.id = data.id`,
        [ids, prices, highs, lows, volumes]
      );
    } catch (error) {
      console.error('Batch price update failed:', error);
    }
  }

  private async snapshotPrices(): Promise<void> {
    const values: unknown[] = [];
    const placeholders: string[] = [];
    let i = 1;

    this.prices.forEach((stock) => {
      placeholders.push(`($${i}, $${i + 1}, $${i + 2})`);
      values.push(stock.id, stock.current_price, stock.volume);
      i += 3;
    });

    if (placeholders.length === 0) return;

    await query(
      `INSERT INTO price_history (stock_id, price, volume) 
       VALUES ${placeholders.join(', ')}`,
      values
    );
  }

  getCurrentPrice(symbol: string): number | null {
    return this.prices.get(symbol.toUpperCase())?.current_price ?? null;
  }

  getAllPrices(): Map<string, StockPrice> {
    return this.prices;
  }
}