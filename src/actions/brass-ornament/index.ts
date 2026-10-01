import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';

export interface BrassOrnamentItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  width: number;
  height: number;
  viewBox: string;
  svgPath?: string;
  accessoryId?: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrassOrnamentCreate {
  code: string;
  name: string;
  description?: string;
  price: number;
  width?: number;
  height?: number;
  viewBox?: string;
  svgPath?: string;
  accessoryId?: number;
  isSystem?: boolean;
  isActive?: boolean;
}

export interface BrassOrnamentUpdate {
  name?: string;
  description?: string;
  price?: number;
  width?: number;
  height?: number;
  viewBox?: string;
  svgPath?: string;
  accessoryId?: number;
  isActive?: boolean;
}

export interface BrassOrnamentQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
  isSystem?: boolean;
  isActive?: boolean;
}

export const getBrassOrnaments = async (
  params?: BrassOrnamentQueryParams,
): Promise<BaseResponseWithPagination<BrassOrnamentItem>> => {
  try {
    const response = await api.get('/api/v1/brass-ornaments', { params });
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 100,
        next: meta?.next ?? false,
      },
    };
  } catch (error) {
    console.warn('API error getBrassOrnaments', error);
    throw error;
  }
};

export const createBrassOrnament = async (data: BrassOrnamentCreate): Promise<BrassOrnamentItem> => {
  try {
    const response = await api.post('/api/v1/brass-ornaments', data);
    return response.data;
  } catch (error) {
    console.warn('API error createBrassOrnament', error);
    throw error;
  }
};

export const updateBrassOrnament = async (id: number, data: BrassOrnamentUpdate): Promise<BrassOrnamentItem> => {
  try {
    const response = await api.put(`/api/v1/brass-ornaments/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn(`API error updateBrassOrnament ${id}`, error);
    throw error;
  }
};

export const deleteBrassOrnament = async (id: number): Promise<boolean> => {
  try {
    const response = await api.delete(`/api/v1/brass-ornaments/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`API error deleteBrassOrnament ${id}`, error);
    throw error;
  }
};
