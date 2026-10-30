import api from '@/utils/api';
import type {
  DocumentApprovalLog,
  DocumentRulesResponse,
  DocumentRulesSummary,
  GetDocumentRulesParams,
} from '@/types';
import { extractErrorMessage } from './index';

// Danh sách cơ chế theo góc nhìn (hiện hành / soạn thảo / chờ xử lý), phân trang phía server
export const getDocumentRules = async (params?: GetDocumentRulesParams): Promise<DocumentRulesResponse> => {
  try {
    const res = await api.get('/api/v1/document-rules', { params });
    return {
      items: res.data.items,
      total: res.data.meta.total,
      offset: res.data.meta.offset,
      limit: res.data.meta.limit,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách cơ chế'));
  }
};

// Số liệu badge: chưa đọc, bản nháp, chờ xử lý, sắp hết hiệu lực
export const getDocumentRulesSummary = async (): Promise<DocumentRulesSummary> => {
  try {
    const res = await api.get('/api/v1/document-rules/summary');
    return res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải số liệu cơ chế'));
  }
};

// Xác nhận "đã đọc và hiểu"
export const acknowledgeDocument = async (id: number): Promise<void> => {
  try {
    await api.post(`/api/v1/documents/${id}/acknowledge`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xác nhận đã đọc và hiểu'));
  }
};

// Lịch sử soạn thảo, duyệt, ban hành
export const getDocumentTimeline = async (id: number): Promise<DocumentApprovalLog[]> => {
  try {
    const res = await api.get(`/api/v1/documents/${id}/timeline`);
    return res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải lịch sử văn bản'));
  }
};
