/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/utils/api';
import {
  LeaveRequest,
  LeaveRequestCreate,
  LeaveRequestUpdate,
  LeaveRequestReview,
  LeaveRequestsQueryParams,
} from '@/types';
import { BaseResponseWithPagination } from '@/components';

// Lấy danh sách đơn xin nghỉ phép
export const getLeaveRequests = async (
  params?: LeaveRequestsQueryParams,
): Promise<BaseResponseWithPagination<LeaveRequest>> => {
  try {
    const response = await api.get('/api/v1/leave-requests', { params });
    const { items, pagination, meta } = response.data;
    const pageMeta = meta || pagination;
    return {
      items: items || [],
      meta: {
        total: pageMeta?.total ?? 0,
        offset: pageMeta?.offset ?? 0,
        limit: pageMeta?.limit ?? 10,
        next: pageMeta?.next ?? false,
      },
    };
  } catch (error: any) {
    console.warn('API getLeaveRequests error:', error.message || error);
    throw error;
  }
};

// Lấy thông tin chi tiết một đơn xin nghỉ phép
export const getLeaveRequest = async (id: string): Promise<LeaveRequest> => {
  try {
    const response = await api.get(`/api/v1/leave-requests/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn('API getLeaveRequest error:', error.message || error);
    throw error;
  }
};

// Tạo mới đơn xin nghỉ phép kèm file đính kèm
export const createLeaveRequest = async (
  data: LeaveRequestCreate,
  file?: File | null,
  onUploadProgress?: (progressEvent: any) => void,
): Promise<LeaveRequest> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (file) {
      formData.append('file', file);
    }

    const response = await api.post('/api/v1/leave-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error: any) {
    console.warn('API createLeaveRequest error:', error.message || error);
    throw error;
  }
};

// Cập nhật đơn xin nghỉ phép (khi đang ở trạng thái pending)
export const updateLeaveRequest = async (
  id: string,
  data: LeaveRequestUpdate,
  file?: File | null,
  onUploadProgress?: (progressEvent: any) => void,
): Promise<LeaveRequest> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (file) {
      formData.append('file', file);
    }

    const response = await api.put(`/api/v1/leave-requests/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error: any) {
    console.warn('API updateLeaveRequest error:', error.message || error);
    throw error;
  }
};

// Hủy đơn xin nghỉ phép (khi ở trạng thái pending hoặc cancelled)
export const deleteLeaveRequest = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/api/v1/leave-requests/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn('API deleteLeaveRequest error:', error.message || error);
    throw error;
  }
};

// Duyệt hoặc từ chối đơn xin nghỉ phép (Dành riêng cho HR / Admin)
export const reviewLeaveRequest = async (
  id: string,
  data: LeaveRequestReview,
): Promise<LeaveRequest> => {
  try {
    const response = await api.post(`/api/v1/leave-requests/${id}/review`, data);
    return response.data;
  } catch (error: any) {
    console.warn('API reviewLeaveRequest error:', error.message || error);
    throw error;
  }
};
