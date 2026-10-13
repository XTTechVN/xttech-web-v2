import api from '@/utils/api';
import type {
  DocumentCategory,
  CreateDocumentCategoryPayload,
  UpdateDocumentCategoryPayload,
  DocumentItem,
  GetDocumentsParams,
  GetInboxDocumentsParams,
  GetDocumentsResponse,
  FolderShare,
  ShareFolderPayload,
} from '@/types';

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
    const my = Array.isArray(treeObj?.myFolders)
      ? treeObj.myFolders
      : Array.isArray(treeObj?.my_folders)
      ? treeObj.my_folders
      : [];
    const shared = Array.isArray(treeObj?.sharedFolders)
      ? treeObj.sharedFolders
      : Array.isArray(treeObj?.shared_folders)
      ? treeObj.shared_folders
      : [];

    const markedMy = my.map((item: DocumentCategory) => ({
      ...item,
      isOwner: item.isOwner ?? true,
      permission: item.permission || 'edit',
      isShared: false,
    }));

    const markedShared = shared.map((item: DocumentCategory) => ({
      ...item,
      isOwner: item.isOwner ?? false,
      permission: item.permission || 'view',
      isShared: true,
    }));

    return [...markedMy, ...markedShared];
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
    const code = payload.code?.trim()
      ? payload.code.trim().toUpperCase()
      : generateCategoryCode(payload.name);

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

// Cập nhật thông tin tài liệu
export const updateDocument = async (id: number, data: Partial<DocumentItem>): Promise<DocumentItem> => {
  try {
    const res = await api.put(`/api/v1/documents/${id}`, data);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể cập nhật tài liệu'));
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

// 4.4. Phân quyền chia sẻ tài liệu: Cập nhật người nhận qua PUT /api/v1/documents/{id} (hoặc POST /shares)
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
  }
): Promise<any> => {
  try {
    // 1. Thử gọi API chuyên biệt POST /api/v1/documents/{id}/shares nếu chỉ thêm 1 user
    if (payload.userId && !payload.recipientUserIds) {
      try {
        const res = await api.post(`/api/v1/documents/${documentId}/shares`, {
          userId: payload.userId,
          permission: payload.permission || 'view',
        });
        return res.data?.data ?? res.data;
      } catch (err: any) {
        // Fallback sang PUT /api/v1/documents/{id} bên dưới
      }
    }

    // 2. Gửi request PUT /api/v1/documents/{id} cập nhật danh sách người nhận và phạm vi chia sẻ
    const updateData: Record<string, any> = {};
    if (payload.shareScope) {
      updateData.shareScope = payload.shareScope;
      updateData.share_scope = payload.shareScope;
    }
    if (payload.recipientUserIds) {
      updateData.recipientUserIds = payload.recipientUserIds.map(String);
      updateData.recipient_user_ids = payload.recipientUserIds.map(String);
    }
    if (payload.recipientDepartmentIds) {
      updateData.recipientDepartmentIds = payload.recipientDepartmentIds.map(Number);
      updateData.recipient_department_ids = payload.recipientDepartmentIds.map(Number);
    }
    if (payload.approverId) {
      updateData.approverId = payload.approverId;
      updateData.approver_id = payload.approverId;
    }

    const res = await api.put(`/api/v1/documents/${documentId}`, updateData);
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể chia sẻ tài liệu'));
  }
};

// 4.5. Xem danh sách những người đang được chia sẻ tài liệu
export const getDocumentShares = async (documentId: number): Promise<FolderShare[]> => {
  try {
    const res = await api.get(`/api/v1/documents/${documentId}/shares`);
    const raw = res.data?.data ?? res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  } catch (error: any) {
    // Fallback: Lấy chi tiết tài liệu và extract mảng recipients
    try {
      const docRes = await api.get(`/api/v1/documents/${documentId}`);
      const docData = docRes.data?.data ?? docRes.data;
      if (Array.isArray(docData?.recipients)) {
        return docData.recipients.map((r: any) => ({
          id: r.id || r.userId,
          categoryId: documentId,
          userId: r.userId,
          userName: r.fullName,
          user: {
            id: r.userId,
            fullName: r.fullName,
            email: r.email,
            avatar: r.avatar,
          },
          departmentId: r.departmentId,
          departmentName: r.departmentName,
          permission: 'view',
        }));
      }
    } catch (e) {
      console.warn('Lỗi getDocumentShares fallback:', e);
    }
    return [];
  }
};

// 4.6. Thu hồi quyền chia sẻ tài liệu
export const revokeDocumentShare = async (documentId: number, shareId: number | string): Promise<void> => {
  try {
    await api.delete(`/api/v1/documents/${documentId}/shares/${shareId}`);
  } catch (error: any) {
    // Fallback: Lấy tài liệu hiện tại, lọc bớt userId/departmentId và PUT cập nhật lại
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
        recipient_user_ids: updatedUserIds,
      });
    } catch (e: any) {
      throw new Error(extractErrorMessage(e, 'Không thể thu hồi quyền chia sẻ tài liệu'));
    }
  }
};


// ==========================================
// 4. Phê duyệt & Quy trình tài liệu (Approval Workflow)
// ==========================================

// 8.1. Trình duyệt tài liệu: POST /api/v1/documents/{id}/submit
// Trạng thái duyệt sẽ chuyển thành pending
export const submitDocument = async (
  documentId: number,
  payload?: { approverId?: string }
): Promise<DocumentItem> => {
  try {
    const res = await api.post(`/api/v1/documents/${documentId}/submit`, payload || {});
    return res.data?.data ?? res.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Không thể trình duyệt tài liệu'));
  }
};

// 8.2. Phê duyệt hoặc Từ chối văn bản: POST /api/v1/documents/{id}/approve
export const reviewDocument = async (
  documentId: number,
  payload: {
    action?: 'approved' | 'rejected';
    approvalStatus?: 'approved' | 'rejected';
    comment?: string;
    approvalNote?: string;
  },
): Promise<DocumentItem> => {
  try {
    const status = payload.approvalStatus || payload.action || 'approved';
    const note = payload.comment || payload.approvalNote;

    const body: Record<string, any> = {
      approvalStatus: status,
      approval_status: status,
      action: status,
    };
    if (note) {
      body.comment = note;
      body.approvalNote = note;
      body.approval_note = note;
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
export const publishDocument = async (
  documentId: number,
  payload?: { shareScope?: string }
): Promise<DocumentItem> => {
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
export const getInboxDocuments = async (
  params?: GetInboxDocumentsParams,
): Promise<GetDocumentsResponse> => {
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
    throw new Error(extractErrorMessage(error, 'Không thể tải danh sách hộp thư đến'));
  }
};
