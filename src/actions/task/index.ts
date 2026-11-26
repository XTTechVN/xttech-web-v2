import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type {
  StaffTask,
  StaffTaskBatchCreateResponse,
  StaffTaskBulkCompletePayload,
  StaffTaskBulkCompleteResponse,
  StaffTaskCompletePayload,
  StaffTaskCreatePayload,
  StaffTaskQueryParams,
  StaffTaskReopenPayload,
  StaffTaskScope,
  StaffTaskSummary,
  StaffTaskUpdatePayload,
} from '@/types';

export const getStaffTasks = async (
  params?: StaffTaskQueryParams,
): Promise<BaseResponseWithPagination<StaffTask>> => {
  const response = await api.get('/api/v1/tasks', { params });
  const { items, meta } = response.data;
  return {
    items: items || [],
    meta: {
      total: meta?.total ?? 0,
      offset: meta?.offset ?? 0,
      limit: meta?.limit ?? 20,
      next: meta?.next ?? false,
    },
  };
};

export const getStaffTaskSummary = async (params?: {
  scope?: StaffTaskScope;
  assigneeId?: string;
  departmentId?: number;
}): Promise<StaffTaskSummary> => {
  const response = await api.get<StaffTaskSummary>('/api/v1/tasks/summary', { params });
  return response.data;
};

export const getStaffTask = async (taskId: number): Promise<StaffTask> => {
  const response = await api.get<StaffTask>(`/api/v1/tasks/${taskId}`);
  return response.data;
};

export const createStaffTasks = async (
  data: StaffTaskCreatePayload,
): Promise<StaffTaskBatchCreateResponse> => {
  const response = await api.post<StaffTaskBatchCreateResponse>('/api/v1/tasks', data);
  return response.data;
};

export const updateStaffTask = async (
  taskId: number,
  data: StaffTaskUpdatePayload,
): Promise<StaffTask> => {
  const response = await api.put<StaffTask>(`/api/v1/tasks/${taskId}`, data);
  return response.data;
};

export const completeStaffTask = async (
  taskId: number,
  data: StaffTaskCompletePayload = {},
): Promise<StaffTask> => {
  const response = await api.post<StaffTask>(`/api/v1/tasks/${taskId}/complete`, data);
  return response.data;
};

export const bulkCompleteStaffTasks = async (
  data: StaffTaskBulkCompletePayload,
): Promise<StaffTaskBulkCompleteResponse> => {
  const response = await api.post<StaffTaskBulkCompleteResponse>(
    '/api/v1/tasks/bulk-complete',
    data,
  );
  return response.data;
};

export const reopenStaffTask = async (
  taskId: number,
  data: StaffTaskReopenPayload = {},
): Promise<StaffTask> => {
  const response = await api.post<StaffTask>(`/api/v1/tasks/${taskId}/reopen`, data);
  return response.data;
};

export const deleteStaffTask = async (taskId: number): Promise<StaffTask> => {
  const response = await api.delete<StaffTask>(`/api/v1/tasks/${taskId}`);
  return response.data;
};


