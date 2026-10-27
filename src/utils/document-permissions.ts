import type { DocumentItem } from '@/types';

const AVATAR_STYLES = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
];

export const getAvatarStyle = (name?: string | null): string => {
  if (!name) return 'bg-slate-100 text-slate-600 border-slate-200';
  const charCode = name.charCodeAt(0) + (name.length > 1 ? name.charCodeAt(1) : 0);
  return AVATAR_STYLES[charCode % AVATAR_STYLES.length];
};

export function isDocumentOwner(
  doc: DocumentItem | null | undefined,
  currentUser?: { id?: string | number; email?: string } | null,
  myCategoryIds?: Set<number>,
): boolean {
  if (!doc || !currentUser) return false;
  if (typeof (doc as { isOwner?: boolean }).isOwner === 'boolean') {
    return Boolean((doc as { isOwner?: boolean }).isOwner);
  }
  const currentUserId = currentUser.id ? String(currentUser.id) : null;
  const docCreatedById = doc.createdById
    ? String(doc.createdById)
    : doc.createdBy?.id
      ? String(doc.createdBy.id)
      : null;

  if (currentUserId && docCreatedById) return currentUserId === docCreatedById;

  const currentUserEmail = currentUser.email?.trim().toLowerCase() || null;
  const docCreatedByEmail = doc.createdBy?.email?.trim().toLowerCase();
  if (currentUserEmail && docCreatedByEmail) return currentUserEmail === docCreatedByEmail;

  return Boolean(doc.categoryId && myCategoryIds?.has(doc.categoryId));
}

export function isDocumentSharedWithUser(
  doc: DocumentItem | null | undefined,
  currentUser?: { id?: string | number; email?: string } | null,
  sharedCategoryIds?: Set<number>,
): boolean {
  if (!doc || !currentUser || isDocumentOwner(doc, currentUser)) return false;
  if (doc.categoryId && sharedCategoryIds?.has(doc.categoryId)) return true;
  if ((doc as { isShared?: boolean }).isShared === true) return true;

  const uid = currentUser.id ? String(currentUser.id) : null;
  const email = currentUser.email?.trim().toLowerCase();
  if (Array.isArray(doc.recipients) && doc.recipients.length > 0) {
    const matched = doc.recipients.some((r: any) => {
      const rUid = r.userId || r.id || r.user?.id;
      const rEmail = r.email || r.user?.email;
      return (uid && rUid && String(rUid) === uid) || (email && rEmail && String(rEmail).trim().toLowerCase() === email);
    });
    if (matched) return true;
  }

  return Boolean(doc.shareScope && doc.shareScope !== 'private');
}

export function isDocumentSharedOut(doc: DocumentItem | null | undefined): boolean {
  if (!doc) return false;
  if ((doc as { isShared?: boolean }).isShared === true) return true;
  if (doc.shareScope && doc.shareScope !== 'private') return true;
  return Array.isArray(doc.recipients) && doc.recipients.length > 0;
}

export function isDocumentShared(doc: DocumentItem | null | undefined, _currentUserId?: string | number): boolean {
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

function hasRecipientEditRight(
  doc: DocumentItem,
  currentUser?: { id?: string | number; email?: string } | null,
): boolean {
  const docPerm = doc.permission || (doc as any).permissionLevel;
  if (docPerm === 'edit' || docPerm === 'EDIT' || (doc as any).canEdit === true) return true;
  if (docPerm === 'view' || docPerm === 'VIEW' || !Array.isArray(doc.recipients)) return false;

  const uid = currentUser?.id ? String(currentUser.id) : null;
  const email = currentUser?.email?.trim().toLowerCase();
  const myRec = doc.recipients.find((r: any) => {
    const matchId = uid && String(r.userId || r.id || r.user?.id) === uid;
    const matchEmail = email && r.email && String(r.email).toLowerCase().trim() === email;
    return matchId || matchEmail;
  });
  const rPerm = (myRec as any)?.permission;
  return rPerm === 'edit' || rPerm === 'EDIT' || (myRec as any)?.canEdit === true;
}

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
      isShared: false, isOwner: false, canEdit: false, canMove: false,
      canDelete: false, canShare: false, canSaveToFolder: false, canRemoveShortcut: false,
    };
  }
  const isOwner = isDocumentOwner(doc, currentUser, context?.myCategoryIds);
  const isShared = isDocumentSharedOut(doc) || Boolean(context?.isSharedSection);
  const isAdminOrHR = Boolean(context?.canManageDocuments);
  const inPersonal = Boolean(context?.currentFolderId && context?.myCategoryIds?.has(context.currentFolderId));
  const isShortcut = Boolean(context?.currentFolderId && doc.savedFolders?.includes(context.currentFolderId));
  const canRemoveShortcut = inPersonal && (!isOwner || isShortcut);

  if (isOwner || isAdminOrHR) {
    return {
      isShared, isOwner, canEdit: true, canMove: true, canDelete: true,
      canShare: true, canSaveToFolder: true, canRemoveShortcut,
    };
  }

  const canEditByFolder = context?.folderPermission === 'edit';
  const canEditByRecipient = hasRecipientEditRight(doc, currentUser);
  const canEdit = canEditByFolder || canEditByRecipient;
  const canMove = canEditByFolder;

  return {
    isShared,
    isOwner: false,
    canEdit,
    canMove,
    canDelete: false,
    canShare: false,
    canSaveToFolder: true,
    canRemoveShortcut,
  };
}

const extractEmployeeRoles = (emp: any): { code?: string; name?: string }[] => {
  if (!emp) return [];
  const roles: { code?: string; name?: string }[] = [];
  if (Array.isArray(emp.roles)) {
    emp.roles.forEach((r: any) => {
      roles.push(typeof r === 'string' ? { code: r, name: r } : { code: r?.code, name: r?.name });
    });
  }
  if (typeof emp.role === 'string') roles.push({ code: emp.role, name: emp.role });
  else if (emp.role && typeof emp.role === 'object') roles.push({ code: emp.role.code, name: emp.role.name });
  return roles;
};

const VALID_APPROVER_CODES = new Set([
  'admin', 'hr', 'super', 'supper', 'super_admin', 'supper_admin', 'admin_hr',
]);
const VALID_APPROVER_NAMES = new Set(['admin', 'hr', 'quản trị', 'quản trị viên', 'nhân sự']);

export const isApproverEligible = (emp: any): boolean => {
  const roles = extractEmployeeRoles(emp);
  return roles.some(({ code, name }) => {
    const c = (code || '').toLowerCase().trim();
    const n = (name || '').toLowerCase().trim();
    if (VALID_APPROVER_CODES.has(c) || VALID_APPROVER_NAMES.has(n)) return true;
    if (c.includes('admin') || n.includes('admin') || n.includes('quản trị')) return true;
    return (c.includes('hr') || n.includes('nhân sự')) && !n.includes('nhân viên') && !c.includes('employee');
  });
};

export const getApproverRoleBadge = (emp: any): string => {
  if (Array.isArray(emp?.roles) && emp.roles.length > 0) {
    const names = emp.roles.map((r: any) => (typeof r === 'string' ? r : r.name || r.code)).filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  if (typeof emp?.role === 'string') return emp.role;
  if (emp?.role && typeof emp.role === 'object') return emp.role.name || emp.role.code || '';
  return 'Cán bộ duyệt';
};
