import api from '@/utils/api';
import type { BaseResponseWithPagination, GlassGrilleConfig } from '@/components';

export interface BrassPatternItem {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  patternData: Partial<GlassGrilleConfig>;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrassPatternCreate {
  name: string;
  description?: string;
  patternData: Partial<GlassGrilleConfig>;
}

export interface BrassPatternQueryParams {
  search?: string;
  limit?: number;
  offset?: number;
  isSystem?: boolean;
  isActive?: boolean;
}

export const getBrassPatterns = async (
  params?: BrassPatternQueryParams,
): Promise<BaseResponseWithPagination<BrassPatternItem>> => {
  try {
    const response = await api.get('/api/v1/brass-patterns', { params });
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
    console.warn('API error getBrassPatterns', error);
    throw error;
  }
};

export const createBrassPattern = async (data: BrassPatternCreate): Promise<BrassPatternItem> => {
  try {
    const response = await api.post('/api/v1/brass-patterns', data);
    return response.data;
  } catch (error) {
    console.warn('API error createBrassPattern', error);
    throw error;
  }
};

export const deleteBrassPattern = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/brass-patterns/${id}`);
  } catch (error) {
    console.warn('API error deleteBrassPattern', error);
    throw error;
  }
};
