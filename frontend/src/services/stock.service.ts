import { apiClient } from '../api/client';

export const StockService = {
  async getAllStocks() {
    const response = await apiClient.get('/stocks');
    return response.data;
  },

  async getMovers() {
    const response = await apiClient.get('/stocks/movers');
    return response.data;
  },

  async getStockBySymbol(symbol: string) {
    const response = await apiClient.get(`/stocks/symbol/${symbol}`);
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