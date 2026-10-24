export interface DocumentCategory {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  parentId?: number | null;
  createdById?: string;
  createdByName?: string | null;
  isOwner?: boolean;
  permission?: 'view' | 'edit';
  shareCount?: number;
  sharedWithCount?: number;
  isShared?: boolean;
  children?: DocumentCategory[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface DocumentVersion {
  id: number;
  documentId?: number;
  versionNumber: string;
  fileName: string;
  filePath?: string;
  fileSize: number;
  fileType?: string;
  mimeType?: string;
  downloadUrl?: string;
  fileUrl?: string;
  changeSummary?: string | null;
  isCurrent: boolean;
  createdById?: string;
  createdAt: string;
}

export interface DocumentRecipient {
  id?: number;
  userId: string;
  fullName?: string;
  email?: string;
  departmentName?: string;
  avatar?: string;
  user?: { id: string; fullName: string; email?: string; avatar?: string | null } | null;
  isRead: boolean;
  readAt?: string | null;
  acknowledgedAt?: string | null;
  createdAt?: string;
}

export interface DocumentRecipientsResponse {
  totalRecipients: number;
  readCount: number;
  unreadCount: number;
  readPercentage: number;
  recipients: DocumentRecipient[];
}

export interface DocumentItem {
  id: number;
  code: string;
  title: string;
  summary?: string | null;
  documentType: string;
  status: string;
  approvalStatus: string;
  shareScope: string;
  categoryId?: number | null;
  category?: {
    id: number;
    name: string;
    code?: string;
    permission?: 'view' | 'edit';
    isShared?: boolean;
  } | null;
  permission?: 'view' | 'edit' | string;
  isOwner?: boolean;
  effectiveDate?: string | null;
  expirationDate?: string | null;
  approverId?: string | null;
  approver?: {
    id: string;
    fullName: string;
    email?: string;
  } | null;
  issuingDepartmentId?: number | null;
  issuingDepartment?: {
    id: number;
    name: string;
    code?: string;
  } | null;
  createdById?: string;
  createdBy?: {
    id: string;
    fullName: string;
    email?: string;
  } | null;
  currentVersion?: DocumentVersion | null;
  versions?: DocumentVersion[];
  recipients?: DocumentRecipient[];
  recipientDepartments?: { id: number; name: string }[];
  recipientDepartmentIds?: number[];
  savedFolders?: number[];
  approvalNote?: string | null;
  approvedAt?: string | null;
  supersededById?: number | null;
  supersededBy?: {
    id: number;
    code?: string;
    title?: string;
  } | null;
  isRead?: boolean | null;
  readAt?: string | null;
  requiresAcknowledgement?: boolean;
  isAcknowledged?: boolean | null;
  supersededByDoc?: DocumentShortInfo | null;
  supersedesId?: number | null;
  supersedesDoc?: DocumentShortInfo | null;
  supersedesDocs?: DocumentShortInfo[];
  recipientStats?: DocumentRecipientStats | null;
  canAcknowledge?: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface DocumentShortInfo {
  id: number;
  code: string;
  title: string;
  status: string;
}

export interface DocumentRecipientStats {
  totalRecipients: number;
  readCount: number;
  unreadCount: number;
}

export interface GetDocumentsParams {
  categoryId?: number;
  search?: string;
  documentType?: string;
  status?: string;
  approvalStatus?: string;
  createdById?: string;
  approverId?: string;
  startEffectiveDate?: string;
  endEffectiveDate?: string;
  offset?: number;
  limit?: number;
  isRead?: boolean;
  isDeleted?: boolean;
}

export interface GetInboxDocumentsParams {
  search?: string;
  isRead?: boolean;
  documentType?: string;
  categoryId?: number;
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetDocumentsResponse {
  items: DocumentItem[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreateDocumentCategoryPayload {
  name: string;
  code?: string;
  description?: string;
  parentId?: number | null;
}

export interface UpdateDocumentCategoryPayload {
  name?: string;
  description?: string;
  parentId?: number | null;
}

// Nhóm 1: Tài liệu ban hành (Quy chế, Quy định, Chính sách, Quy trình, Quyết định, Thông báo, Hướng dẫn, Tiêu chuẩn, Định mức)
export const RULE_DOC_TYPES = [
  'regulation',   // Quy chế
  'rule',         // Quy định
  'policy',       // Chính sách
  'procedure',    // Quy trình
  'decision',     // Quyết định
  'announcement', // Thông báo
  'notice',       // Thông báo
  'guideline',    // Hướng dẫn
  'standard',     // Tiêu chuẩn
  'norm',         // Định mức
];

// Nhóm 2: Tài liệu của tôi / Cá nhân (Báo cáo, Hợp đồng, Biểu mẫu, Khác)
export const PERSONAL_DOC_TYPES = [
  'work_report',  // Báo cáo công việc
  'report',       // Báo cáo
  'contract',     // Hợp đồng
  'form',         // Biểu mẫu
  'other',        // Khác
];

export const isRuleDocumentType = (type?: string | null): boolean => {
  if (!type) return false;
  return RULE_DOC_TYPES.includes(type);
};

export const DOCUMENT_TYPE_MAP: Record<string, { label: string; color: string; badgeClass: string }> = {
  regulation: { label: 'Quy chế', color: 'blue', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  rule: { label: 'Quy định', color: 'sky', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
  policy: { label: 'Chính sách', color: 'indigo', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  procedure: { label: 'Quy trình', color: 'cyan', badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  guideline: { label: 'Hướng dẫn', color: 'teal', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200' },
  standard: { label: 'Tiêu chuẩn', color: 'emerald', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  norm: { label: 'Định mức', color: 'amber', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  form: { label: 'Biểu mẫu', color: 'cyan', badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  decision: { label: 'Quyết định', color: 'violet', badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  announcement: { label: 'Thông báo', color: 'orange', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  notice: { label: 'Thông báo', color: 'orange', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  contract: { label: 'Hợp đồng', color: 'rose', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  work_report: { label: 'Báo cáo công việc', color: 'purple', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  report: { label: 'Báo cáo', color: 'purple', badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  other: { label: 'Khác', color: 'slate', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export const DOCUMENT_STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  draft: { label: 'Bản nháp', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending: { label: 'Chờ duyệt', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Đã duyệt', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  published: { label: 'Đã ban hành', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200' },
  archived: { label: 'Lưu trữ / Hết hạn', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  expired: { label: 'Hết hiệu lực', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  superseded: { label: 'Đã bị thay thế', badgeClass: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export const APPROVAL_STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  draft: { label: 'Soạn thảo', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending: { label: 'Chờ phê duyệt', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Đã phê duyệt', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Bị từ chối', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const SHARE_SCOPE_MAP: Record<string, string> = {
  private: 'Nội bộ cá nhân',
  department: 'Nội bộ phòng ban',
  all: 'Toàn thể công ty',
  user: 'Chỉ định cá nhân',
  internal: 'Nội bộ',
};

export const FOLDER_PERMISSION_MAP: Record<string, string> = {
  view: 'Chỉ xem và tải file',
  edit: 'Xem, tải và chỉnh sửa',
};

export interface FolderShare {
  id: number | string;
  categoryId: number;
  userId?: string | null;
  userName?: string | null;
  user?: {
    id: string;
    fullName?: string;
    email?: string;
    avatar?: string;
    phone?: string;
  } | null;
  departmentId?: number | null;
  departmentName?: string | null;
  department?: {
    id: number;
    name: string;
    code?: string;
  } | null;
  permission: 'view' | 'edit';
  createdAt?: string;
  createdById?: string;
  createdByName?: string | null;
  updatedAt?: string;
}

export interface ShareFolderPayload {
  userId?: string | null;
  departmentId?: number | null;
  permission: 'view' | 'edit';
}

