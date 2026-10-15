import React from 'react';
import { FileText, FileSpreadsheet, FileCode, FileImage, FileArchive, File } from 'lucide-react';
import type { DocumentItem } from '@/types';

/**
 * Kiểm tra xem người dùng hiện tại có phải là CHỦ SỞ HỮU của tài liệu hay không.
 * Quy tắc:
 * - Chủ sở hữu là người tạo ra tài liệu (createdById khớp với currentUser.id hoặc email).
 * - Hoặc backend trả về cờ isOwner === true / is_owner === true.
 * - Quyền sở hữu TUYỆT ĐỐI KHÔNG bị thay đổi bởi việc chia sẻ cho người khác.
 */
export function isDocumentOwner(
  doc: DocumentItem | null | undefined,
  currentUser?: { id?: string | number; email?: string } | null,
  myCategoryIds?: Set<number>,
): boolean {
  if (!doc || !currentUser) return false;

  // 1. Backend trả về cờ isOwner / is_owner trực tiếp
  if (typeof (doc as any).isOwner === 'boolean') {
    return (doc as any).isOwner;
  }
  if (typeof (doc as any).is_owner === 'boolean') {
    return (doc as any).is_owner;
  }

  const currentUserId = currentUser.id ? String(currentUser.id) : null;
  const currentUserEmail = currentUser.email?.trim().toLowerCase() || null;

  const docCreatedById = doc.createdById
    ? String(doc.createdById)
    : doc.createdBy?.id
      ? String(doc.createdBy.id)
      : (doc as any)?.creatorId
        ? String((doc as any).creatorId)
        : (doc as any)?.user_id
          ? String((doc as any).user_id)
          : null;

  // 2. So sánh ID người tạo
  if (currentUserId && docCreatedById) {
    return currentUserId === docCreatedById;
  }

  // 3. So sánh Email người tạo
  const docCreatedByEmail = doc.createdBy?.email?.trim().toLowerCase();
  if (currentUserEmail && docCreatedByEmail) {
    return currentUserEmail === docCreatedByEmail;
  }

  // 4. Nếu tài liệu có thông tin người tạo mà không khớp -> Chắc chắn không phải chủ sở hữu
  if (currentUserId && docCreatedById && currentUserId !== docCreatedById) {
    return false;
  }

  // 5. Fallback: Nếu tài liệu nằm trong thư mục cá nhân thuộc sở hữu của currentUser
  if (doc.categoryId && myCategoryIds && myCategoryIds.has(doc.categoryId)) {
    return true;
  }

  return false;
}

/**
 * Kiểm tra xem tài liệu có phải được người khác chia sẻ cho người dùng hiện tại hay không.
 * Dùng cho mục "Được chia sẻ với tôi".
 * Điều kiện:
 * 1. Người dùng hiện tại KHÔNG PHẢI là chủ sở hữu của tài liệu (!isDocumentOwner).
 * 2. Tài liệu được chia sẻ hợp lệ:
 *    - currentUser nằm trong danh sách recipients (theo userId hoặc email).
 *    - Hoặc shareScope là 'all' (toàn công ty) / 'department' / 'user' (nội bộ).
 *    - Hoặc tài liệu nằm trong thư mục được chia sẻ (shared folder).
 *    - Hoặc backend trả về isShared = true cho tài liệu mà currentUser không phải là owner.
 */
