import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type { Formula, FormulaCreate, FormulaUpdate, FormulaQueryParams, Material } from '@/types';

export const getFormulas = async (
  params?: FormulaQueryParams,
): Promise<BaseResponseWithPagination<Formula>> => {
  try {
    const response = await api.get('/api/v1/formulas', { params });
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
    console.warn('API error getFormulas', error);
    throw error;
  }
};

export const getFormula = async (id: number): Promise<Formula> => {
  try {
    const response = await api.get(`/api/v1/formulas/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error getFormula', error);
    throw error;
  }
};

export const createFormula = async (data: FormulaCreate): Promise<Formula> => {
  try {
    const response = await api.post('/api/v1/formulas', data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createFormula', error);
    throw error;
  }
};

export const updateFormula = async (
  id: number,
  data: FormulaUpdate,
): Promise<Formula> => {
  try {
    const response = await api.put(`/api/v1/formulas/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateFormula', error);
    throw error;
  }
};

export const deleteFormula = async (id: number): Promise<Formula> => {
  try {
    const response = await api.delete(`/api/v1/formulas/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteFormula', error);
    throw error;
  }
};

export const getMaterialsByFormula = async (
  formulaId: number,
  params?: any,
): Promise<BaseResponseWithPagination<Material>> => {
  try {
    const response = await api.get(`/api/v1/formulas/${formulaId}/materials`, { params });
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
    console.warn('API error getMaterialsByFormula', error);
    throw error;
  }
};

export const assignMaterialsToFormula = async (
  formulaId: number,
  payload: { material_ids: number[] },
): Promise<Material[]> => {
  try {
    const response = await api.post(`/api/v1/formulas/${formulaId}/materials`, payload);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error assignMaterialsToFormula', error);
    throw error;
  }
};

export const unassignMaterialsFromFormula = async (
  formulaId: number,
  payload: { material_ids: number[] },
): Promise<Material[]> => {
  try {
    const response = await api.delete(`/api/v1/formulas/${formulaId}/materials`, {
      data: payload,
    });
    return response.data;
  } catch (error: unknown) {
    console.warn('API error unassignMaterialsFromFormula', error);
    throw error;
  }
};

