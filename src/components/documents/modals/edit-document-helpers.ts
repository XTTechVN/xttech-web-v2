import toast from 'react-hot-toast';
import { updateDocument, submitDocument } from '@/actions/document';
import type { DocumentCategory, DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, SHARE_SCOPE_MAP } from '@/types';
import { isApproverEligible, getApproverRoleBadge } from '@/utils';

export function flattenCategoriesForSelect(
  cats: DocumentCategory[],
  prefix = '',
  visited = new Set<number>(),
): { id: number; name: string }[] {
  let result: { id: number; name: string }[] = [];
  if (!Array.isArray(cats)) return result;
  for (const cat of cats) {
    if (cat?.id && !visited.has(cat.id)) {
      visited.add(cat.id);
      result.push({ id: cat.id, name: `${prefix}${cat.name}` });
    }
    if (cat?.children?.length) {
      result = result.concat(flattenCategoriesForSelect(cat.children, `${prefix}— `, visited));
    }
  }
  return result;
}

export function extractDocumentRecipientIds(
  targetDoc: DocumentItem | null | undefined,
  departments: any[],
): { userIds: string[]; departmentIds: string[] } {
  if (!targetDoc) return { userIds: [], departmentIds: [] };

  const userIdsSet = new Set<string>();
  const rawUserIds = (targetDoc as any)?.recipientUserIds || [];
  if (Array.isArray(rawUserIds)) {
    rawUserIds.forEach((uid: any) => uid && userIdsSet.add(String(uid)));
  }
  if (Array.isArray(targetDoc.recipients)) {
    targetDoc.recipients.forEach((r: any) => {
      const uid = r.userId || r.user?.id || (typeof r === 'string' ? r : null);
      if (uid) userIdsSet.add(String(uid));
    });
  }

  const deptIdsSet = new Set<string>();
  const addDept = (val: any) => {
    if (val === null || val === undefined) return;
    if (typeof val === 'number' || typeof val === 'string') {
      const str = String(val).trim();
      if (str && str !== '0' && str !== 'NaN') deptIdsSet.add(str);
      return;
    }
    if (typeof val === 'object') {
      const id = val.id ?? val.departmentId ?? val.value;
      if (id !== undefined && id !== null) {
        deptIdsSet.add(String(id));
        return;
      }
      const name = val.name || val.departmentName;
      if (name) {
        const match = departments.find((d: any) => String(d.name || '').toLowerCase() === String(name).toLowerCase());
        if (match?.id) deptIdsSet.add(String(match.id));
      }
    }
  };

  const rawDeptLists = [
    (targetDoc as any)?.recipientDepartmentIds,
    (targetDoc as any)?.departmentIds,
    (targetDoc as any)?.recipientDepartments,
    (targetDoc as any)?.departments,
  ];
  rawDeptLists.forEach((list) => Array.isArray(list) && list.forEach(addDept));

  if (Array.isArray(targetDoc.recipients)) {
    targetDoc.recipients.forEach((r: any) => {
      addDept(r.departmentId);
      addDept(r.department);
      if (r.departmentName && !r.departmentId) addDept({ departmentName: r.departmentName });
    });
  }
  if (Array.isArray((targetDoc as any)?.shares)) {
    (targetDoc as any).shares.forEach((s: any) => {
      addDept(s.departmentId);
      addDept(s.department);
    });
  }
  if ((targetDoc as any)?.departmentId) addDept((targetDoc as any).departmentId);

  return {
    userIds: Array.from(userIdsSet),
    departmentIds: Array.from(deptIdsSet),
  };
}

export const DOC_TYPE_SELECT_OPTIONS = Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
  value: key,
  label: item.label,
}));

export const SHARE_SCOPE_SELECT_OPTIONS = [
  { value: 'private', label: SHARE_SCOPE_MAP.private },
  { value: 'department', label: SHARE_SCOPE_MAP.department },
  { value: 'all', label: SHARE_SCOPE_MAP.all },
];

