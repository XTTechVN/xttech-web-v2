import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  NewsArticle,
  NewsArticleCreate,
  NewsArticleStatusUpdate,
  NewsArticleUpdate,
  NewsComment,
  NewsCommentCreate,
  NewsCommentQueryParams,
  NewsLikeRequest,
  NewsLikeResponse,
  NewsQueryParams,
  PublicNewsQueryParams,
} from '@/types';

const normalizePaginatedResponse = <T>(rawData: {
  items?: T[];
  meta?: { total?: number; offset?: number; limit?: number; next?: boolean };
}): BaseResponseWithPagination<T> => ({
  items: rawData?.items || [],
  meta: {
    total: rawData?.meta?.total ?? 0,
    offset: rawData?.meta?.offset ?? 0,
    limit: rawData?.meta?.limit ?? 10,
    next: rawData?.meta?.next ?? false,
  },
});

export const getPublicNewsList = async (
  params?: PublicNewsQueryParams,
): Promise<BaseResponseWithPagination<NewsArticle>> => {
  const response = await api.get('/api/v1/news/public', { params });
  return normalizePaginatedResponse<NewsArticle>(response.data);
};

export const getPublicNewsBySlug = async (slug: string): Promise<NewsArticle> => {
  const response = await api.get(`/api/v1/news/public/${encodeURIComponent(slug)}`);
  return response.data;
};

export const togglePublicNewsLike = async (
  slug: string,
  data: NewsLikeRequest,
): Promise<NewsLikeResponse> => {
  const response = await api.post(`/api/v1/news/public/${encodeURIComponent(slug)}/like`, data);
  return response.data;
};

export const getPublicNewsComments = async (
  slug: string,
  params?: NewsCommentQueryParams,
): Promise<BaseResponseWithPagination<NewsComment>> => {
  const response = await api.get(`/api/v1/news/public/${encodeURIComponent(slug)}/comments`, {
    params,
  });
  return normalizePaginatedResponse<NewsComment>(response.data);
};

export const createPublicNewsComment = async (
  slug: string,
  data: NewsCommentCreate,
): Promise<NewsComment> => {
  const response = await api.post(`/api/v1/news/public/${encodeURIComponent(slug)}/comments`, data);
  return response.data;
};

export const getAdminNewsList = async (
  params?: NewsQueryParams,
): Promise<BaseResponseWithPagination<NewsArticle>> => {
  const response = await api.get('/api/v1/news', { params });
  return normalizePaginatedResponse<NewsArticle>(response.data);
};

export const getAdminNewsDetail = async (articleId: number): Promise<NewsArticle> => {
  const response = await api.get(`/api/v1/news/${articleId}`);
  return response.data;
};

export const getAdminNewsComments = async (
  articleId: number,
  params?: NewsCommentQueryParams,
): Promise<BaseResponseWithPagination<NewsComment>> => {
  const response = await api.get(`/api/v1/news/${articleId}/comments`, { params });
  return normalizePaginatedResponse<NewsComment>(response.data);
};

export const createNewsArticle = async (
  data: NewsArticleCreate,
  file?: File | null,
  mediaFiles?: File[],
): Promise<NewsArticle> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (file) {
    formData.append('file', file);
  }
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((mediaFile) => {
      formData.append('media_files', mediaFile);
    });
  }
  const response = await api.post('/api/v1/news', formData);
  return response.data;
};

export const updateNewsArticle = async (
  id: number,
  data: NewsArticleUpdate,
  file?: File | null,
  mediaFiles?: File[],
): Promise<NewsArticle> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (file) {
    formData.append('file', file);
  }
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((mediaFile) => {
      formData.append('media_files', mediaFile);
    });
  }
  const response = await api.put(`/api/v1/news/${id}`, formData);
  return response.data;
};

export const updateNewsArticleStatus = async (
  id: number,
  data: NewsArticleStatusUpdate,
): Promise<NewsArticle> => {
  const response = await api.patch(`/api/v1/news/${id}/status`, data);
  return response.data;
};

export const deleteNewsArticle = async (id: number): Promise<NewsArticle> => {
  const response = await api.delete(`/api/v1/news/${id}`);
  return response.data;
};

export const deleteNewsComment = async (commentId: number): Promise<NewsComment> => {
  const response = await api.delete(`/api/v1/news/comments/${commentId}`);
  return response.data;
};
