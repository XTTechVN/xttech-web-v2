import api from '@/utils/api';
import type {
  DocumentCategory,
  CreateDocumentCategoryPayload,
  UpdateDocumentCategoryPayload,
  DocumentItem,
  DocumentVersion,
  GetDocumentsParams,
  GetInboxDocumentsParams,
  GetDocumentsResponse,
  FolderShare,
  ShareFolderPayload,
  DocumentRecipientsResponse,
  PublishDocumentPayload,
} from '@/types';

export * from './rules';

// Helper trích xuất thông báo lỗi chi tiết từ backend FastAPI / validator
export const extractErrorMessage = (error: any, fallbackMessage: string): string => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallbackMessage;

  const details = data.details;
  let detailMsg = '';
  if (Array.isArray(details) && details.length > 0) {
    detailMsg = details
      .map((d: any) => {
        if (typeof d === 'string') return d;
        return d.message || d.msg || JSON.stringify(d);
      })
      .filter(Boolean)
      .join(', ');
  } else if (typeof details === 'object' && details !== null) {
    detailMsg = details.message || details.msg || '';
  }

  if (detailMsg) {
    return detailMsg;
  }
  return data.message || fallbackMessage;
};

// ==========================================
// 1. Quản lý Thư mục (Document Categories)
// ==========================================

// Lấy toàn bộ cây thư mục người dùng có quyền truy cập
export const getDocumentCategoryTree = async (): Promise<DocumentCategory[]> => {
  try {
    const res = await api.get('/api/v1/document-categories/tree');
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;

    // Backend FastAPI có thể trả về camelCase ({ myFolders, sharedFolders })
    // hoặc snake_case ({ my_folders, shared_folders })
    const treeObj = raw?.data ?? raw;
    const my = Array.isArray(treeObj?.myFolders) ? treeObj.myFolders : [];
    const shared = Array.isArray(treeObj?.sharedFolders) ? treeObj.sharedFolders : [];

    const markMyNodes = (items: DocumentCategory[]): DocumentCategory[] =>
      items.map((item: DocumentCategory) => ({
        ...item,
        isOwner: item.isOwner ?? true,
        permission: item.permission || 'edit',
        isShared: false,
        children: Array.isArray(item.children) ? markMyNodes(item.children) : [],
      }));

    const markSharedNodes = (
      items: DocumentCategory[],
      inheritedPerm: 'view' | 'edit' = 'view',
    ): DocumentCategory[] =>
      items.map((item: DocumentCategory) => {
        const perm = (item.permission as 'view' | 'edit') || inheritedPerm;
        return {
          ...item,
          isOwner: item.isOwner ?? false,
          permission: perm,
          isShared: true,
          children: Array.isArray(item.children) ? markSharedNodes(item.children, perm) : [],
        };
      });

    return [...markMyNodes(my), ...markSharedNodes(shared)];
  } catch (error: any) {
    console.warn('Lỗi getDocumentCategoryTree:', error);
    return [];
  }
};

function generateCategoryCode(name?: string): string {
  const suffix = Date.now().toString().slice(-6);
  if (!name || !name.trim()) return `DIR_${suffix}`;
  const nonAccent = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

  const slug = nonAccent
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 20);

  return slug ? `DIR_${slug}_${suffix}` : `DIR_${suffix}`;
}

// Tạo mới thư mục
export const createDocumentCategory = async (payload: CreateDocumentCategoryPayload): Promise<DocumentCategory> => {
  try {
    const code = payload.code?.trim() ? payload.code.trim().toUpperCase() : generateCategoryCode(payload.name);

    const cleanPayload: Record<string, any> = {
      name: payload.name.trim(),
      code,
    };
    if (payload.description?.trim()) cleanPayload.description = payload.description.trim();
    if (payload.parentId) cleanPayload.parentId = payload.parentId;

    const res = await api.post('/api/v1/document-categories', cleanPayload);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tạo thư mục'));
  }
};

