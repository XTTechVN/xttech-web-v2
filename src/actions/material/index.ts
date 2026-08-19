import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  Accessory,
  AccessoryQueryParams,
  ExtraOption,
  ExtraOptionQueryParams,
  Formula,
  FormulaQueryParams,
  Material,
  MaterialAssignAccessories,
  MaterialUnassignAccessories,
  MaterialAssignExtraOptions,
  MaterialUnassignExtraOptions,
  MaterialAssignFormulas,
  MaterialUnassignFormulas,
  MaterialCreate,
  MaterialQueryParams,
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

// --- Sub-resource: Extra Options ---

export const getMaterialExtraOptions = async (
  materialId: number,
  params?: ExtraOptionQueryParams,
): Promise<BaseResponseWithPagination<ExtraOption>> => {
  try {
    const response = await api.get(`/api/v1/materials/${materialId}/extra-options`, { params });
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
    console.warn('API error getMaterialExtraOptions', error);
    throw error;
  }
};

export const assignMaterialExtraOptions = async (
  materialId: number,
  payload: MaterialAssignExtraOptions,
): Promise<ExtraOption[]> => {
  try {
    const response = await api.post(`/api/v1/materials/${materialId}/extra-options`, payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error assignMaterialExtraOptions', error);
    throw error;
  }
};

export const revokeMaterialExtraOptions = async (
  materialId: number,
  payload: MaterialUnassignExtraOptions,
): Promise<ExtraOption[]> => {
  try {
    const response = await api.delete(`/api/v1/materials/${materialId}/extra-options`, {
      data: payload,
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error revokeMaterialExtraOptions', error);
    throw error;
  }
};

// --- Sub-resource: Formulas ---

export const getMaterialFormulas = async (
  materialId: number,
  params?: FormulaQueryParams,
): Promise<BaseResponseWithPagination<Formula>> => {
  try {
    const response = await api.get(`/api/v1/materials/${materialId}/formulas`, { params });
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
    console.warn('API error getMaterialFormulas', error);
    throw error;
  }
};

export const assignMaterialFormulas = async (
  materialId: number,
  payload: MaterialAssignFormulas,
): Promise<Formula[]> => {
  try {
    const response = await api.post(`/api/v1/materials/${materialId}/formulas`, payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error assignMaterialFormulas', error);
    throw error;
  }
};

export const revokeMaterialFormulas = async (
  materialId: number,
  payload: MaterialUnassignFormulas,
): Promise<Formula[]> => {
  try {
    const response = await api.delete(`/api/v1/materials/${materialId}/formulas`, {
      data: payload,
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error revokeMaterialFormulas', error);
    throw error;
  }
};
