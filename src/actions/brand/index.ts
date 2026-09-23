import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  Brand,
  BrandCreate,
  BrandUpdate,
  BrandQueryParams,
  BrandColor,
  BrandColorCreate,
  BrandColorUpdate,
  BrandColorQueryParams,
} from '@/types';

export const getBrands = async ( params?: BrandQueryParams, ): Promise<BaseResponseWithPagination<Brand>> => {
  try {
    const response = await api.get('/api/v1/brands', { params });
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
    console.warn('API error getBrands', error);
    throw error;
  }
};

export const getBrand = async (id: number): Promise<Brand> => {
  try {
    const response = await api.get(`/api/v1/brands/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error getBrand', error);
    throw error;
  }
};

export const createBrand = async (data: BrandCreate): Promise<Brand> => {
  try {
    const response = await api.post('/api/v1/brands', data);
    return response.data;
  } catch (error) {
    console.warn('API error createBrand', error);
    throw error;
  }
};

export const updateBrand = async (id: number, data: BrandUpdate): Promise<Brand> => {
  try {
    const response = await api.put(`/api/v1/brands/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateBrand', error);
    throw error;
  }
};

export const deleteBrand = async (id: number): Promise<Brand> => {
  try {
    const response = await api.delete(`/api/v1/brands/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteBrand', error);
    throw error;
  }
};

// Brand Colors
export const getBrandColors = async (
  params?: BrandColorQueryParams,
): Promise<BaseResponseWithPagination<BrandColor>> => {
  try {
    const response = await api.get('/api/v1/brand-colors', { params });
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
    console.warn('API error getBrandColors', error);
    throw error;
  }
};

export const createBrandColor = async (data: BrandColorCreate): Promise<BrandColor> => {
  try {
    const response = await api.post('/api/v1/brand-colors', data);
    return response.data;
  } catch (error) {
    console.warn('API error createBrandColor', error);
    throw error;
  }
};

export const updateBrandColor = async (id: number, data: BrandColorUpdate): Promise<BrandColor> => {
  try {
    const response = await api.put(`/api/v1/brand-colors/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateBrandColor', error);
    throw error;
  }
};

export const deleteBrandColor = async (id: number): Promise<BrandColor> => {
  try {
    const response = await api.delete(`/api/v1/brand-colors/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteBrandColor', error);
    throw error;
  }
};
