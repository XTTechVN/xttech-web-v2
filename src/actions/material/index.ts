import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  Accessory,
  AccessoryQueryParams,
  Material,
  MaterialAssignAccessories,
  MaterialCreate,
  MaterialQueryParams,
  MaterialUnassignAccessories,
  MaterialUpdate,
} from '@/types';

export const getMaterials = async (
  params?: MaterialQueryParams,
): Promise<BaseResponseWithPagination<Material>> => {
  try {
    const response = await api.get('/api/v1/materials', { params });
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
    console.warn('API error getMaterials', error);
    throw error;
  }
};

export const getMaterial = async (id: number): Promise<Material> => {
  try {
    const response = await api.get(`/api/v1/materials/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getMaterial', error);
    throw error;
  }
};

export const createMaterial = async (data: MaterialCreate): Promise<Material> => {
  try {
    const response = await api.post('/api/v1/materials', data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createMaterial', error);
    throw error;
  }
};

export const updateMaterial = async (id: number, data: MaterialUpdate): Promise<Material> => {
  try {
    const response = await api.put(`/api/v1/materials/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateMaterial', error);
    throw error;
  }
};

export const deleteMaterial = async (id: number): Promise<Material> => {
  try {
    const response = await api.delete(`/api/v1/materials/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteMaterial', error);
    throw error;
  }
};

// --- Sub-resource: Accessories ---

export const getMaterialAccessories = async (
  materialId: number,
  params?: AccessoryQueryParams,
): Promise<BaseResponseWithPagination<Accessory>> => {
  try {
    const response = await api.get(`/api/v1/materials/${materialId}/accessories`, { params });
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
    console.warn('API error getMaterialAccessories', error);
    throw error;
  }
};

export const assignMaterialAccessories = async (
  materialId: number,
  payload: MaterialAssignAccessories,
): Promise<Accessory[]> => {
  try {
    const response = await api.post(`/api/v1/materials/${materialId}/accessories`, payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error assignMaterialAccessories', error);
    throw error;
  }
};

export const revokeMaterialAccessories = async (
  materialId: number,
  payload: MaterialUnassignAccessories,
): Promise<Accessory[]> => {
  try {
    const response = await api.delete(`/api/v1/materials/${materialId}/accessories`, {
      data: payload,
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error revokeMaterialAccessories', error);
    throw error;
  }
};
