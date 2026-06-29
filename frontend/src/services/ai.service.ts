import { apiClient } from '../api/client';

export const AIService = {
  async chat(message: string) {
    const response = await apiClient.post('/ai/chat', {
      message,
    });

    return response.data;
  },
};