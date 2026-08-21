/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/utils/api';
import type { AuditLog, AuditLogQueryParams } from '@/types';
import type { BaseResponseWithPagination } from '@/components';

export const getAuditLogs = async (
  params?: AuditLogQueryParams
): Promise<BaseResponseWithPagination<AuditLog>> => {
  try {
    const response = await api.get('/api/v1/logs', { params });
    const { items, pagination, meta } = response.data || {};
    const pageMeta = meta || pagination;
    const rawItems = items || (Array.isArray(response.data) ? response.data : []);
    return {
      items: rawItems,
      meta: {
        total: pageMeta?.total ?? rawItems.length,
        offset: pageMeta?.offset ?? 0,
        limit: pageMeta?.limit ?? 100,
        next: pageMeta?.next ?? false,
      },
    };
  } catch (error: any) {
    console.warn('Lỗi khi lấy danh sách lịch sử hoạt động:', error.message || error);
    throw error;
  }
};

export const getAuditLog = async (id: number | string): Promise<AuditLog> => {
  try {
    const response = await api.get(`/api/v1/logs/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn('Lỗi khi lấy chi tiết lịch sử hoạt động:', error.message || error);
    throw error;
  }
};
