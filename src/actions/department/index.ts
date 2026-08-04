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
export const createDepartment = async (department: Omit<Department, 'id' | 'createdAt' | 'mainColor' | 'mainIcon'>) => {
  try {
    const res = await api.post(`/api/v1/departments`, department);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi hệ thống');
  }
};

export const deleteDepartment = async (id: number) => {
  try {
    const res = await api.delete(`/api/v1/departments/${id}`);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi hệ thống');
  }
};

// Cập nhật thông tin phòng ban
export const updateDepartment = async (id: number, data: Omit<Department, 'id' | 'createdAt' | 'mainColor' | 'mainIcon'>) => {
  try {
    const res = await api.put(`/api/v1/departments/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi cập nhật phòng ban');
  }
};
