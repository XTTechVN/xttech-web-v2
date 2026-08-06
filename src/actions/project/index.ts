import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type { Project, ProjectCreate, ProjectDetail, ProjectQueryParams, ProjectUpdate } from '@/types';

export const getProjects = async (params?: ProjectQueryParams): Promise<BaseResponseWithPagination<Project>> => {
  try {
    const response = await api.get('/api/v1/projects', { params });
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
    console.warn('API error getProjects', error);
    throw error;
  }
};

export const getProject = async (id: number): Promise<ProjectDetail> => {
  try {
    const response = await api.get(`/api/v1/projects/${id}`);
    console.log('Project API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as any;
    console.error('API error getProject:', axiosError.response?.data || axiosError.message || axiosError);
    throw error;
  }
};

export const createProject = async (data: ProjectCreate): Promise<Project> => {
  try {
    const response = await api.post('/api/v1/projects', data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createProject', error);
    throw error;
  }
};

export const updateProject = async (id: number, data: ProjectUpdate): Promise<Project> => {
  try {
    const response = await api.put(`/api/v1/projects/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateProject', error);
    throw error;
  }
};

export const deleteProject = async (id: number): Promise<Project> => {
  try {
    const response = await api.delete(`/api/v1/projects/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteProject', error);
    throw error;
  }
};
