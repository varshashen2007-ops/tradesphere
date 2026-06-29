import { apiClient } from './client';

export const stocksApi = {
  getAll(params?: { search?: string; sector?: string; limit?: number; offset?: number }) {
    return apiClient.get('/stocks', { params });
  },

  getMovers() {
    return apiClient.get('/stocks/movers');
  },

  getBySymbol(symbol: string) {
    return apiClient.get(`/stocks/symbol/${symbol}`);
  },

  getWatchlist() {
    return apiClient.get('/stocks/watchlist/me');
  },

  addToWatchlist(stockId: string) {
    return apiClient.post(`/stocks/watchlist/${stockId}`);
  },

  removeFromWatchlist(stockId: string) {
    return apiClient.delete(`/stocks/watchlist/${stockId}`);
  },
};