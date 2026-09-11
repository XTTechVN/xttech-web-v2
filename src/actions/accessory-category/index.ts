import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  AccessoryCategory,
  AccessoryCategoryCreate,
  AccessoryCategoryUpdate,
  AccessoryCategoryQueryParams,
} from '@/types';

export const getAccessoryCategories = async (
  params?: AccessoryCategoryQueryParams
): Promise<BaseResponseWithPagination<AccessoryCategory>> => {
  try {
    const response = await api.get('/api/v1/accessory-categories', { params });
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
    console.warn('API error getAccessoryCategories', error);
    throw error;
  }
};

export const getAccessoryCategory = async (id: number): Promise<AccessoryCategory> => {
  try {
    const response = await api.get(`/api/v1/accessory-categories/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getAccessoryCategory', error);
    throw error;
  }
};

export const createAccessoryCategory = async (
  data: AccessoryCategoryCreate
): Promise<AccessoryCategory> => {
  try {
    const response = await api.post('/api/v1/accessory-categories', data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createAccessoryCategory', error);
    throw error;
  }
};

export const updateAccessoryCategory = async (
  id: number,
  data: AccessoryCategoryUpdate
): Promise<AccessoryCategory> => {
  try {
    const response = await api.put(`/api/v1/accessory-categories/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateAccessoryCategory', error);
    throw error;
  }
};

export const deleteAccessoryCategory = async (id: number): Promise<AccessoryCategory> => {
  try {
    const response = await api.delete(`/api/v1/accessory-categories/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteAccessoryCategory', error);
    throw error;
  }
};