export function isDocumentSharedWithUser(
  doc: DocumentItem | null | undefined,
  currentUser?: { id?: string | number; email?: string } | null,
  sharedCategoryIds?: Set<number>,
): boolean {
  if (!doc || !currentUser) return false;

  // TUYỆT ĐỐI KHÔNG hiển thị tài liệu do chính người dùng sở hữu trong mục Được chia sẻ với tôi
  if (isDocumentOwner(doc, currentUser)) {
    return false;
  }

  // Kiểm tra nếu tài liệu nằm trong thư mục được chia sẻ
  if (doc.categoryId && sharedCategoryIds && sharedCategoryIds.has(doc.categoryId)) {
    return true;
  }

  // Nếu backend đã gắn cờ isShared = true cho tài liệu này
  if ((doc as any).isShared === true || (doc as any).is_shared === true) {
    return true;
  }

  const currentUserId = currentUser.id ? String(currentUser.id) : null;
  const currentUserEmail = currentUser.email?.trim().toLowerCase();

  // Kiểm tra trong danh sách người nhận (recipients)
  if (Array.isArray(doc.recipients) && doc.recipients.length > 0) {
    const isRecipient = doc.recipients.some((r: any) => {
      const rUid = r.userId || r.user_id || r.id || r.user?.id;
      if (currentUserId && rUid && String(rUid) === currentUserId) return true;
      const rEmail = r.email || r.user?.email;
      if (currentUserEmail && rEmail && String(rEmail).trim().toLowerCase() === currentUserEmail) return true;
      return false;
    });
    if (isRecipient) return true;
  }

  // Kiểm tra theo phạm vi chia sẻ
  const scope = doc.shareScope || (doc as any).share_scope;
  if (scope === 'all' || scope === 'department' || scope === 'internal' || scope === 'user') {
    return true;
  }
  if (scope && scope !== 'private') {
    return true;
  }

  return false;
}

/**
 * Kiểm tra xem tài liệu có đang ở trạng thái đã chia sẻ ra ngoài hay không.
 * CHỈ dùng để hiển thị icon/badge <Users /> "Đã chia sẻ" trên giao diện (FileCard, FileTable).
 * TUYỆT ĐỐI KHÔNG dùng hàm này để xác định chủ sở hữu hay lọc ẩn tài liệu khỏi Tài liệu của tôi!
 */
export function isDocumentSharedOut(doc: DocumentItem | null | undefined): boolean {
  if (!doc) return false;
  if ((doc as any).isShared === true || (doc as any).is_shared === true) return true;
  const scope = doc.shareScope || (doc as any).share_scope;
  if (scope && scope !== 'private') return true;
  if (Array.isArray(doc.recipients) && doc.recipients.length > 0) return true;
  return false;
}

/**
 * Helper kiểm tra trạng thái chia sẻ (Tương thích ngược với các nơi đang gọi).
 */
export function isDocumentShared(doc: DocumentItem | null | undefined, currentUserId?: string | number): boolean {
  if (!doc) return false;
  return isDocumentSharedOut(doc);
}

export interface DocumentPermissionsResult {
  isShared: boolean;
  isOwner: boolean;
  canEdit: boolean;
  canMove: boolean;
  canDelete: boolean;
  canShare: boolean;
  canSaveToFolder: boolean;
  canRemoveShortcut: boolean;
}

/**
 * Xác định quyền thao tác trên tài liệu:
 * - Chủ sở hữu: Có đầy đủ quyền xem, tải, chỉnh sửa, xóa, di chuyển, chia sẻ, lưu vào thư mục.
 * - Admin / HR: Có ngoại lệ quyền quản trị trên toàn bộ tài liệu hệ thống.
 * - Người nhận (Recipient):
 *   + Nút Di chuyển: Ẩn hoàn toàn (chỉ chủ sở hữu hoặc admin/hr mới có quyền).
 *   + Nút Xóa: Ẩn hoàn toàn (chỉ chủ sở hữu hoặc admin/hr mới có quyền xóa tài liệu gốc).
 *   + Nút Chia sẻ: Ẩn hoàn toàn (chỉ chủ sở hữu hoặc admin/hr mới có quyền).
 *   + Nút Sửa: Chỉ hiện nếu người nhận được cấp quyền sửa ('edit') đích danh trên tài liệu.
 *   + Nút Lưu lối tắt: Cho phép lưu vào thư mục cá nhân của người dùng.
 *   + Nút Gỡ lối tắt: Chỉ hiện khi đang ở trong thư mục cá nhân và tài liệu không phải tài liệu gốc do người dùng sở hữu.
 */