// Cập nhật thư mục
export const updateDocumentCategory = async (id: number, payload: UpdateDocumentCategoryPayload): Promise<DocumentCategory> => {
  try {
    const res = await api.put(`/api/v1/document-categories/${id}`, payload);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể cập nhật thư mục'));
  }
};

// Xóa thư mục (Soft Delete)
export const deleteDocumentCategory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/document-categories/${id}`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xóa thư mục'));
  }
};

// ==========================================
// 2. Quản lý Tài liệu (Documents)
// ==========================================

// Lấy danh sách tài liệu với bộ lọc và phân trang
export const getDocuments = async (params?: GetDocumentsParams): Promise<GetDocumentsResponse> => {
  try {
    const res = await api.get('/api/v1/documents', { params });
    const rawData = res.data?.data ?? res.data;
    if (Array.isArray(rawData)) {
      return {
        items: rawData,
        total: rawData.length,
        offset: params?.offset || 0,
        limit: params?.limit || 10,
      };
    }
    return {
      items: rawData?.items || [],
      total: rawData?.total || 0,
      offset: rawData?.offset || 0,
      limit: rawData?.limit || 10,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách tài liệu'));
  }
};

// Lấy chi tiết một tài liệu
export const getDocumentById = async (id: number): Promise<DocumentItem> => {
  try {
    const res = await api.get(`/api/v1/documents/${id}`);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xem chi tiết tài liệu'));
  }
};

// Tạo mới tài liệu (Upload file multipart/form-data)
export const createDocument = async (formData: FormData): Promise<DocumentItem> => {
  try {
    const res = await api.post('/api/v1/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tạo mới tài liệu'));
  }
};

export interface BulkUploadDocumentsResult {
  success: boolean;
  totalFiles: number;
  uploadedCount: number;
  createdFoldersCount: number;
  documents: DocumentItem[];
}

export interface BulkUploadDocumentsPayload {
  files: File[];
  relativePaths?: string[];
  categoryId?: number | null;
  shareScope?: string;
}

// Tải lên hàng loạt tệp tin hoặc toàn bộ thư mục (giữ nguyên cấu trúc thư mục con)
export const bulkUploadDocuments = async (
  input: FormData | BulkUploadDocumentsPayload,
): Promise<BulkUploadDocumentsResult> => {
  try {
    let formData: FormData;
    if (input instanceof FormData) {
      formData = input;
    } else {
      formData = new FormData();
      input.files.forEach((file) => formData.append('files', file));
      if (input.relativePaths && input.relativePaths.length > 0) {
        formData.append('relative_paths', JSON.stringify(input.relativePaths));
      }
      if (input.categoryId !== undefined && input.categoryId !== null) {
        formData.append('category_id', String(input.categoryId));
      }
      formData.append('share_scope', input.shareScope || 'private');
    }
    const res = await api.post('/api/v1/documents/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải tệp lên'));
  }
};

export interface EnsureFoldersResult {
  success: boolean;
  folderMap: Record<string, number>;
  createdCount: number;
}

// Khởi tạo hoặc phân giải sẵn cây thư mục trước khi tải tệp song song
export const ensureDocumentFolders = async (
  baseCategoryId: number | null,
  folderPaths: string[],
): Promise<EnsureFoldersResult> => {
  try {
    const res = await api.post('/api/v1/documents/ensure-folders', {
      baseCategoryId,
      folderPaths,
    });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể khởi tạo cấu trúc thư mục'));
  }
};

// Tải lên một tệp tin đơn lẻ trong luồng hàng đợi song song
export const uploadSingleDocumentItem = async (params: {
  file: File;
  categoryId?: number | null;
  shareScope?: string;
  title?: string;
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.categoryId !== undefined && params.categoryId !== null) {
      formData.append('category_id', String(params.categoryId));
    }
    formData.append('share_scope', params.shareScope || 'private');
    if (params.title) {
      formData.append('title', params.title);
    }

    const res = await api.post('/api/v1/documents/upload-item', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: params.signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && params.onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          params.onProgress(percent);
        }
      },
    });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, `Không thể tải lên "${params.file.name}"`));
  }
};

// Tải xuống toàn bộ thư mục dưới dạng file ZIP
export const downloadCategoryZip = async (
  categoryId: number,
  categoryName: string,
  options?: {
    onProgress?: (loaded: number, total: number) => void;
    signal?: AbortSignal;
  },
): Promise<void> => {
  try {
    const res = await api.get(`/api/v1/document-categories/${categoryId}/download-zip`, {
      responseType: 'blob',
      signal: options?.signal,
      onDownloadProgress: (progressEvent) => {
        if (options?.onProgress) {
          options.onProgress(progressEvent.loaded || 0, progressEvent.total || 0);
        }
      },
    });
    const blob = new Blob([res.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${categoryName || 'folder'}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
      throw error;
    }
    throw new Error(extractErrorMessage(error, 'Không thể tải xuống thư mục'));
  }
};

// Cập nhật thông tin tài liệu
export const updateDocument = async (id: number, data: Partial<DocumentItem>): Promise<DocumentItem> => {
  try {
    const res = await api.put(`/api/v1/documents/${id}`, data);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể cập nhật tài liệu'));
  }
};

// Nhân bản tài liệu sang thư mục đích (Copy & Paste)
export const copyDocument = async (
  documentId: number,
  targetCategoryId: number | null,
  title?: string,
): Promise<DocumentItem> => {
  try {
    const res = await api.post(`/api/v1/documents/${documentId}/copy`, {
      targetCategoryId,
      ...(title ? { title } : {}),
    });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể sao chép tài liệu'));
  }
};

// Xóa tài liệu
export const deleteDocument = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/documents/${id}`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xóa tài liệu'));
  }
};

