import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  ProfileBar,
  ProfileBarCreate,
  ProfileBarUpdate,
  ProfileBarQueryParams,
  ProfileSection,
  ProfileSectionCreate,
  ProfileSectionUpdate,
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

// Profile Sections
export const getProfileSections = async (): Promise<ProfileSection[]> => {
  try {
    const response = await api.get('/api/v1/profile-sections');
    return response.data?.items || response.data || [];
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