export function getDocumentPermissions(
  doc: DocumentItem | null | undefined,
  currentUser?: { id?: string | number; email?: string } | null,
  context?: {
    isSharedSection?: boolean;
    folderPermission?: 'view' | 'edit' | string;
    canManageDocuments?: boolean;
    myCategoryIds?: Set<number>;
    currentFolderId?: number | null;
  },
): DocumentPermissionsResult {
  if (!doc) {
    return {
      isShared: false,
      isOwner: false,
      canEdit: false,
      canMove: false,
      canDelete: false,
      canShare: false,
      canSaveToFolder: false,
      canRemoveShortcut: false,
    };
  }

  // 1. Kiểm tra quyền sở hữu
  const isOwner = isDocumentOwner(doc, currentUser, context?.myCategoryIds);

  // 2. Trạng thái đã chia sẻ (hiển thị badge icon)
  const isShared = isDocumentSharedOut(doc) || Boolean(context?.isSharedSection);

  // 3. Kiểm tra vai trò quản trị viên (Admin hoặc HR)
  const isAdminOrHR = Boolean(context?.canManageDocuments);

  // Kiểm tra tài liệu có thể gỡ khỏi thư mục hiện tại không (khi đang ở trong thư mục cá nhân)
  const isInPersonalFolder = Boolean(context?.currentFolderId && context?.myCategoryIds && context.myCategoryIds.has(context.currentFolderId));
  // Cho phép gỡ khỏi thư mục nếu tài liệu không phải tạo bởi người dùng (được lưu qua shortcut)
  // hoặc tài liệu nằm trong savedFolders
  const isSavedShortcut = Array.isArray(doc.savedFolders) && Boolean(context?.currentFolderId && doc.savedFolders.includes(context.currentFolderId));
  const canRemoveShortcut = isInPersonalFolder && (!isOwner || isSavedShortcut);

  // Nếu người dùng là CHỦ SỞ HỮU:
  if (isOwner) {
    return {
      isShared,
      isOwner: true,
      canEdit: true,
      canMove: true,
      canDelete: true,
      canShare: true,
      canSaveToFolder: true,
      canRemoveShortcut,
    };
  }

  // Nếu người dùng là ADMIN hoặc HR (ngoại lệ quản trị):
  if (isAdminOrHR) {
    return {
      isShared,
      isOwner: false,
      canEdit: true,
      canMove: true,
      canDelete: true,
      canShare: true,
      canSaveToFolder: true,
      canRemoveShortcut,
    };
  }

  // Nếu người dùng là NGƯỜI NHẬN (Recipient - không phải owner, không phải admin/hr):
  let hasEditPermission = false;

  // A. Kiểm tra quyền gắn trực tiếp trên document object (từ backend)
  const docPerm = (doc as any).permission || (doc as any).permission_level || (doc as any).permissionLevel;
  if (docPerm === 'edit' || docPerm === 'EDIT') {
    hasEditPermission = true;
  } else if (docPerm === 'view' || docPerm === 'VIEW') {
    hasEditPermission = false;
  } else if ((doc as any).canEdit === true || (doc as any).can_edit === true) {
    hasEditPermission = true;
  }

  // B. Kiểm tra quyền trong danh sách người nhận (recipients) của tài liệu
  const currentUserId = currentUser?.id ? String(currentUser.id) : null;
  const currentUserEmail = currentUser?.email?.trim().toLowerCase();

  if (!hasEditPermission && Array.isArray(doc.recipients) && (currentUserId || currentUserEmail)) {
    const myRecipient = doc.recipients.find((r: any) => {
      const matchId = currentUserId && String(r.userId || r.user_id || r.id || r.user?.id) === currentUserId;
      const matchEmail = currentUserEmail && Boolean(r.email) && r.email.toLowerCase().trim() === currentUserEmail;
      return matchId || matchEmail;
    });

    if (myRecipient) {
      const rPerm = (myRecipient as any).permission;
      if (rPerm === 'edit' || rPerm === 'EDIT' || (myRecipient as any).canEdit === true) {
        hasEditPermission = true;
      } else if (rPerm === 'view' || rPerm === 'VIEW') {
        hasEditPermission = false;
      }
    }
  }

  // Tuyệt đối KHÔNG tự động kế thừa quyền sửa tài liệu gốc từ thư mục cha
  // Quyền sửa tài liệu chỉ căn cứ theo quyền sở hữu hoặc quyền edit đích danh

  return {
    isShared,
    isOwner: false,
    canEdit: hasEditPermission,
    canMove: false,
    canDelete: false,
    canShare: false,
    canSaveToFolder: true,
    canRemoveShortcut,
  };
}