// Tạo phiên bản mới cho tài liệu (Upload new version multipart/form-data)
export const createDocumentVersion = async (documentId: number, formData: FormData): Promise<DocumentVersion> => {
  try {
    const res = await api.post(`/api/v1/documents/${documentId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể tải lên phiên bản mới'));
  }
};

// Đánh dấu đã đọc
export const markDocumentAsRead = async (id: number): Promise<void> => {
  try {
    await api.post(`/api/v1/documents/${id}/read`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể đánh dấu đã đọc'));
  }
};

// Lưu vào thư mục cá nhân (Lối tắt / Shortcut)
export const saveDocumentToFolder = async (documentId: number, categoryId: number): Promise<void> => {
  try {
    await api.post(`/api/v1/documents/${documentId}/save-to-folder`, { categoryId });
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể lưu vào thư mục'));
  }
};

// Gỡ tài liệu khỏi thư mục cá nhân (Gỡ lối tắt)
export const removeDocumentFromFolder = async (documentId: number, categoryId: number): Promise<void> => {
  try {
    await api.delete(`/api/v1/documents/${documentId}/remove-from-folder/${categoryId}`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể gỡ khỏi thư mục'));
  }
};

// ==========================================
// 3. Phân quyền chia sẻ thư mục (Folder Sharing)
// ==========================================

// 4.1. Phân quyền chia sẻ thư mục: POST /api/v1/document-categories/{id}/shares
export const shareDocumentCategory = async (categoryId: number, payload: ShareFolderPayload): Promise<FolderShare> => {
  try {
    const res = await api.post(`/api/v1/document-categories/${categoryId}/shares`, payload);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể chia sẻ thư mục'));
  }
};

// 4.2. Xem danh sách những người đang được chia sẻ thư mục: GET /api/v1/document-categories/{id}/shares
export const getDocumentCategoryShares = async (categoryId: number): Promise<FolderShare[]> => {
  try {
    const res = await api.get(`/api/v1/document-categories/${categoryId}/shares`);
    const raw = res.data?.data ?? res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  } catch (error: any) {
    console.warn('Lỗi getDocumentCategoryShares:', error);
    return [];
  }
};

// 4.3. Thu hồi quyền chia sẻ thư mục: DELETE /api/v1/document-categories/{id}/shares/{shareId}
export const revokeDocumentCategoryShare = async (categoryId: number, shareId: number | string): Promise<void> => {
  try {
    await api.delete(`/api/v1/document-categories/${categoryId}/shares/${shareId}`);
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể thu hồi quyền chia sẻ'));
  }
};

// ==========================================
// 3.1. Phân quyền chia sẻ tài liệu (Document Sharing)
// ==========================================

// 4.4. Phân quyền chia sẻ tài liệu: Cập nhật người nhận qua PUT /api/v1/documents/{id}
export const shareDocument = async (
  documentId: number,
  payload: {
    shareScope?: string;
    recipientUserIds?: (string | number)[];
    recipientDepartmentIds?: (string | number)[];
    userId?: string;
    departmentId?: number;
    permission?: string;
    approverId?: string;
  },
): Promise<any> => {
  try {
    const updateData: Record<string, any> = {};
    if (payload.shareScope) {
      updateData.shareScope = payload.shareScope;
    }
    if (payload.recipientUserIds) {
      updateData.recipientUserIds = payload.recipientUserIds.map(String);
    } else if (payload.userId) {
      updateData.recipientUserIds = [String(payload.userId)];
    }
    if (payload.recipientDepartmentIds) {
      updateData.recipientDepartmentIds = payload.recipientDepartmentIds.map(Number);
    } else if (payload.departmentId) {
      updateData.recipientDepartmentIds = [Number(payload.departmentId)];
    }
    if (payload.approverId) {
      updateData.approverId = payload.approverId;
    }
    if (payload.permission) {
      updateData.permission = payload.permission;
    }

    const res = await api.put(`/api/v1/documents/${documentId}`, updateData);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể chia sẻ tài liệu'));
  }
};

// 4.5. Xem danh sách những người đang được chia sẻ tài liệu
// Backend lưu recipients trực tiếp trong chi tiết tài liệu GET /api/v1/documents/{id}
export const getDocumentShares = async (documentId: number): Promise<FolderShare[]> => {
  try {
    const docRes = await api.get(`/api/v1/documents/${documentId}`);
    const docData = docRes.data?.data ?? docRes.data;
    const creatorId = String(docData?.createdById || docData?.createdBy?.id || '');
    const creatorEmail = (docData?.createdBy?.email || '').toLowerCase().trim();
    const creatorName = (docData?.createdBy?.fullName || '').toLowerCase().trim();

    if (Array.isArray(docData?.recipients)) {
      return docData.recipients
        .filter((r: any) => {
          const u = r.user || {};
          const uid = String(r.userId || r.user_id || u.id || '');
          const uemail = (r.email || u.email || '').toLowerCase().trim();
          const uname = (r.fullName || r.full_name || r.userName || u.fullName || u.username || '').toLowerCase().trim();

          const isCreatorId = Boolean(creatorId && uid && uid === creatorId);
          const isCreatorEmail = Boolean(creatorEmail && uemail && uemail === creatorEmail);
          const isCreatorName = Boolean(creatorName && uname && uname === creatorName);

          return !isCreatorId && !isCreatorEmail && !isCreatorName;
        })
        .map((r: any) => {
          const u = r.user || {};
          const name = r.fullName || r.full_name || r.userName || u.fullName || u.username || '';
          const code = r.code || r.identifyCode || r.identify_code || u.code || u.identifyCode || '';
          const email = r.email || u.email || '';
          const avatar = r.avatar || u.avatar || null;
          return {
            id: r.id || r.userId || r.user_id,
            categoryId: documentId,
            userId: r.userId || r.user_id || u.id,
            userName: name,
            code,
            user: {
              id: r.userId || r.user_id || u.id,
              fullName: name,
              email,
              avatar,
              identifyCode: code,
            },
            departmentId: r.departmentId || r.department_id,
            departmentName: r.departmentName || r.department_name,
            permission: r.permission || 'view',
          };
        });
    }
    return [];
  } catch (error: any) {
    console.warn('Lỗi getDocumentShares:', error);
    return [];
  }
};

// 4.6. Thu hồi quyền chia sẻ tài liệu
export const revokeDocumentShare = async (documentId: number, shareId: number | string): Promise<void> => {
  try {
    const docRes = await api.get(`/api/v1/documents/${documentId}`);
    const docData = docRes.data?.data ?? docRes.data;
    const currentRecipients: any[] = docData?.recipients || [];
    const updatedUserIds = currentRecipients
      .filter((r) => String(r.id) !== String(shareId) && String(r.userId) !== String(shareId))
      .map((r) => String(r.userId))
      .filter(Boolean);

    await api.put(`/api/v1/documents/${documentId}`, {
      recipientUserIds: updatedUserIds,
      ...(updatedUserIds.length === 0 ? { shareScope: 'private' } : {}),
    });
  } catch (e: any) {
    throw new Error(extractErrorMessage(e, 'Không thể thu hồi quyền chia sẻ tài liệu'));
  }
};

// ==========================================
// 4. Phê duyệt & Quy trình tài liệu (Approval Workflow)
// ==========================================

// 8.1. Trình duyệt tài liệu: POST /api/v1/documents/{id}/submit (với fallback /submit-approval)
// Trạng thái duyệt sẽ chuyển thành pending
export const submitDocument = async (documentId: number, payload?: { approverId?: string }): Promise<DocumentItem> => {
  try {
    try {
      const res = await api.post(`/api/v1/documents/${documentId}/submit`, payload || {});
      return res.data?.data ?? res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const res = await api.post(`/api/v1/documents/${documentId}/submit-approval`, payload || {});
        return res.data?.data ?? res.data;
      }
      throw err;
    }
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể trình duyệt tài liệu'));
  }
};

// 8.2. Phê duyệt hoặc Từ chối văn bản: POST /api/v1/documents/{id}/approve
// Hỗ trợ cả schema { isApproved, approvalNote } và { action, comment }
export const reviewDocument = async (
  documentId: number,
  payload: {
    action?: 'approved' | 'rejected';
    approvalStatus?: 'approved' | 'rejected';
    isApproved?: boolean;
    comment?: string;
    approvalNote?: string;
  },
): Promise<DocumentItem> => {
  try {
    const status = payload.approvalStatus || payload.action || (payload.isApproved ? 'approved' : 'rejected');
    const note = payload.comment || payload.approvalNote || '';
    const isApproved = payload.isApproved !== undefined ? payload.isApproved : status === 'approved';

    const body: Record<string, any> = {
      isApproved,
      approvalStatus: status,
      action: status,
    };
    if (note) {
      body.approvalNote = note;
      body.comment = note;
    }

    const res = await api.post(`/api/v1/documents/${documentId}/approve`, body);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể xử lý phê duyệt tài liệu'));
  }
};


// 8.3. Ban hành văn bản chính thức: POST /api/v1/documents/{id}/publish
// Request body (tùy chọn): { shareScope?: "all" | "department" | "private" }
// Sau khi ban hành, trạng thái đổi thành published
export const publishDocument = async (documentId: number, payload?: PublishDocumentPayload): Promise<DocumentItem> => {
  try {
    const res = await api.post(`/api/v1/documents/${documentId}/publish`, payload || {});
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể ban hành tài liệu'));
  }
};

// ==========================================
// 5. Hộp thư đến (Inbox) & Đánh dấu đã đọc
// ==========================================

// 6.1. Lấy danh sách văn bản trong Hộp thư đến (Inbox): GET /api/v1/documents/inbox
export const getInboxDocuments = async (params?: GetInboxDocumentsParams): Promise<GetDocumentsResponse> => {
  try {
    const res = await api.get('/api/v1/documents/inbox', { params });
    const rawData = res.data?.data ?? res.data;
    if (Array.isArray(rawData)) {
      return {
        items: rawData,
        total: rawData.length,
        offset: params?.offset || 0,
        limit: params?.limit || 10,
      };
    }
    return {
      items: rawData?.items || [],
      total: rawData?.total || 0,
      offset: rawData?.offset || 0,
      limit: rawData?.limit || 10,
    };
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return getDocuments(params as any);
    }
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách hộp thư đến'));
  }
};
