import { apiClient } from '../api/client';

export const AuthService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    return response.data;
  },

  async register(
    username: string,
    email: string,
    password: string
  ) {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
    });

    return response.data;
  },

  async me() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};