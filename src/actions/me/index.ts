import api from '@/utils/api';
import type { Me } from '@/types';

export const getMe = async (): Promise<Me> => {
  const response = await api.get('/api/v1/me');
  return response.data;
};
