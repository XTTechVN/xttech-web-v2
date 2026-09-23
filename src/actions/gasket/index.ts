import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  Gasket,
  GasketCreate,
  GasketUpdate,
  GasketQueryParams,
} from '@/types';

export const getGaskets = async (
  params?: GasketQueryParams,
): Promise<BaseResponseWithPagination<Gasket>> => {
  try {
    const response = await api.get('/api/v1/gaskets', { params });
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 10,
        next: meta?.next ?? false,
      },
    };
  } catch (error) {
    console.warn('API error getGaskets', error);
    throw error;
  }
};

export const getGasket = async (id: number): Promise<Gasket> => {
  try {
    const response = await api.get(`/api/v1/gaskets/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error getGasket', error);
    throw error;
  }
};

export const createGasket = async (data: GasketCreate): Promise<Gasket> => {
  try {
    const response = await api.post('/api/v1/gaskets', data);
    return response.data;
  } catch (error) {
    console.warn('API error createGasket', error);
    throw error;
  }
};

export const updateGasket = async (id: number, data: GasketUpdate): Promise<Gasket> => {
  try {
    const response = await api.put(`/api/v1/gaskets/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateGasket', error);
    throw error;
  }
};

export const deleteGasket = async (id: number): Promise<Gasket> => {
  try {
    const response = await api.delete(`/api/v1/gaskets/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteGasket', error);
    throw error;
  }
};
