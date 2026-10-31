import api from '@/utils/api';
import { downloadOrShareBlob, getFilenameFromContentDisposition } from '@/utils';
import type { BaseResponseWithPagination } from '@/components';
import type {
  ProfileBar,
  ProfileBarCreate,
  ProfileBarUpdate,
  ProfileBarQueryParams,
  ProfileSection,
  ProfileSectionCreate,
  ProfileSectionUpdate,
  ProfileSectionQueryParams,
  ProfileBarExcelPreviewResponse,
  ProfileBarBulkUpsertRequest,
  MaterialBulkUpsertResponse,
} from '@/types';

// Profile Bars
export const getProfileBars = async (
  params?: ProfileBarQueryParams,
): Promise<BaseResponseWithPagination<ProfileBar>> => {
  try {
    const response = await api.get('/api/v1/profile-bars', { params });
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
    console.warn('API error getProfileBars', error);
    throw error;
  }
};

export const getProfileBar = async (id: number): Promise<ProfileBar> => {
  try {
    const response = await api.get(`/api/v1/profile-bars/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error getProfileBar', error);
    throw error;
  }
};

export const createProfileBar = async (data: ProfileBarCreate): Promise<ProfileBar> => {
  try {
    const response = await api.post('/api/v1/profile-bars', data);
    return response.data;
  } catch (error) {
    console.warn('API error createProfileBar', error);
    throw error;
  }
};

export const updateProfileBar = async (id: number, data: ProfileBarUpdate): Promise<ProfileBar> => {
  try {
    const response = await api.put(`/api/v1/profile-bars/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateProfileBar', error);
    throw error;
  }
};

export const deleteProfileBar = async (id: number): Promise<ProfileBar> => {
  try {
    const response = await api.delete(`/api/v1/profile-bars/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteProfileBar', error);
    throw error;
  }
};

// Profile Bars Excel Export / Preview / Bulk Upsert
export const exportProfileBarsExcel = async (params?: {
  brandId?: number | null;
  seriesId?: number | null;
  templateOnly?: boolean;
}): Promise<void> => {
  try {
    const query: Record<string, unknown> = {};
    if (params?.brandId) query.brand_id = params.brandId;
    if (params?.seriesId) query.series_id = params.seriesId;
    if (params?.templateOnly) query.template_only = true;

    const response = await api.get('/api/v1/profile-bars/excel/export', {
      params: query,
      responseType: 'blob',
    });
    const disposition = response.headers['content-disposition'];
    const fallback = params?.templateOnly ? 'mau_nhap_thanh_profile.xlsx' : 'danh_sach_thanh_profile.xlsx';
    const fileName = getFilenameFromContentDisposition(disposition, fallback);
    await downloadOrShareBlob(response.data, fileName);
  } catch (error) {
    console.warn('API error exportProfileBarsExcel', error);
    throw error;
  }
};

export const previewProfileBarsExcel = async (file: File): Promise<ProfileBarExcelPreviewResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/profile-bars/excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.warn('API error previewProfileBarsExcel', error);
    throw error;
  }
};

export const bulkUpsertProfileBars = async (
  payload: ProfileBarBulkUpsertRequest,
): Promise<MaterialBulkUpsertResponse> => {
  try {
    const response = await api.post('/api/v1/profile-bars/excel/bulk-upsert', payload);
    return response.data;
  } catch (error) {
    console.warn('API error bulkUpsertProfileBars', error);
    throw error;
  }
};

// Profile Sections
export const getProfileSections = async (
  params?: ProfileSectionQueryParams,
): Promise<ProfileSection[]> => {
  try {
    const response = await api.get('/api/v1/profile-sections', {
      params: { limit: 500, ...params },
    });
    return response.data?.items || (Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.warn('API error getProfileSections', error);
    throw error;
  }
};

export const createProfileSection = async (data: ProfileSectionCreate): Promise<ProfileSection> => {
  try {
    const response = await api.post('/api/v1/profile-sections', data);
    return response.data;
  } catch (error) {
    console.warn('API error createProfileSection', error);
    throw error;
  }
};

export const updateProfileSection = async (id: number, data: ProfileSectionUpdate): Promise<ProfileSection> => {
  try {
    const response = await api.put(`/api/v1/profile-sections/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateProfileSection', error);
    throw error;
  }
};

export const deleteProfileSection = async (id: number): Promise<ProfileSection> => {
  try {
    const response = await api.delete(`/api/v1/profile-sections/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error deleteProfileSection', error);
    throw error;
  }
};
