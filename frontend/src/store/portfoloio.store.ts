import { create } from 'zustand';
import type{ Holding, PortfolioSummary } from '../types';

interface PortfolioState {
  holdings: Holding[];
  summary: PortfolioSummary | null;

  setPortfolio: (holdings: Holding[], summary: PortfolioSummary) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: [],
  summary: null,

  setPortfolio: (holdings, summary) => {
    set({ holdings, summary });
  },
}));