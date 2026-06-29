import { apiClient } from '../api/client';

export const WalletService = {
  async getWallet() {
    const response = await apiClient.get('/wallet');
    return response.data;
  },

  async getTransactions() {
    const response = await apiClient.get('/wallet/transactions');
    return response.data;
  },
};