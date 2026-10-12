import api from '@/utils/api';
import type { BaseResponseWithPagination } from '@/components';
import type { Project, ProjectCreate, ProjectDetail, ProjectQueryParams, ProjectUpdate, QuotationQueryParams, Quotation } from '@/types';

export const getProjects = async (params?: ProjectQueryParams): Promise<BaseResponseWithPagination<Project>> => {
  try {
    const response = await api.get('/api/v1/projects', { params });
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 10,
        next: meta?.next ?? false,
      },
    };
  } catch (error: unknown) {
    console.warn('API error getProjects', error);
    throw error;
  }
};

export const getProjectQuotations = async (projectId: number, params?: any): Promise<BaseResponseWithPagination<any>> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/quotations`, { params });
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 10,
        next: meta?.next ?? false,
      },
    };
  } catch (error: unknown) {
    console.warn('API error getProjectQuotations', error);
    throw error;
  }
};

export const previewProjectQuotation = async (
  projectId: number,
  data: import('@/types').ProjectQuotationPreviewRequest,
): Promise<import('@/types').ProjectQuotationPreviewResponse> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/quotations/preview`, data);
    return response.data;
  } catch (error) {
    console.warn('API error previewProjectQuotation', error);
    throw error;
  }
};

export const createProjectQuotationOfficial = async (
  projectId: number,
  data: import('@/types').ProjectQuotationCreatePayload,
): Promise<import('@/types').ProjectQuotationItem> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/quotations`, data);
    return response.data;
  } catch (error) {
    console.warn('API error createProjectQuotationOfficial', error);
    throw error;
  }
};

export const cloneProjectQuotation = async (
  projectId: number,
  quotationId: number,
  newName?: string,
): Promise<import('@/types').ProjectQuotationItem> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/quotations/${quotationId}/clone`, {
      newName: newName || 'Bản sao báo giá',
    });
    return response.data;
  } catch (error) {
    console.warn('API error cloneProjectQuotation', error);
    throw error;
  }
};

export const selectProjectQuotation = async (
  projectId: number,
  quotationId: number,
): Promise<import('@/types').ProjectQuotationItem> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/quotations/${quotationId}/select`);
    return response.data;
  } catch (error) {
    console.warn('API error selectProjectQuotation', error);
    throw error;
  }
};


export const getProject = async (id: number): Promise<ProjectDetail> => {
  try {
    const response = await api.get(`/api/v1/projects/${id}`);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as any;
    console.error('API error getProject:', axiosError.response?.data || axiosError.message || axiosError);
    throw error;
  }
};

export const createProject = async (data: ProjectCreate): Promise<Project> => {
  try {
    const response = await api.post('/api/v1/projects', data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error createProject', error);
    throw error;
  }
};

export const updateProject = async (id: number, data: ProjectUpdate): Promise<Project> => {
  try {
    const response = await api.put(`/api/v1/projects/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error updateProject', error);
    throw error;
  }
};

export const deleteProject = async (id: number): Promise<Project> => {
  try {
    const response = await api.delete(`/api/v1/projects/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.warn('API error deleteProject', error);
    throw error;
  }
};

export const getProjectActivities = async (
  projectId: number,
  params?: import('@/types').ProjectActivityQueryParams,
): Promise<BaseResponseWithPagination<import('@/types').ProjectActivity>> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/activities`, { params });
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 10,
        next: meta?.next ?? false,
      },
    };
  } catch (error: unknown) {
    console.warn('API error getProjectActivities', error);
    throw error;
  }
};

// --- Module 002: Tầng & Vị trí cửa ---

export const getProjectFloors = async (
  projectId: number,
): Promise<import('@/types').ProjectFloor[]> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/floors`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.warn('API error getProjectFloors', error);
    throw error;
  }
};

export const createProjectFloor = async (
  projectId: number,
  data: import('@/types').ProjectFloorCreate,
): Promise<import('@/types').ProjectFloor> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/floors`, data);
    return response.data;
  } catch (error) {
    console.warn('API error createProjectFloor', error);
    throw error;
  }
};

