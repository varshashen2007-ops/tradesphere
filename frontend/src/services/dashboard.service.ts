import { apiClient } from '../api/client';

export const DashboardService = {
  async getPortfolio() {
    const response = await apiClient.get('/portfolio/holdings');
    return response.data;
  },

  async getOrders() {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  async getWallet() {
    const response = await apiClient.get('/wallet');
    return response.data;
  },
};