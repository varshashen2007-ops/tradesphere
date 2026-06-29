import { apiClient } from './client';

export const ordersApi = {
  place(data: {
    stockId: string;
    orderType: 'BUY' | 'SELL';
    orderMode: 'MARKET' | 'LIMIT';
    quantity: number;
    limitPrice?: number;
  }) {
    return apiClient.post('/orders', data);
  },

  getHistory() {
    return apiClient.get('/orders');
  },

  cancel(orderId: string) {
    return apiClient.delete(`/orders/${orderId}`);
  },
};