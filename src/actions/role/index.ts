/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/utils/api';
import type { Role, RoleCreate, RoleQueryParams, RoleUpdate } from '@/types';
import type { BaseResponseWithPagination } from '@/components';

export const getRoles = async (params?: RoleQueryParams): Promise<BaseResponseWithPagination<Role>> => {
  try {
    const response = await api.get('/api/v1/roles', { params });
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
    console.warn('Lỗi khi lấy danh sách vai trò:', error.message || error);
    throw error;
  }
};

export const getRole = async (id: string | number): Promise<Role> => {
  try {
    const response = await api.get(`/api/v1/roles/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn('Lỗi khi lấy chi tiết vai trò:', error.message || error);
    throw error;
  }
};

export const createRole = async (data: RoleCreate): Promise<Role> => {
  try {
    const response = await api.post('/api/v1/roles', data);
    return response.data;
  } catch (error: any) {
    console.warn('Lỗi khi tạo vai trò:', error.message || error);
    throw error;
  }
};

export const updateRole = async (id: string | number, data: RoleUpdate): Promise<Role> => {
  try {
    const response = await api.put(`/api/v1/roles/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.warn('Lỗi khi cập nhật vai trò:', error.message || error);
    throw error;
  }
};

export const deleteRole = async (id: string | number): Promise<void> => {
  try {
    await api.delete(`/api/v1/roles/${id}`);
  } catch (error: any) {
    console.warn('Lỗi khi xóa vai trò:', error.message || error);
    throw error;
  }
};