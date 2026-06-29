import { create } from 'zustand';

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

interface MarketState {
  livePrices: Record<string, PriceTick>;

  updatePrice: (tick: PriceTick) => void;
  updatePrices: (ticks: PriceTick[]) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  livePrices: {},

  updatePrice: (tick) =>
    set((state) => ({
      livePrices: {
        ...state.livePrices,
        [tick.symbol]: tick,
      },
    })),

  updatePrices: (ticks) =>
    set((state) => {
      const updated = { ...state.livePrices };

      ticks.forEach((tick) => {
        updated[tick.symbol] = tick;
      });

      return { livePrices: updated };
    }),
}));