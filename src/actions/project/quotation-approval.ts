import api from '@/utils/api';
import type {
  DesignOption,
  DesignOptionCreatePayload,
  ProjectQuotationDetail,
  QuotationCustomerAcceptPayload,
  QuotationOverview,
  QuotationOverviewParams,
  SigningRequestPayload,
  SigningRequestResult,
} from '@/types';

const quotationUrl = (projectId: number, quotationId: number): string =>
  `/api/v1/projects/${projectId}/quotations/${quotationId}`;

// --- Vòng duyệt báo giá: trình -> admin duyệt -> gửi khách -> khách đồng ý / từ chối ---
export const submitQuotation = async (
  projectId: number,
  quotationId: number,
  note?: string,
): Promise<ProjectQuotationDetail> => {
  const response = await api.post(`${quotationUrl(projectId, quotationId)}/submit`, { note });
  return response.data;
};

export const approveQuotation = async (
  projectId: number,
  quotationId: number,
  note?: string,
): Promise<ProjectQuotationDetail> => {
  const response = await api.post(`${quotationUrl(projectId, quotationId)}/approve`, { note });
  return response.data;
};

export const returnQuotation = async (
  projectId: number,
  quotationId: number,
  reason: string,
): Promise<ProjectQuotationDetail> => {
  const response = await api.post(`${quotationUrl(projectId, quotationId)}/return`, { reason });
  return response.data;
};

export const requestQuotationSigning = async (
  projectId: number,
  quotationId: number,
  data: SigningRequestPayload = {},
): Promise<SigningRequestResult> => {
  const response = await api.post(`${quotationUrl(projectId, quotationId)}/signing-requests`, data);
  return response.data;
};

export const customerAcceptQuotation = async (
  projectId: number,
  quotationId: number,
  data: QuotationCustomerAcceptPayload = {},
): Promise<ProjectQuotationDetail> => {
  const response = await api.post(`${quotationUrl(projectId, quotationId)}/customer-accept`, data);
  return response.data;
};

export const customerRejectQuotation = async (
  projectId: number,
  quotationId: number,
  reason: string,
): Promise<ProjectQuotationDetail> => {
  const response = await api.post(`${quotationUrl(projectId, quotationId)}/customer-reject`, { reason });
  return response.data;
};

// --- Admin: toàn bộ báo giá của hệ thống ---
export const getQuotationOverview = async (
  params: QuotationOverviewParams = {},
): Promise<QuotationOverview> => {
  const response = await api.get('/api/v1/quotations/overview', { params });
  return response.data;
};

// --- Phương án thiết kế chào song song ---
export const getDesignOptions = async (projectId: number): Promise<DesignOption[]> => {
  const response = await api.get(`/api/v1/projects/${projectId}/design-options`);
  return response.data;
};

export const createDesignOption = async (
  projectId: number,
  data: DesignOptionCreatePayload,
): Promise<DesignOption> => {
  const response = await api.post(`/api/v1/projects/${projectId}/design-options`, data);
  return response.data;
};

export const cancelDesignOption = async (projectId: number, optionId: number): Promise<DesignOption> => {
  const response = await api.post(`/api/v1/projects/${projectId}/design-options/${optionId}/cancel`);
  return response.data;
};
