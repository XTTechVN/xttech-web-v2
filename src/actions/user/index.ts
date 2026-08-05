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

export const getUser = async () => {};
export const createUser = async () => {};
export const updateUser = async (): Promise<User> => {
  try {
    const res = await api.put(`/api/v1/users/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi cập nhật người dùng');
  }
};
export const deleteUser = async () => {};
