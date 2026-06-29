import { apiClient } from '../api/client';

export const AdminService = {
  getDashboard() {
    return apiClient.get('/admin/dashboard');
  },

  getUsers() {
    return apiClient.get('/admin/users');
  },

  updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  getOrders() {
    return apiClient.get('/admin/orders');
  },

  getStocks() {
    return apiClient.get('/admin/stocks');
  },
};