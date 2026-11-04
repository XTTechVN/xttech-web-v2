import axios from 'axios';
import { BASE_MINIO_URL } from '@/config';

export type QrPortalTabId = 'this_door' | 'project_doors' | 'claim_request' | 'warranty_book';

export const mediaUrl = (url: string): string =>
  url.startsWith('http') ? url : `${BASE_MINIO_URL}/${url.replace(/^\//, '')}`;

export const isVideoMedia = (url: string, type?: string): boolean => {
  if (type === 'video') return true;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.avi') ||
    cleanUrl.endsWith('.mkv') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.3gp')
  );
};

export const formatDateVi = (value?: string | null): string =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '—';

export const formatDateTimeVi = (value?: string | null): string =>
  value ? new Date(value).toLocaleString('vi-VN') : '—';

export const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export const getErrorMessage = (error: unknown, fallback = 'Không thể xử lý yêu cầu'): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ??
      error.response?.data?.details?.message ??
      error.response?.data?.detail ??
      fallback
    );
  }
  return fallback;
};

export const parseCommaList = (raw: string): string[] =>
  raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
