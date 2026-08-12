import type { Position, Department } from '@/types';
import api from '@/utils/api';

// 1. Lấy phòng ban kèm danh sách vị trí (Sub-resource convention)
export const getDepartmentPositions = async (departmentId: number, params?: { offset?: number; limit?: number; search?: string }) => {
  try {
    const res = await api.get(`/api/v1/departments/${departmentId}/positions`, { params });
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi lấy danh sách vị trí theo phòng ban');
  }
};
