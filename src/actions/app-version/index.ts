import api from '@/utils/api';
import type { AppVersionItem, AppVersionQueryParams, LatestAppVersionResponse } from '@/types';

export interface AppVersionListResponse {
  items: AppVersionItem[];
  meta: {
    next: boolean;
    total: number;
    offset: number;
    limit: number;
  };
}

// Lấy danh sách các phiên bản đã phát hành
export const getAppVersions = async (params?: AppVersionQueryParams): Promise<AppVersionListResponse> => {
  try {
    const res = await api.get('/api/v1/app-versions', { params });
    return res.data;
  } catch {
    throw new Error('Lỗi khi lấy danh sách phiên bản ứng dụng');
  }
};

// Lấy phiên bản mới nhất theo nền tảng
export const getLatestAppVersion = async (platform: string = 'android'): Promise<LatestAppVersionResponse> => {
  try {
    const res = await api.get('/api/v1/app-versions/latest', { params: { platform } });
    return res.data;
  } catch {
    throw new Error('Lỗi khi lấy phiên bản ứng dụng mới nhất');
  }
};

// Phát hành phiên bản mới (upload file APK)
export const createAppVersion = async (formData: FormData): Promise<AppVersionItem> => {
  try {
    const res = await api.post('/api/v1/app-versions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { detail?: string } } };
    throw new Error(err.response?.data?.detail || 'Lỗi khi phát hành phiên bản mới');
  }
};
