import { apiClient } from './client';

export const walletApi = {
  getWallet() {
    return apiClient.get('/wallet');
  },

  getTransactions() {
    return apiClient.get('/wallet/transactions');
  },
};