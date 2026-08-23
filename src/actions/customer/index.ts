import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type { Customer, CustomerCreate, CustomerQueryParams, CustomerUpdate, CustomerLog, CustomerLogCreate } from '@/types';

export const getCustomers = async (params?: CustomerQueryParams): Promise<BaseResponseWithPagination<Customer>> => {
  try {
    const response = await api.get('/api/v1/customers', { params });
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
    console.warn('API error getCustomers', error);
    throw error;
  }
};

export const getCustomer = async (id: number): Promise<Customer> => {
  try {
    const response = await api.get(`/api/v1/customers/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getCustomer', error);
    throw error;
  }
};

export const createCustomer = async (data: CustomerCreate | FormData): Promise<Customer> => {
  try {
    const isFormData = typeof (data as any).append === 'function';
    const response = await api.post('/api/v1/customers', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createCustomer', error);
    throw error;
  }
};

export const updateCustomer = async (id: number, data: CustomerUpdate | FormData): Promise<Customer> => {
  try {
    const isFormData = typeof (data as any).append === 'function';
    const response = await api.put(`/api/v1/customers/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateCustomer', error);
    throw error;
  }
};

export const deleteCustomer = async (id: number): Promise<Customer> => {
  try {
    const response = await api.delete(`/api/v1/customers/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteCustomer', error);
    throw error;
  }
};

export const createCustomerLog = async ({ customerId, data }: { customerId: number; data: CustomerLogCreate }): Promise<CustomerLog> => {
  try {
    const response = await api.post(`/api/v1/customers/${customerId}/logs`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createCustomerLog', error);
    throw error;
  }
};

export const getCustomerLogs = async (customerId: number, params?: any): Promise<BaseResponseWithPagination<CustomerLog>> => {
  try {
    const response = await api.get(`/api/v1/customers/${customerId}/logs`, { params });
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
    console.warn('API error getCustomerLogs', error);
    throw error;
  }
};

export const deleteCustomerLog = async ({ customerId, logId }: { customerId: number; logId: number | string }): Promise<void> => {
  try {
    await api.delete(`/api/v1/customers/${customerId}/logs/${logId}`);
  } catch (error: unknown) {
    console.warn('API error deleteCustomerLog', error);
    throw error;
  }
};
