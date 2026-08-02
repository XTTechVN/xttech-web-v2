/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/utils/api';
import { Suggestion, SuggestionCreate, SuggestionQueryParams, SuggestionReviewSchema, SuggestionUpdate } from '@/types';
import { BaseResponseWithPagination } from '@/components';

export const getSuggestions = async (params?: SuggestionQueryParams): Promise<BaseResponseWithPagination<Suggestion>> => {
  try {
    const response = await api.get('/api/v1/suggestions', { params });
    const { items, pagination } = response.data;
    return {
      items: items || [],
      meta: {
        total: pagination?.total ?? 0,
        offset: pagination?.offset ?? 0,
        limit: pagination?.limit ?? 10,
        next: pagination?.next ?? false,
      },
    };
  } catch (error: any) {
    console.warn('API error, using localStorage mock data:', error.message || error);
    throw error;
  }
};

export const getSuggestion = async (id: number) => {
  try {
    const response = await api.get(`/api/v1/suggestions/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn('API error, fetching single suggestion from mock data:', error.message || error);
    throw error;
  }
};

export const createSuggestion = async (data: SuggestionCreate, files?: File[], onUploadProgress?: (progressEvent: any) => void) => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    const response = await api.post('/api/v1/suggestions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error: any) {
    console.warn('API error, creating suggestion in mock data:', error.message || error);
    throw error;
  }
};

export const reviewSuggestion = async (id: number, data: SuggestionReviewSchema) => {
  try {
    const response = await api.post(`/api/v1/suggestions/${id}/review`, data);
    return response.data;
  } catch (error: any) {
    console.warn('API error, reviewing suggestion in mock data:', error.message || error);
    throw error;
  }
};

export const updateSuggestion = async (id: number, data: SuggestionUpdate, files?: File[], onUploadProgress?: (progressEvent: any) => void) => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    const response = await api.put(`/api/v1/suggestions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error: any) {
    console.warn('API error, updating suggestion in mock data:', error.message || error);
    throw error;
  }
};

export const deleteSuggestion = async (id: number) => {
  try {
    const response = await api.delete(`/api/v1/suggestions/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn('API error, deleting suggestion in mock data:', error.message || error);
    throw error;
  }
};
