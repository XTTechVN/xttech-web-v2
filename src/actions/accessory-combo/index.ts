import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  AccessoryCombo,
  AccessoryComboCreate,
  AccessoryComboUpdate,
  AccessoryComboQueryParams,
} from '@/types';

export const getAccessoryCombos = async (
  params?: AccessoryComboQueryParams,
): Promise<BaseResponseWithPagination<AccessoryCombo>> => {
  try {
    const response = await api.get('/api/v1/accessory-combos', { params });
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
    console.warn('API error getAccessoryCombos', error);
    throw error;
  }
};

export const getAccessoryCombo = async (id: number): Promise<AccessoryCombo> => {
  try {
    const response = await api.get(`/api/v1/accessory-combos/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error getAccessoryCombo', error);
    throw error;
  }
};

export const createAccessoryCombo = async (data: AccessoryComboCreate): Promise<AccessoryCombo> => {
  try {
    const response = await api.post('/api/v1/accessory-combos', data);
    return response.data;
  } catch (error) {
    console.warn('API error createAccessoryCombo', error);
    throw error;
  }
};

export const updateAccessoryCombo = async (id: number, data: AccessoryComboUpdate): Promise<AccessoryCombo> => {
  try {
    const response = await api.put(`/api/v1/accessory-combos/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateAccessoryCombo', error);
    throw error;
  }
};

export const deleteAccessoryCombo = async (id: number): Promise<AccessoryCombo> => {
  try {
    const response = await api.delete(`/api/v1/accessory-combos/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteAccessoryCombo', error);
    throw error;
  }
};
