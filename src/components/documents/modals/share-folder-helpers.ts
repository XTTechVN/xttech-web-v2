import toast from 'react-hot-toast';
import {
  shareDocumentCategory,
  updateDocumentCategory,
} from '@/actions/document';
import type { FolderShare } from '@/types';

export async function submitCategoryShares({
  folderId,
  shareTarget,
  selectedUserIds,
  selectedDepartmentIds,
  permission,
  departments,
  employees,
}: {
  folderId: number;
  shareTarget: 'user' | 'department' | 'all';
  selectedUserIds: (string | number)[];
  selectedDepartmentIds: (string | number)[];
  permission: 'view' | 'edit';
  departments: any[];
  employees: any[];
}) {
  if (shareTarget === 'user') {
    let ok = 0;
    for (const userId of selectedUserIds) {
      await shareDocumentCategory(folderId, { userId: String(userId), permission })
        .then(() => { ok += 1; })
        .catch(() => {});
    }
    return ok > 0
      ? toast.success(`Đã cập nhật quyền chia sẻ cho ${ok} nhân sự thành công`)
      : toast.error('Không thể chia sẻ cho các nhân sự đã chọn');
  }
  if (shareTarget === 'department') {
    let ok = 0;
    for (const deptId of selectedDepartmentIds) {
      await shareDocumentCategory(folderId, { departmentId: Number(deptId), permission })
        .then(() => { ok += 1; })
        .catch(() => {});
    }
    return ok > 0
      ? toast.success(`Đã cập nhật quyền chia sẻ cho ${ok} phòng ban thành công`)
      : toast.error('Không thể chia sẻ cho các phòng ban đã chọn');
  }
  await updateDocumentCategory(folderId, { shareScope: 'all' } as any).catch(() => {});
  if (departments.length > 0) {
    for (const dept of departments) {
      await shareDocumentCategory(folderId, { departmentId: Number(dept.id), permission }).catch(() => {});
    }
  } else {
    for (const emp of employees) {
      await shareDocumentCategory(folderId, { userId: String(emp.id), permission }).catch(() => {});
    }
  }
  toast.success('Đã chia sẻ thư mục cho toàn bộ hệ thống thành công!');
}

export function filterNonOwnerShares({
  shares,
  ownerId,
  ownerEmail,
  ownerName,
  currentUserId,
}: {
  shares: FolderShare[];
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  currentUserId?: string | number;
}): FolderShare[] {
  const normalizedOwnerName = ownerName.toLowerCase().trim();
  return shares.filter((s) => {
    const uId = String(s.userId || (s.user as any)?.id || '');
    const uEmail = (s.user?.email || '').toLowerCase().trim();
    const uName = (s.userName || s.user?.fullName || '').toLowerCase().trim();
    return (
      !(ownerId && uId && uId === ownerId) &&
      !(ownerEmail && uEmail && uEmail === ownerEmail) &&
      !(normalizedOwnerName && uName && uName === normalizedOwnerName) &&
      !(currentUserId && uId && uId === String(currentUserId))
    );
  });
}

export function buildShareEmployeeOptions({
  employees,
  existingUserIds,
  ownerId,
  ownerEmail,
  currentUserId,
}: {
  employees: any[];
  existingUserIds: string[];
  ownerId: string;
  ownerEmail: string;
  currentUserId?: string | number;
}) {
  const existingSet = new Set(existingUserIds);
  return employees
    .filter((emp: any) => {
      if (ownerId && String(emp.id) === ownerId) return false;
      if (currentUserId && String(emp.id) === String(currentUserId)) return false;
      if (ownerEmail && emp.email && emp.email.toLowerCase().trim() === ownerEmail) return false;
      return true;
    })
    .map((emp: any) => {
      const isShared = existingSet.has(String(emp.id));
      const baseSub = emp.email || (emp.code ? `Mã: ${emp.code}` : '');
      return {
        value: String(emp.id),
        label: emp.fullName || emp.username || 'Nhân sự',
        subLabel: isShared ? `Đã chia sẻ${baseSub ? ` • ${baseSub}` : ''}` : baseSub,
      };
    });
}

export function buildShareDepartmentOptions(departments: any[], existingDepartmentIds: string[]) {
  const existingSet = new Set(existingDepartmentIds);
  return departments.map((dept: any) => {
    const isShared = existingSet.has(String(dept.id));
    const baseSub = dept.code ? `[${dept.code}]` : undefined;
    return {
      value: String(dept.id),
      label: dept.name,
      subLabel: isShared ? `Đã chia sẻ${baseSub ? ` • ${baseSub}` : ''}` : baseSub,
    };
  });
}