// Định dạng dung lượng tệp
export function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Tự động sinh mã tài liệu/thư mục theo tên
export function generateSlugCode(text: string, prefix = 'DOC'): string {
  const suffix = Date.now().toString().slice(-6);
  if (!text) return `${prefix}_${suffix}`;
  // Remove accents
  const nonAccent = text
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

  return slug ? `${prefix}_${slug}_${suffix}` : `${prefix}_${suffix}`;
}

// Lấy đuôi file
export function getFileExtension(filename?: string): string {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

// Định nghĩa thông tin hiển thị của file
export function getFileVisualInfo(filename?: string, mimeType?: string) {
  const ext = getFileExtension(filename);

  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) {
    return {
      icon: <FileText className="text-rose-500" size={20} />,
      color: 'rose',
      label: 'PDF',
      bgColor: 'bg-rose-50 border-rose-200',
    };
  }

  if (['doc', 'docx'].includes(ext) || mimeType?.includes('word')) {
    return {
      icon: <FileText className="text-blue-500" size={20} />,
      color: 'blue',
      label: 'Word',
      bgColor: 'bg-blue-50 border-blue-200',
    };
  }

  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
    return {
      icon: <FileSpreadsheet className="text-emerald-600" size={20} />,
      color: 'emerald',
      label: 'Excel',
      bgColor: 'bg-emerald-50 border-emerald-200',
    };
  }

  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || mimeType?.startsWith('image/')) {
    return {
      icon: <FileImage className="text-indigo-500" size={20} />,
      color: 'indigo',
      label: 'Image',
      bgColor: 'bg-indigo-50 border-indigo-200',
    };
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType?.includes('zip')) {
    return {
      icon: <FileArchive className="text-amber-500" size={20} />,
      color: 'amber',
      label: 'Archive',
      bgColor: 'bg-amber-50 border-amber-200',
    };
  }

  if (['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py'].includes(ext)) {
    return {
      icon: <FileCode className="text-purple-500" size={20} />,
      color: 'purple',
      label: 'Code',
      bgColor: 'bg-purple-50 border-purple-200',
    };
  }

  return {
    icon: <File className="text-slate-500" size={20} />,
    color: 'slate',
    label: ext ? ext.toUpperCase() : 'File',
    bgColor: 'bg-slate-50 border-slate-200',
  };
}

