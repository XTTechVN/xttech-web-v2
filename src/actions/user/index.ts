import type { User } from '@/types';
import api from '@/utils/api';
export const getUsers = async (): Promise<User[]> => {
  
};
export const getUser = async () => {};
export const createUser = async () => {};
export const updateUser = async () : Promise<User> => {
  try {
    const res = await api.put(`/api/v1/users/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi cập nhật người dùng');
  }
}
export const deleteUser = async () => {};
