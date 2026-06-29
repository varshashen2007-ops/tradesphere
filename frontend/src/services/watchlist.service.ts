import { apiClient } from '../api/client';

export const WatchlistService = {
  async getWatchlist() {
    const response = await apiClient.get('/stocks/watchlist/me');
    return response.data;
  },

  async addToWatchlist(stockId: string) {
    const response = await apiClient.post(`/stocks/watchlist/${stockId}`);
    return response.data;
  },

  async removeFromWatchlist(stockId: string) {
    const response = await apiClient.delete(`/stocks/watchlist/${stockId}`);
    return response.data;
  },
};