// Icon tùy theo loại file
export function DriveFileIcon({ filename, mimeType, size = 18 }: { filename?: string; mimeType?: string; size?: number }) {
  const ext = getFileExtension(filename);

  // 1. PDF - Red document icon with folded corner
  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#EA4335" />
        <path d="M14 2v6h6" fill="#F89D96" />
        <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // 2. Word / Docs - Blue document icon
  if (['doc', 'docx'].includes(ext) || mimeType?.includes('word')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#4285F4" />
        <path d="M14 2v6h6" fill="#A1C2FA" />
        <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // 3. Excel / Sheets - Green spreadsheet icon
  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#0F9D58" />
        <path d="M14 2v6h6" fill="#87CEAB" />
        <rect x="7.5" y="12" width="9" height="6.5" rx="0.5" fill="none" stroke="white" strokeWidth="1.3" />
        <line x1="12" y1="12" x2="12" y2="18.5" stroke="white" strokeWidth="1.3" />
        <line x1="7.5" y1="15.2" x2="16.5" y2="15.2" stroke="white" strokeWidth="1.3" />
      </svg>
    );
  }

  // 4. PowerPoint / Slides - Orange presentation icon
  if (['ppt', 'pptx'].includes(ext) || mimeType?.includes('presentation')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#F4B400" />
        <path d="M14 2v6h6" fill="#FCDA7F" />
        <rect x="8" y="12.5" width="8" height="5.5" rx="0.5" fill="none" stroke="white" strokeWidth="1.3" />
      </svg>
    );
  }

  // 5. Video - Red video player icon
  if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext) || mimeType?.startsWith('video/')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#EA4335" />
        <polygon points="10,8.5 16,12 10,15.5" fill="white" />
      </svg>
    );
  }

  // 6. Image - Purple image icon
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || mimeType?.startsWith('image/')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <rect x="2.5" y="3.5" width="19" height="17" rx="3" fill="#AB47BC" />
        <circle cx="8" cy="8.5" r="1.8" fill="white" />
        <path d="M20 16l-5-5-8 7.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 7. Archive / Zip - Amber icon
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType?.includes('zip')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#E37400" />
        <path d="M14 2v6h6" fill="#F5BA80" />
        <path d="M10 11h2M10 13h2M10 15h2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. Generic file - Slate document
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#5F6368" />
      <path d="M14 2v6h6" fill="#BDC1C6" />
      <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// DriveFileBadge alias to DriveFileIcon
export const DriveFileBadge = DriveFileIcon;

// Kiểm tra nhân sự có đủ thẩm quyền phê duyệt hay không (CHỈ LOAD ROLE ADMIN HOẶC HR)
export const isApproverEligible = (emp: any): boolean => {
  if (!emp) return false;

  const roles: { code?: string; name?: string }[] = [];
  if (Array.isArray(emp.roles)) {
    emp.roles.forEach((r: any) => {
      if (typeof r === 'string') roles.push({ code: r, name: r });
      else if (r && typeof r === 'object') roles.push({ code: r.code, name: r.name });
    });
  }
  if (typeof emp.role === 'string') roles.push({ code: emp.role, name: emp.role });
  else if (emp.role && typeof emp.role === 'object') roles.push({ code: emp.role.code, name: emp.role.name });

  if (roles.length === 0) return false;

  return roles.some(({ code, name }) => {
    const c = (code || '').toLowerCase().trim();
    const n = (name || '').toLowerCase().trim();

    // 1. Role code khớp admin / hr / super
    const validCodes = ['admin', 'hr', 'super', 'supper', 'super_admin', 'supper_admin', 'admin_hr'];
    if (validCodes.includes(c)) return true;

    // 2. Role name tiếng Việt: 'quản trị', 'quản trị viên', 'nhân sự' (tuyệt đối không chấp nhận 'nhân viên' hay 'kinh doanh')
    if (n === 'admin' || n === 'hr' || n === 'quản trị' || n === 'quản trị viên' || n === 'nhân sự') {
      return true;
    }
    if (c.includes('admin') || n.includes('admin') || n.includes('quản trị')) {
      return true;
    }
    if ((c.includes('hr') || n.includes('nhân sự')) && !n.includes('nhân viên') && !c.includes('employee')) {
      return true;
    }

    return false;
  });
};

// Lấy badge chức vụ / vai trò của người duyệt
export const getApproverRoleBadge = (emp: any): string => {
  if (Array.isArray(emp?.roles) && emp.roles.length > 0) {
    const names = emp.roles.map((r: any) => (typeof r === 'string' ? r : r.name || r.code)).filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  if (typeof emp?.role === 'string') return emp.role;
  if (emp?.role && typeof emp.role === 'object') return emp.role.name || emp.role.code || '';
  return 'Cán bộ duyệt';
};
