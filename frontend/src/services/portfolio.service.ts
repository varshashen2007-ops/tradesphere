import { apiClient } from '../api/client';

export const PortfolioService = {
  async getHoldings() {
    const response = await apiClient.get('/portfolio/holdings');
    return response.data;
  },

  async getSectors() {
    const response = await apiClient.get('/portfolio/sectors');
    return response.data;
  },
};