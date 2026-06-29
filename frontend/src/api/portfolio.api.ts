import { apiClient } from './client';

export const portfolioApi = {
  getHoldings() {
    return apiClient.get('/portfolio/holdings');
  },

  getSectors() {
    return apiClient.get('/portfolio/sectors');
  },
};