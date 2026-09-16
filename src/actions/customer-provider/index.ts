import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  CustomerProvider,
  CustomerProviderCreate,
  CustomerProviderUpdate,
  CustomerProviderQueryParams,
} from '@/types';

export const getCustomerProviders = async (
  params?: CustomerProviderQueryParams
): Promise<BaseResponseWithPagination<CustomerProvider>> => {
  try {
    const response = await api.get('/api/v1/customer-providers', { params });
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
  } catch (error: unknown) {
    console.warn('API error getCustomerProviders', error);
    throw error;
  }
};

export const getCustomerProvider = async (id: number): Promise<CustomerProvider> => {
  try {
    const response = await api.get(`/api/v1/customer-providers/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getCustomerProvider', error);
    throw error;
  }
};

export const createCustomerProvider = async (
  data: CustomerProviderCreate
): Promise<CustomerProvider> => {
  try {
    const response = await api.post('/api/v1/customer-providers', data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createCustomerProvider', error);
    throw error;
  }
};

export const updateCustomerProvider = async (
  id: number,
  data: CustomerProviderUpdate
): Promise<CustomerProvider> => {
  try {
    const response = await api.put(`/api/v1/customer-providers/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateCustomerProvider', error);
    throw error;
  }
};

export const deleteCustomerProvider = async (id: number): Promise<CustomerProvider> => {
  try {
    const response = await api.delete(`/api/v1/customer-providers/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteCustomerProvider', error);
    throw error;
  }
};
