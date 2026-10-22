import axios from 'axios';
import api from '@/utils/api';
import type {
  AdvanceProgressPayload,
  CuttingPlan,
  ProductionSheet,
  ReturnOffcutsResult,
} from '@/types';

const orderUrl = (projectId: number, orderId: number): string =>
  `/api/v1/projects/${projectId}/production-orders/${orderId}`;

// Lệnh chưa có kế hoạch cắt -> backend trả 404: coi là "chưa có" thay vì lỗi
export const getCuttingPlan = async (
  projectId: number,
  orderId: number,
): Promise<CuttingPlan | null> => {
  try {
    const response = await api.get(`${orderUrl(projectId, orderId)}/cutting-plan`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};

export const createCuttingPlan = async (
  projectId: number,
  orderId: number,
): Promise<CuttingPlan> => {
  const response = await api.post(`${orderUrl(projectId, orderId)}/cutting-plan`);
  return response.data;
};

export const issueCuttingPlan = async (
  projectId: number,
  orderId: number,
): Promise<CuttingPlan> => {
  const response = await api.post(`${orderUrl(projectId, orderId)}/cutting-plan/issue`);
  return response.data;
};

export const returnCuttingOffcuts = async (
  projectId: number,
  orderId: number,
  barIds: number[],
): Promise<ReturnOffcutsResult> => {
  const response = await api.post(`${orderUrl(projectId, orderId)}/cutting-plan/return-offcuts`, {
    barIds,
  });
  return response.data;
};

export const advanceDoorProgress = async (
  projectId: number,
  data: AdvanceProgressPayload,
): Promise<void> => {
  await api.post(`/api/v1/projects/${projectId}/positions/advance-progress`, data);
};

export const uploadProgressEvidence = async (
  projectId: number,
  file: File,
): Promise<{ url: string; name: string; type: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(
    `/api/v1/projects/${projectId}/positions/upload-evidence`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
};


export const getProductionOrderSheets = async (
  projectId: number,
  orderId: number,
): Promise<ProductionSheet[]> => {
  const response = await api.get(`${orderUrl(projectId, orderId)}/sheets`);
  return response.data;
};

export const getProductionOrderItemSheet = async (
  projectId: number,
  orderId: number,
  itemId: number,
): Promise<ProductionSheet> => {
  const response = await api.get(`${orderUrl(projectId, orderId)}/items/${itemId}/sheet`);
  return response.data;
};
