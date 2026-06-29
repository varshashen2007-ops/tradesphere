import { apiClient } from './client';

export const authApi = {
  login(data: { email: string; password: string }) {
    return apiClient.post('/auth/login', data);
  },

  register(data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) {
    return apiClient.post('/auth/register', data);
  },

  googleLogin(data: { credential: string }) {
    return apiClient.post('/auth/google/login', data);
  },

  googleRegister(data: { credential: string }) {
    return apiClient.post('/auth/google/register', data);
  },

  me() {
    return apiClient.get('/auth/me');
  },

  updateProfile(data: { fullName?: string; avatarUrl?: string }) {
    return apiClient.patch('/auth/profile', data);
  },

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return apiClient.patch('/auth/change-password', data);
  },
};