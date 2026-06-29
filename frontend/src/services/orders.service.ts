import { apiClient } from '../api/client';

export const OrdersService = {
  async getOrders() {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  async placeOrder(data: {
    stockId: string;
    orderType: 'BUY' | 'SELL';
    orderMode: 'MARKET' | 'LIMIT';
    quantity: number;
    limitPrice?: number;
  }) {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },
};