export function buildApproverOptions(employees: any[]) {
  const seenIds = new Set<string | number>();
  const uniqueApprovers = employees.filter((emp: any) => {
    if (!emp?.id || seenIds.has(emp.id) || !isApproverEligible(emp)) return false;
    seenIds.add(emp.id);
    return true;
  });

  return [
    { value: '', label: 'Không chỉ định (Tự duyệt / Bản thảo)' },
    ...uniqueApprovers.map((emp: any) => {
      const roleName = getApproverRoleBadge(emp);
      const roleLabel = roleName ? ` [${roleName}]` : '';
      return {
        value: emp.id,
        label: `${emp.fullName || emp.name}${roleLabel} (${emp.email || 'NV'})`,
      };
    }),
  ];
}

export function buildEmployeeRecipientOptions(
  employees: any[],
  doc: DocumentItem | null,
  currentUser: any,
) {
  const creatorId = String(doc?.createdById || (doc as any)?.createdBy?.id || currentUser?.id || '');
  const creatorEmail = ((doc as any)?.createdBy?.email || currentUser?.email || '').toLowerCase().trim();
  const seen = new Set<string | number>();

  return employees
    .filter((emp: any) => {
      if (!emp?.id || seen.has(emp.id)) return false;
      seen.add(emp.id);
      if (creatorId && String(emp.id) === creatorId) return false;
      if (creatorEmail && emp.email && emp.email.toLowerCase().trim() === creatorEmail) return false;
      return true;
    })
    .map((emp: any) => ({
      value: String(emp.id),
      label: emp.fullName || emp.username || 'Nhân sự',
      subLabel: emp.email || (emp.code ? `Mã: ${emp.code}` : undefined),
    }));
}

export function buildDepartmentRecipientOptions(departments: any[]) {
  const seen = new Set<string | number>();
  return departments
    .filter((dept: any) => {
      if (!dept?.id || seen.has(dept.id)) return false;
      seen.add(dept.id);
      return true;
    })
    .map((dept: any) => ({
      value: String(dept.id),
      label: dept.name,
      subLabel: dept.code ? `[${dept.code}]` : undefined,
    }));
}

export async function saveAndOptionallySubmitDocument({
  doc,
  data,
  selectedUserIds,
  selectedDepartmentIds,
  isSubmittingForApproval,
}: {
  doc: DocumentItem;
  data: any;
  selectedUserIds: (string | number)[];
  selectedDepartmentIds: (string | number)[];
  isSubmittingForApproval: boolean;
}) {
  const payload: Record<string, any> = {
    title: data.title.trim(),
    documentType: data.documentType,
    shareScope: data.shareScope || 'private',
    recipientUserIds: selectedUserIds.map(String).filter(Boolean),
    recipientDepartmentIds: selectedDepartmentIds.map(Number).filter((n) => !Number.isNaN(n)),
  };
  if (data.code?.trim()) payload.code = data.code.trim().toUpperCase();
  if (data.categoryId) payload.categoryId = Number(data.categoryId);
  if (data.summary !== undefined) payload.summary = data.summary?.trim() || null;
  if (data.approverId) payload.approverId = data.approverId.trim();
  if (data.effectiveDate) payload.effectiveDate = data.effectiveDate.trim();
  if (data.expirationDate) payload.expirationDate = data.expirationDate.trim();

  const isCurrentDraft =
    !doc.approvalStatus ||
    doc.approvalStatus === 'draft' ||
    doc.status === 'draft' ||
    doc.approvalStatus === 'rejected';
  const shouldPromoteToPending = isSubmittingForApproval || (Boolean(data.approverId?.trim()) && isCurrentDraft);

  if (shouldPromoteToPending) {
    payload.status = 'pending';
    payload.approvalStatus = 'pending';
  }

  await updateDocument(doc.id, payload);
  if (shouldPromoteToPending && data.approverId?.trim()) {
    await submitDocument(doc.id, { approverId: data.approverId.trim() }).catch(() => {});
    toast.success('Đã lưu và chuyển tài liệu sang trạng thái Chờ duyệt (Pending)!');
  } else {
    toast.success('Cập nhật thông tin tài liệu thành công!');
  }
}
