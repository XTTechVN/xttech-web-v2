import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  ExtraOption,
  ExtraOptionDetail,
  ExtraOptionCreate,
  ExtraOptionUpdate,
  ExtraOptionQueryParams,
  ExtraOptionAssignMaterials,
  ExtraOptionUnassignMaterials,
  Material,
  MaterialQueryParams,
} from '@/types';

export const getExtraOptions = async (
  params?: ExtraOptionQueryParams,
): Promise<BaseResponseWithPagination<ExtraOption>> => {
  try {
    const response = await api.get('/api/v1/extra-options', { params });
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
    console.warn('API error getExtraOptions', error);
    throw error;
  }
};

export const getExtraOption = async (id: number): Promise<ExtraOptionDetail> => {
  try {
    const response = await api.get(`/api/v1/extra-options/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getExtraOption', error);
    throw error;
  }
};

export const createExtraOption = async (data: ExtraOptionCreate): Promise<ExtraOption> => {
  try {
    const response = await api.post('/api/v1/extra-options', data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createExtraOption', error);
    throw error;
  }
};

export const updateExtraOption = async (id: number, data: ExtraOptionUpdate): Promise<ExtraOption> => {
  try {
    const response = await api.put(`/api/v1/extra-options/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateExtraOption', error);
    throw error;
  }
};

export const deleteExtraOption = async (id: number): Promise<ExtraOption> => {
  try {
    const response = await api.delete(`/api/v1/extra-options/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteExtraOption', error);
    throw error;
  }
};

// --- Sub-resource: Materials ---

export const getExtraOptionMaterials = async (
  optionId: number,
  params?: MaterialQueryParams,
): Promise<BaseResponseWithPagination<Material>> => {
  try {
    const response = await api.get(`/api/v1/extra-options/${optionId}/materials`, { params });
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
    console.warn('API error getExtraOptionMaterials', error);
    throw error;
  }
};

export const assignExtraOptionMaterials = async (
  optionId: number,
  payload: ExtraOptionAssignMaterials,
): Promise<Material[]> => {
  try {
    const response = await api.post(`/api/v1/extra-options/${optionId}/materials`, payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error assignExtraOptionMaterials', error);
    throw error;
  }
};

export const unassignExtraOptionMaterials = async (
  optionId: number,
  payload: ExtraOptionUnassignMaterials,
): Promise<Material[]> => {
  try {
    const response = await api.delete(`/api/v1/extra-options/${optionId}/materials`, { data: payload });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error unassignExtraOptionMaterials', error);
    throw error;
  }
};
