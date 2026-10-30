import api from '@/utils/api';
import type {
  AcceptanceCreatePayload,
  EvidenceMediaItem,
  PositionQrView,
  ProgressStepCode,
  ProjectAcceptance,
  ProjectOverview,
  PublicSignPayload,
  PublicSigningView,
  ReportOverview,
  RevertProgressPayload,
  SignatureInput,
  SigningRequestPayload,
  SigningRequestResult,
  WarrantySummary,
  WarrantyVisit,
  WarrantyVisitCompletePayload,
  WarrantyVisitCreatePayload,
  WarrantyVisitUpdatePayload,
} from '@/types';

const projectUrl = (projectId: number): string => `/api/v1/projects/${projectId}`;

// --- Tổng quan & báo cáo ---
export const getProjectOverview = async (projectId: number): Promise<ProjectOverview> => {
  const response = await api.get(`${projectUrl(projectId)}/overview`);
  return response.data;
};

export const getReportOverview = async (): Promise<ReportOverview> => {
  const response = await api.get('/api/v1/reports/overview');
  return response.data;
};

// --- Tiến độ: lùi mốc (admin) ---
export const revertDoorProgress = async (
  projectId: number,
  data: RevertProgressPayload,
): Promise<void> => {
  await api.post(`${projectUrl(projectId)}/positions/revert-progress`, data);
};

// --- Ký hợp đồng online ---
export const requestContractSigning = async (
  projectId: number,
  contractId: number,
  data: SigningRequestPayload = {},
): Promise<SigningRequestResult> => {
  const response = await api.post(
    `${projectUrl(projectId)}/contracts/${contractId}/signing-requests`,
    data,
  );
  return response.data;
};

// --- Nghiệm thu ---
export const getProjectAcceptances = async (projectId: number): Promise<ProjectAcceptance[]> => {
  const response = await api.get(`${projectUrl(projectId)}/acceptances`);
  return response.data;
};

export const createProjectAcceptance = async (
  projectId: number,
  data: AcceptanceCreatePayload,
): Promise<ProjectAcceptance> => {
  const response = await api.post(`${projectUrl(projectId)}/acceptances`, data);
  return response.data;
};

export const signAcceptanceOnsite = async (
  projectId: number,
  acceptanceId: number,
  customerSignature: SignatureInput,
): Promise<ProjectAcceptance> => {
  const response = await api.post(
    `${projectUrl(projectId)}/acceptances/${acceptanceId}/customer-sign`,
    { customerSignature },
  );
  return response.data;
};

export const sendAcceptanceSigningLink = async (
  projectId: number,
  acceptanceId: number,
  data: SigningRequestPayload = {},
): Promise<SigningRequestResult> => {
  const response = await api.post(
    `${projectUrl(projectId)}/acceptances/${acceptanceId}/signing-link`,
    data,
  );
  return response.data;
};

export const cancelProjectAcceptance = async (
  projectId: number,
  acceptanceId: number,
): Promise<ProjectAcceptance> => {
  const response = await api.post(`${projectUrl(projectId)}/acceptances/${acceptanceId}/cancel`);
  return response.data;
};

// --- Bảo hành ---
export const getProjectWarranty = async (projectId: number): Promise<WarrantySummary> => {
  const response = await api.get(`${projectUrl(projectId)}/warranty`);
  return response.data;
};

export const updateWarrantySettings = async (
  projectId: number,
  warrantyMonths: number,
): Promise<WarrantySummary> => {
  const response = await api.put(`${projectUrl(projectId)}/warranty/settings`, { warrantyMonths });
  return response.data;
};

export const createWarrantyVisit = async (
  projectId: number,
  data: WarrantyVisitCreatePayload,
): Promise<WarrantyVisit> => {
  const response = await api.post(`${projectUrl(projectId)}/warranty/visits`, data);
  return response.data;
};

export const updateWarrantyVisit = async (
  projectId: number,
  visitId: number,
  data: WarrantyVisitUpdatePayload,
): Promise<WarrantyVisit> => {
  const response = await api.patch(`${projectUrl(projectId)}/warranty/visits/${visitId}`, data);
  return response.data;
};

export const startWarrantyVisit = async (
  projectId: number,
  visitId: number,
): Promise<WarrantyVisit> => {
  const response = await api.post(`${projectUrl(projectId)}/warranty/visits/${visitId}/start`);
  return response.data;
};

export const completeWarrantyVisit = async (
  projectId: number,
  visitId: number,
  data: WarrantyVisitCompletePayload,
): Promise<WarrantyVisit> => {
  const response = await api.post(
    `${projectUrl(projectId)}/warranty/visits/${visitId}/complete`,
    data,
  );
  return response.data;
};

export const cancelWarrantyVisit = async (
  projectId: number,
  visitId: number,
  reason: string,
): Promise<WarrantyVisit> => {
  const response = await api.post(`${projectUrl(projectId)}/warranty/visits/${visitId}/cancel`, {
    reason,
  });
  return response.data;
};

// --- Trang công khai (không cần đăng nhập): ký online & quét QR ---
export const getPublicSigningView = async (token: string): Promise<PublicSigningView> => {
  const response = await api.get(`/api/v1/public/signing/${token}`);
  return response.data;
};

export const submitPublicSignature = async (
  token: string,
  data: PublicSignPayload,
): Promise<PublicSigningView> => {
  const response = await api.post(`/api/v1/public/signing/${token}/sign`, data);
  return response.data;
};

export const getPositionQrView = async (token: string): Promise<PositionQrView> => {
  const response = await api.get(`/api/v1/projects/positions/by-qr/${token}`);
  return response.data;
};

export const advanceDoorByQr = async (
  token: string,
  data: { targetStep?: ProgressStepCode; note?: string; evidenceMedia?: EvidenceMediaItem[] },
): Promise<void> => {
  // Bộ cửa do backend suy ra từ token QR
  await api.post(`/api/v1/projects/positions/by-qr/${token}/progress`, data);
};

// Ảnh QR (PNG) cần Bearer token nên tải dạng blob rồi tạo object URL
export const getPositionQrImage = async (projectId: number, positionId: number): Promise<string> => {
  const response = await api.get(`${projectUrl(projectId)}/positions/${positionId}/qr`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(response.data);
};
