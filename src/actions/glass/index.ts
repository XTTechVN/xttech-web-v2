import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  Glass,
  GlassCreate,
  GlassUpdate,
  GlassQueryParams,
  GlassCategory,
  GlassCategoryCreate,
  GlassCategoryUpdate,
  GlassCategoryQueryParams,
} from '@/types';

// Glass Categories
export const getGlassCategories = async (
  params?: GlassCategoryQueryParams,
): Promise<BaseResponseWithPagination<GlassCategory>> => {
  try {
    const response = await api.get('/api/v1/glass-categories', { params });
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
    console.warn('API error getGlassCategories', error);
    throw error;
  }
};

export const createGlassCategory = async (data: GlassCategoryCreate): Promise<GlassCategory> => {
  try {
    const response = await api.post('/api/v1/glass-categories', data);
    return response.data;
  } catch (error) {
    console.warn('API error createGlassCategory', error);
    throw error;
  }
};

export const updateGlassCategory = async (id: number, data: GlassCategoryUpdate): Promise<GlassCategory> => {
  try {
    const response = await api.put(`/api/v1/glass-categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateGlassCategory', error);
    throw error;
  }
};

export const deleteGlassCategory = async (id: number): Promise<GlassCategory> => {
  try {
    const response = await api.delete(`/api/v1/glass-categories/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteGlassCategory', error);
    throw error;
  }
};

// Glasses
export const getGlasses = async (
  params?: GlassQueryParams,
): Promise<BaseResponseWithPagination<Glass>> => {
  try {
    const response = await api.get('/api/v1/glasses', { params });
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
    console.warn('API error getGlasses', error);
    throw error;
  }
};

export const getGlass = async (id: number): Promise<Glass> => {
  try {
    const response = await api.get(`/api/v1/glasses/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error getGlass', error);
    throw error;
  }
};

export const createGlass = async (data: GlassCreate): Promise<Glass> => {
  try {
    const response = await api.post('/api/v1/glasses', data);
    return response.data;
  } catch (error) {
    console.warn('API error createGlass', error);
    throw error;
  }
};

export const updateGlass = async (id: number, data: GlassUpdate): Promise<Glass> => {
  try {
    const response = await api.put(`/api/v1/glasses/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateGlass', error);
    throw error;
  }
};

export const deleteGlass = async (id: number): Promise<Glass> => {
  try {
    const response = await api.delete(`/api/v1/glasses/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteGlass', error);
    throw error;
  }
};

export const setDefaultGlass = async (id: number): Promise<Glass> => {
  try {
    const response = await api.patch(`/api/v1/glasses/${id}/default`);
    return response.data;
  } catch (error) {
    console.warn('API error setDefaultGlass', error);
    throw error;
  }
};

