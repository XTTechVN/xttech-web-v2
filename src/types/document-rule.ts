import type { DocumentItem } from './document';

// Góc nhìn danh sách cơ chế (khớp RulesScope ở backend)
export type RulesScope = 'all' | 'mine' | 'department' | 'company' | 'user' | 'drafts' | 'to_process';

export type RulesViewMode = 'grid' | 'list';

export interface GetDocumentRulesParams {
  scope?: RulesScope;
  documentTypes?: string;
  status?: string;
  isRead?: boolean;
  expiringSoon?: boolean;
  departmentIds?: string;
  recipientUserIds?: string;
  search?: string;
  offset?: number;
  limit?: number;
}

export interface DocumentRulesResponse {
  items: DocumentItem[];
  total: number;
  offset: number;
  limit: number;
}

export interface DocumentRulesSummary {
  unreadCount: number;
  draftCount: number;
  pendingActionCount: number;
  expiringSoonCount: number;
  publishedCount?: number;
  readRate?: number;
}

export interface DocumentApprovalLog {
  id: number;
  documentId: number;
  action: string;
  note?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    fullName: string;
    username?: string;
    email?: string;
    avatar?: string | null;
  } | null;
}

export interface PublishDocumentPayload {
  shareScope: 'all' | 'department' | 'user';
  effectiveDate?: string;
  supersedesId?: number | null;
  recipientUserIds?: string[];
  recipientDepartmentIds?: number[];
}

export interface ReviewDocumentPayload {
  approvalStatus: 'approved' | 'rejected';
  approvalNote?: string;
}

// Nhãn hành động trong lịch sử phê duyệt (backend trả mã tiếng Anh)
export const APPROVAL_ACTION_MAP: Record<string, string> = {
  submitted: 'Đã gửi duyệt',
  approved: 'Đã phê duyệt',
  rejected: 'Đã từ chối',
  published: 'Đã ban hành',
  superseded: 'Đã thay thế văn bản cũ',
  expired: 'Hết hiệu lực',
};

// Nhãn các tab / chip của trang cơ chế
export const RULES_SCOPE_LABEL_MAP: Record<RulesScope, string> = {
  all: 'Tất cả',
  company: 'Toàn công ty',
  department: 'Theo phòng ban',
  user: 'Theo cá nhân',
  mine: 'Gửi cho tôi',
  drafts: 'Soạn thảo',
  to_process: 'Chờ tôi xử lý',
};

// Loại cơ chế hiển thị trong bộ lọc (announcement đã bao gồm notice cũ)
export const RULE_FILTER_TYPES: string[] = [
  'regulation',
  'rule',
  'policy',
  'procedure',
  'decision',
  'announcement',
  'guideline',
  'standard',
  'norm',
];
