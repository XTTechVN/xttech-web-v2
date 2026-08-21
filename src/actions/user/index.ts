/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User, UserQueryParams } from '@/types';
import api from '@/utils/api';

export interface GetUsersResponse {
  items: User[];
  pagination: {
    next: boolean;
    total: number;
    offset: number;
    limit: number;
  };
}

export const getUsers = async (params?: UserQueryParams): Promise<GetUsersResponse> => {
  try {
    const res = await api.get<GetUsersResponse>(`/api/v1/users`, { params });
    return res.data;
  } catch (error) {
    console.log('Lỗi khi lấy dữ liệu danh sách người dùng:', error);
    throw new Error('Lỗi khi lấy dữ liệu danh sách người dùng');
  }
};

export const getUser = async (id: string): Promise<User> => {
  try {
    const res = await api.get<User>(`/api/v1/users/${id}`);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    throw new Error('Lỗi khi lấy thông tin người dùng');
  }
};

export const createUser = async (data: any, file?: File): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append('create_data', JSON.stringify(data));
    if (file) {
      formData.append('file', file);
    }
    const res = await api.post<User>(`/api/v1/users`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi tạo người dùng:', error);
    throw error;
  }
};

export const updateUser = async (id: string, data: any): Promise<User> => {
  try {
    const res = await api.put(`/api/v1/users/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật người dùng:', error);
    throw new Error('Lỗi khi cập nhật người dùng');
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/v1/users/${id}`);
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    throw new Error('Lỗi khi xóa người dùng');
  }
};

export const assignRole = async (id: string, roleIds: string[]): Promise<any> => {
  try {
    const res = await api.post(`/api/v1/users/${id}/roles`, roleIds);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi gán vai trò người dùng:', error);
    throw error;
  }
};

export const revokeRole = async (id: string, roleIds: string[]): Promise<any> => {
  try {
    const res = await api.delete(`/api/v1/users/${id}/roles`, { data: roleIds });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi thu hồi quyền người dùng:', error);
    throw error;
  }
};

export const setUserPositions = async (id: string, positionIds: number[]): Promise<any> => {
  try {
    const res = await api.put(`/api/v1/users/${id}/positions`, positionIds);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật chức vụ người dùng:', error);
    throw error;
  }
};

export const assignPositions = async (id: string, positionIds: number[]): Promise<any> => {
  try {
    const res = await api.post(`/api/v1/users/${id}/positions`, positionIds);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi gán chức vụ người dùng:', error);
    throw error;
  }
};

export const revokePositions = async (id: string, positionIds: number[]): Promise<any> => {
  try {
    const res = await api.delete(`/api/v1/users/${id}/positions`, { data: positionIds });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi gỡ chức vụ người dùng:', error);
    throw error;
  }
};