export const updateProjectFloor = async (
  projectId: number,
  floorId: number,
  data: import('@/types').ProjectFloorUpdate,
): Promise<import('@/types').ProjectFloor> => {
  try {
    const response = await api.put(`/api/v1/projects/${projectId}/floors/${floorId}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateProjectFloor', error);
    throw error;
  }
};

export const deleteProjectFloor = async (
  projectId: number,
  floorId: number,
): Promise<void> => {
  try {
    await api.delete(`/api/v1/projects/${projectId}/floors/${floorId}`);
  } catch (error) {
    console.warn('API error deleteProjectFloor', error);
    throw error;
  }
};

export const getProjectPositions = async (
  projectId: number,
  params?: { floorId?: number; status?: string; offset?: number; limit?: number; search?: string },
): Promise<BaseResponseWithPagination<import('@/types').ProjectDoorPosition>> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/positions`, { params });
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 10,
        next: meta?.next ?? false,
      },
    };
  } catch (error) {
    console.warn('API error getProjectPositions', error);
    throw error;
  }
};

export const createProjectPosition = async (
  projectId: number,
  data: import('@/types').ProjectDoorPositionCreate,
): Promise<import('@/types').ProjectDoorPosition> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/positions`, data);
    return response.data;
  } catch (error) {
    console.warn('API error createProjectPosition', error);
    throw error;
  }
};

export const bulkCreateProjectPositions = async (
  projectId: number,
  data: import('@/types').ProjectDoorPositionBulkCreate,
): Promise<import('@/types').ProjectDoorPosition[]> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/positions/bulk`, data);
    return response.data;
  } catch (error) {
    console.warn('API error bulkCreateProjectPositions', error);
    throw error;
  }
};

export const updateProjectPosition = async (
  projectId: number,
  positionId: number,
  data: import('@/types').ProjectDoorPositionUpdate,
): Promise<import('@/types').ProjectDoorPosition> => {
  try {
    const response = await api.put(`/api/v1/projects/${projectId}/positions/${positionId}`, data);
    return response.data;
  } catch (error) {
    console.warn('API error updateProjectPosition', error);
    throw error;
  }
};

export const duplicateProjectPosition = async (
  projectId: number,
  positionId: number,
  data?: import('@/types').ProjectDoorPositionDuplicate,
): Promise<import('@/types').ProjectDoorPosition> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/positions/${positionId}/duplicate`, data || {});
    return response.data;
  } catch (error) {
    console.warn('API error duplicateProjectPosition', error);
    throw error;
  }
};

export const deleteProjectPosition = async (
  projectId: number,
  positionId: number,
): Promise<void> => {
  try {
    await api.delete(`/api/v1/projects/${projectId}/positions/${positionId}`);
  } catch (error) {
    console.warn('API error deleteProjectPosition', error);
    throw error;
  }
};

export const measureProjectPosition = async (
  projectId: number,
  positionId: number,
  data: import('@/types').MeasurePositionRequest,
): Promise<import('@/types').MeasurePositionResponse> => {
  try {
    const response = await api.put(`/api/v1/projects/${projectId}/positions/${positionId}/measure`, data);
    return response.data;
  } catch (error) {
    console.warn('API error measureProjectPosition', error);
    throw error;
  }
};

// --- Module 004: Hợp đồng & Sổ cái thanh toán ---

export const getProjectContracts = async (
  projectId: number,
): Promise<BaseResponseWithPagination<import('@/types').ProjectContractItem>> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/contracts`);
    const { items, meta } = response.data;
    return {
      items: items || [],
      meta: {
        total: meta?.total ?? 0,
        offset: meta?.offset ?? 0,
        limit: meta?.limit ?? 10,
        next: meta?.next ?? false,
      },
    };
  } catch (error) {
    console.warn('API error getProjectContracts', error);
    throw error;
  }
};

