import type { Department } from '@/types';
import api from '@/utils/api';

// Lấy danh sách phòng ban
export const getDepartments = async (params?: { offset?: number; limit?: number; search?: string }) => {
  try {
    const res = await api.get(`/api/v1/departments`, { params });
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi lấy dữ liệu danh sách phòng ban');
  }
};

// Tạo mới phòng ban
export const createDepartment = async (department: Omit<Department, 'id' | 'createdAt'>) => {
  try {
    const res = await api.post(`/api/v1/department`, department);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi hệ thống');
  }
};
