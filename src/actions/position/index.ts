import type { Position, Department } from '@/types';
import type { BaseResponseWithPagination } from '@/components';
import api from '@/utils/api';

// 1. Lấy danh sách vị trí
export const getPositions = async (params?: {
  offset?: number;
  limit?: number;
  search?: string;
  department_id?: number;
}): Promise<BaseResponseWithPagination<Position>> => {
  try {
    const res = await api.get<BaseResponseWithPagination<Position>>(`/api/v1/positions`, { params });
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách vị trí');
  }
};

// Lấy chi tiết 1 vị trí
export const getPosition = async (id: number): Promise<Position> => {
  try {
    const res = await api.get<Position>(`/api/v1/positions/${id}`);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi lấy thông tin vị trí');
  }
};

// 2. Tạo mới vị trí (Main Resource convention)
export const createPosition = async (
  position: Omit<Position, 'id' | 'createdAt' | 'updatedAt'>
) => {

  try {
    const res = await api.post(`/api/v1/positions`, position);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi tạo vị trí mới');
  }
};

// 3. Cập nhật vị trí (Main Resource convention)
export const updatePosition = async (
  id: number,
  data: Partial<Omit<Position, 'id' | 'createdAt' | 'updatedAt'>>
) => {
  try {
    const res = await api.put(`/api/v1/positions/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi cập nhật vị trí');
  }
};

// 4. Xóa vị trí (Main Resource convention)
export const deletePosition = async (id: number) => {
  try {
    const res = await api.delete(`/api/v1/positions/${id}`);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi xóa vị trí');
  }
};