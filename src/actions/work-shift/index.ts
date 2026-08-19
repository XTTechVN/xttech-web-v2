import type { WorkShiftCreate, WorkShiftUpdate, WorkShiftQueryParams } from '@/types';
import api from '@/utils/api';

// Lấy danh sách ca làm việc
export const getWorkShifts = async (params?: WorkShiftQueryParams) => {
  try {
    const res = await api.get(`/api/v1/work-shifts`, { params });
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Lỗi khi lấy danh sách ca làm việc';
    throw new Error(msg);
  }
};

// Lấy thông tin một ca làm việc
export const getWorkShift = async (id: number) => {
  try {
    const res = await api.get(`/api/v1/work-shifts/${id}`);
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Lỗi khi lấy thông tin ca làm việc';
    throw new Error(msg);
  }
};

// Tạo mới ca làm việc
export const createWorkShift = async (data: WorkShiftCreate) => {
  try {
    const res = await api.post(`/api/v1/work-shifts`, data);
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Lỗi khi tạo ca làm việc';
    throw new Error(msg);
  }
};

// Cập nhật ca làm việc
export const updateWorkShift = async (id: number, data: WorkShiftUpdate) => {
  try {
    const res = await api.put(`/api/v1/work-shifts/${id}`, data);
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Lỗi khi cập nhật ca làm việc';
    throw new Error(msg);
  }
};

// Xóa ca làm việc
export const deleteWorkShift = async (id: number) => {
  try {
    const res = await api.delete(`/api/v1/work-shifts/${id}`);
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Lỗi khi xóa ca làm việc';
    throw new Error(msg);
  }
};