export const createProjectContract = async (
  projectId: number,
  data: import('@/types').ContractCreatePayload,
): Promise<import('@/types').ProjectContractItem> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/contracts`, data);
    return response.data;
  } catch (error) {
    console.warn('API error createProjectContract', error);
    throw error;
  }
};

export const createProjectContractAppendix = async (
  projectId: number,
  data: import('@/types').ContractAppendixCreatePayload,
): Promise<import('@/types').ProjectContractItem> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/contracts/appendices`, data);
    return response.data;
  } catch (error) {
    console.warn('API error createProjectContractAppendix', error);
    throw error;
  }
};

export const signProjectContract = async (
  projectId: number,
  contractId: number,
): Promise<import('@/types').ProjectContractItem> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/contracts/${contractId}/sign`);
    return response.data;
  } catch (error) {
    console.warn('API error signProjectContract', error);
    throw error;
  }
};

export const getProjectLedgerSummary = async (
  projectId: number,
): Promise<import('@/types').ProjectLedgerSummary> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/payments/ledger-summary`);
    return response.data;
  } catch (error) {
    console.warn('API error getProjectLedgerSummary', error);
    throw error;
  }
};

export const getProjectPaymentTransactions = async (
  projectId: number,
): Promise<BaseResponseWithPagination<import('@/types').PaymentTransactionItem>> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/payments/transactions`);
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
  } catch (error) {
    console.warn('API error getProjectPaymentTransactions', error);
    throw error;
  }
};

export const createPaymentTransaction = async (
  projectId: number,
  data: import('@/types').PaymentTransactionCreatePayload,
): Promise<import('@/types').PaymentTransactionItem> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/payments/transactions`, data);
    return response.data;
  } catch (error) {
    console.warn('API error createPaymentTransaction', error);
    throw error;
  }
};

export const reversePaymentTransaction = async (
  projectId: number,
  data: import('@/types').PaymentTransactionReversalPayload,
): Promise<import('@/types').PaymentTransactionItem> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/payments/transactions/reversal`, data);
    return response.data;
  } catch (error) {
    console.warn('API error reversePaymentTransaction', error);
    throw error;
  }
};

// --- Module 005: Sản xuất, KCS & Tiến độ ---

export const getProductionOrders = async (
  projectId: number,
): Promise<BaseResponseWithPagination<import('@/types').ProductionOrder>> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/production-orders`);
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
  } catch (error) {
    console.warn('API error getProductionOrders', error);
    throw error;
  }
};

export const createProductionOrder = async (
  projectId: number,
  data: import('@/types').ProductionOrderCreatePayload,
): Promise<import('@/types').ProductionOrder> => {
  try {
    const response = await api.post(`/api/v1/projects/${projectId}/production-orders`, data);
    return response.data;
  } catch (error) {
    console.warn('API error createProductionOrder', error);
    throw error;
  }
};

export const cancelProductionOrder = async (
  projectId: number,
  orderId: number,
): Promise<void> => {
  try {
    await api.post(`/api/v1/projects/${projectId}/production-orders/${orderId}/cancel`);
  } catch (error) {
    console.warn('API error cancelProductionOrder', error);
    throw error;
  }
};

export const checkProductionOrderItems = async (
  projectId: number,
  orderId: number,
  data: { completedItemIds: number[]; kcsNotes?: string },
): Promise<import('@/types').ProductionOrder> => {
  try {
    const response = await api.put(
      `/api/v1/projects/${projectId}/production-orders/${orderId}/check-items`,
      data,
    );
    return response.data;
  } catch (error) {
    console.warn('API error checkProductionOrderItems', error);
    throw error;
  }
};

export const getProjectProgressMatrix = async (
  projectId: number,
): Promise<import('@/types').ProjectProgressMatrix> => {
  try {
    const response = await api.get(`/api/v1/projects/${projectId}/progress-matrix`);
    return response.data;
  } catch (error) {
    console.warn('API error getProjectProgressMatrix', error);
    throw error;
  }
};




