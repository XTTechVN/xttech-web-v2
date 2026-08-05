import type { Position } from '@/types';
import api from '@/utils/api';

// 1. Lấy phòng ban kèm danh sách vị trí (Sub-resource convention)
export const getDepartmentPositions = async (departmentId: number) => {
  try {
    const res = await api.get(`/api/v1/departments/${departmentId}`);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách vị trí theo phòng ban');
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