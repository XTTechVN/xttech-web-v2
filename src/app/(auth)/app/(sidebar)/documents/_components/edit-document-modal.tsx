'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Button, Input, Textarea, Select, MultiSelect } from '@/components';
import {
  updateDocument,
  getDocumentById,
  getDocumentShares,
} from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import {
  DOCUMENT_TYPE_MAP,
  SHARE_SCOPE_MAP,
  DOCUMENT_STATUS_MAP,
  APPROVAL_STATUS_MAP,
} from '@/types';
import { formatBytes, getFileVisualInfo } from '../_utils/doc-helpers';
import toast from 'react-hot-toast';
import {
  Edit3,
  FileUp,
  X,
  Clock,
  Check,
  CheckCircle2,
  Megaphone,
} from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
}

const editDocumentSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề tài liệu không được để trống' }),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại văn bản' }),
  code: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
  summary: z.string().optional(),
  shareScope: z.string().optional(),
  approverId: z.string().optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
});

type EditDocumentFormValues = z.infer<typeof editDocumentSchema>;

const isApproverEligible = (emp: any): boolean => {
  if (!emp) return false;
  const validKeywords = ['admin', 'hr', 'super', 'supper', 'quản trị', 'nhân sự'];
  const matchString = (val?: string | null): boolean => {
    if (!val || typeof val !== 'string') return false;
    const lower = val.toLowerCase().trim();
    return validKeywords.some((keyword) => lower.includes(keyword));
  };
  if (Array.isArray(emp.roles) && emp.roles.length > 0) {
    const hasMatch = emp.roles.some((r: any) => {
      if (typeof r === 'string') return matchString(r);
      return matchString(r?.code) || matchString(r?.name);
    });
    if (hasMatch) return true;
  }
  if (typeof emp.role === 'string' && matchString(emp.role)) return true;
  if (emp.role && typeof emp.role === 'object') {
    if (matchString(emp.role?.code) || matchString(emp.role?.name)) return true;
  }
  if (Array.isArray(emp.positions) && emp.positions.length > 0) {
    const hasMatchPos = emp.positions.some((p: any) => {
      if (typeof p === 'string') return matchString(p);
      return matchString(p?.code) || matchString(p?.name);
    });
    if (hasMatchPos) return true;
  }
  return false;
};

const getApproverRoleBadge = (emp: any): string => {
  if (Array.isArray(emp.roles) && emp.roles.length > 0) {
    const names = emp.roles
      .map((r: any) => (typeof r === 'string' ? r : r.name || r.code))
      .filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  if (typeof emp.role === 'string') return emp.role;
  if (emp.role && typeof emp.role === 'object') return emp.role.name || emp.role.code || '';
  return 'Cán bộ duyệt';
};

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  categories,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<(string | number)[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditDocumentFormValues>({
    resolver: zodResolver(editDocumentSchema),
  });

  // Fetch employees & departments for selection
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'share-options'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'share-options'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen,
  });

  // Fetch chi tiết tài liệu đầy đủ kèm recipients & departments
  const { data: fullDoc } = useQuery({
    queryKey: ['document-detail', doc?.id],
    queryFn: () => (doc?.id ? getDocumentById(doc.id) : null),
    enabled: Boolean(isOpen && doc?.id),
  });

  // Fetch thêm shares của tài liệu nếu có
  const { data: sharesData = [] } = useQuery({
    queryKey: ['document-shares', doc?.id],
    queryFn: () => (doc?.id ? getDocumentShares(doc.id) : []),
    enabled: Boolean(isOpen && doc?.id),
  });

  const employees = employeesData?.items || [];
  const departments = useMemo(() => {
    const raw = (departmentsData as any)?.data ?? departmentsData;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  }, [departmentsData]);

  useEffect(() => {
    register('title');
    register('documentType');
    register('code');
    register('categoryId');
    register('summary');
    register('shareScope');
    register('approverId');
    register('effectiveDate');
    register('expirationDate');
  }, [register]);

  useEffect(() => {
    if (!isOpen || !doc) return;

    const targetDoc = fullDoc || doc;

    reset({
      title: targetDoc.title || '',
      documentType: targetDoc.documentType || 'work_report',
      code: targetDoc.code || '',
      categoryId: targetDoc.categoryId || targetDoc.category?.id || '',
      summary: targetDoc.summary || '',
      shareScope: targetDoc.shareScope || 'private',
      approverId: targetDoc.approverId || targetDoc.approver?.id || '',
      effectiveDate: targetDoc.effectiveDate ? dayjs(targetDoc.effectiveDate).format('YYYY-MM-DD') : '',
      expirationDate: targetDoc.expirationDate ? dayjs(targetDoc.expirationDate).format('YYYY-MM-DD') : '',
    });

    // 1. Trích xuất danh sách ID người dùng nhận đích danh
    const userIdsSet = new Set<string>();

    const rawUserIds = (targetDoc as any)?.recipientUserIds || (targetDoc as any)?.recipient_user_ids || [];
    if (Array.isArray(rawUserIds)) {
      rawUserIds.forEach((uid: any) => uid && userIdsSet.add(String(uid)));
    }

    if (Array.isArray(targetDoc.recipients)) {
      targetDoc.recipients.forEach((r: any) => {
        const uid = r.userId || r.user_id || (r.user && r.user.id) || (typeof r === 'string' ? r : null);
        if (uid) userIdsSet.add(String(uid));
      });
    }

    if (Array.isArray(sharesData)) {
      sharesData.forEach((s: any) => {
        if (s.userId) userIdsSet.add(String(s.userId));
      });
    }

    setSelectedUserIds(Array.from(userIdsSet));

    // 2. Trích xuất danh sách ID phòng ban nhận
    const deptIdsSet = new Set<string>();

    const addDept = (val: any) => {
      if (val === null || val === undefined) return;
      if (typeof val === 'number' || typeof val === 'string') {
        const str = String(val).trim();
        if (str && str !== '0' && str !== 'NaN') {
          deptIdsSet.add(str);
        }
      } else if (typeof val === 'object') {
        const id = val.id ?? val.departmentId ?? val.department_id ?? val.value;
        if (id !== undefined && id !== null) {
          deptIdsSet.add(String(id));
        } else if (val.name || val.departmentName || val.department_name) {
          const name = val.name || val.departmentName || val.department_name;
          const match = departments.find((d: any) => String(d.name || '').toLowerCase() === String(name).toLowerCase());
          if (match?.id) deptIdsSet.add(String(match.id));
        }
      }
    };

    // Quét từ các mảng ID phòng ban
    const rawDeptLists = [
      (targetDoc as any)?.recipientDepartmentIds,
      (targetDoc as any)?.recipient_department_ids,
      (targetDoc as any)?.departmentIds,
      (targetDoc as any)?.department_ids,
      (targetDoc as any)?.recipientDepartments,
      (targetDoc as any)?.recipient_departments,
      (targetDoc as any)?.departments,
    ];
    rawDeptLists.forEach((list) => {
      if (Array.isArray(list)) {
        list.forEach(addDept);
      }
    });

    // Quét từ recipients
    if (Array.isArray(targetDoc.recipients)) {
      targetDoc.recipients.forEach((r: any) => {
        addDept(r.departmentId);
        addDept(r.department_id);
        addDept(r.department);
        if (r.departmentName && !r.departmentId) {
          addDept({ departmentName: r.departmentName });
        }
      });
    }

    // Quét từ shares
    if (Array.isArray(sharesData)) {
      sharesData.forEach((s: any) => {
        addDept(s.departmentId);
        addDept(s.department_id);
        addDept(s.department);
      });
    }

    if (Array.isArray((targetDoc as any)?.shares)) {
      (targetDoc as any).shares.forEach((s: any) => {
        addDept(s.departmentId);
        addDept(s.department_id);
        addDept(s.department);
      });
    }

    // Nếu văn bản có departmentId riêng
    if ((targetDoc as any)?.departmentId) {
      addDept((targetDoc as any).departmentId);
    }

    setSelectedDepartmentIds(Array.from(deptIdsSet));
  }, [isOpen, doc, fullDoc, sharesData, departments, reset]);

  // Submit update changes
  const handleFormSubmit = async (data: EditDocumentFormValues) => {
    if (!doc) return;

    try {
      setLoading(true);

      const payload: Record<string, any> = {
        title: data.title.trim(),
        documentType: data.documentType,
        document_type: data.documentType,
        shareScope: data.shareScope || 'private',
        share_scope: data.shareScope || 'private',
      };

      if (data.code?.trim()) payload.code = data.code.trim().toUpperCase();
      if (data.categoryId) {
        payload.categoryId = Number(data.categoryId);
        payload.category_id = Number(data.categoryId);
      }
      if (data.summary !== undefined) payload.summary = data.summary?.trim() || null;
      if (data.approverId) {
        payload.approverId = data.approverId.trim();
        payload.approver_id = data.approverId.trim();
      }
      if (data.effectiveDate) {
        payload.effectiveDate = data.effectiveDate.trim();
        payload.effective_date = data.effectiveDate.trim();
      }
      if (data.expirationDate) {
        payload.expirationDate = data.expirationDate.trim();
        payload.expiration_date = data.expirationDate.trim();
      }

      // Luôn đồng bộ danh sách người nhận và phòng ban nhận đầy đủ các field
      const userIdsStr = selectedUserIds.map(String).filter(Boolean);
      payload.recipientUserIds = userIdsStr;
      payload.recipient_user_ids = userIdsStr;
      payload.userIds = userIdsStr;
      payload.user_ids = userIdsStr;

      const deptIdsNum = selectedDepartmentIds.map(Number).filter((n) => !isNaN(n));
      payload.recipientDepartmentIds = deptIdsNum;
      payload.recipient_department_ids = deptIdsNum;
      payload.departmentIds = deptIdsNum;
      payload.department_ids = deptIdsNum;

      await updateDocument(doc.id, payload);
      toast.success('Cập nhật thông tin tài liệu thành công!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-detail', doc.id] });
      queryClient.invalidateQueries({ queryKey: ['document-shares', doc.id] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật tài liệu');
    } finally {
      setLoading(false);
    }
  };

  // Flatten categories for select dropdown
  const flattenCategories = (
    cats: DocumentCategory[],
    prefix = '',
    visited = new Set<number>()
  ): { id: number; name: string }[] => {
    let result: { id: number; name: string }[] = [];
    if (!Array.isArray(cats)) return result;
    cats.forEach((cat) => {
      if (cat?.id && !visited.has(cat.id)) {
        visited.add(cat.id);
        result.push({ id: cat.id, name: `${prefix}${cat.name}` });
      }
      if (cat?.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, `${prefix}— `, visited));
      }
    });
    return result;
  };

  const flatCategoryList = useMemo(() => flattenCategories(categories), [categories]);

  const docTypeOptions = useMemo(
    () =>
      Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    [],
  );

  const folderOptions = useMemo(
    () => [
      { value: '', label: 'Thư mục gốc (Root)' },
      ...flatCategoryList.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [flatCategoryList],
  );

  const shareScopeOptions = useMemo(
    () => [
      { value: 'private', label: SHARE_SCOPE_MAP.private },
      { value: 'department', label: SHARE_SCOPE_MAP.department },
      { value: 'all', label: SHARE_SCOPE_MAP.all },
    ],
    [],
  );

  const approverOptions = useMemo(() => {
    const eligibleApprovers = employees.filter(isApproverEligible);
    const seenIds = new Set<string | number>();

    const uniqueApprovers = eligibleApprovers.filter((emp: any) => {
      if (!emp?.id || seenIds.has(emp.id)) return false;
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
  }, [employees]);

  const employeeOptions = useMemo(() => {
    const seen = new Set<string | number>();
    return employees
      .filter((emp: any) => {
        if (!emp?.id || seen.has(emp.id)) return false;
        seen.add(emp.id);
        return true;
      })
      .map((emp: any) => ({
        value: String(emp.id),
        label: emp.fullName || emp.username || 'Nhân sự',
        subLabel: emp.email || (emp.code ? `Mã: ${emp.code}` : undefined),
      }));
  }, [employees]);

  const departmentOptions = useMemo(() => {
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
  }, [departments]);

  const titleVal = watch('title');
  const codeVal = watch('code');
  const documentTypeVal = watch('documentType');
  const categoryIdVal = watch('categoryId');
  const shareScopeVal = watch('shareScope');
  const approverIdVal = watch('approverId');
  const effectiveDateVal = watch('effectiveDate');
  const expirationDateVal = watch('expirationDate');
  const summaryVal = watch('summary');

  if (!doc) return null;

  // Workflow states
  const currentStatus = doc.status || 'draft';
  const currentApprovalStatus = doc.approvalStatus || 'draft';
  const isDraftOrRejected = currentApprovalStatus === 'draft' || currentApprovalStatus === 'rejected' || currentStatus === 'draft';
  const isPending = currentApprovalStatus === 'pending' || currentStatus === 'pending';
  const isApproved = (currentApprovalStatus === 'approved' || currentStatus === 'approved') && currentStatus !== 'published';
  const isPublished = currentStatus === 'published';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Edit3 className="text-primary" size={20} />
          <span>Chỉnh sửa thông tin tài liệu</span>
        </div>
      }
      className="m-2 max-w-2xl w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-xs">
        {/* Workflow Status Tracker Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Tiến trình duyệt & Ban hành
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                DOCUMENT_STATUS_MAP[currentStatus]?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {DOCUMENT_STATUS_MAP[currentStatus]?.label || currentStatus}
              </span>
              {currentApprovalStatus !== currentStatus && (
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                  APPROVAL_STATUS_MAP[currentApprovalStatus]?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {APPROVAL_STATUS_MAP[currentApprovalStatus]?.label || currentApprovalStatus}
                </span>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-4 gap-1 pt-1 text-center">
            {/* Step 1: Soạn thảo */}
            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
              isDraftOrRejected ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              <Edit3 size={14} className={isDraftOrRejected ? 'text-amber-600' : 'text-slate-400'} />
              <span className="text-[10px]">1. Soạn thảo</span>
            </div>

            {/* Step 2: Chờ duyệt */}
            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
              isPending ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              <Clock size={14} className={isPending ? 'text-sky-600' : 'text-slate-400'} />
              <span className="text-[10px]">2. Chờ duyệt</span>
            </div>

            {/* Step 3: Đã duyệt */}
            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
              isApproved ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              <CheckCircle2 size={14} className={isApproved ? 'text-emerald-600' : 'text-slate-400'} />
              <span className="text-[10px]">3. Đã duyệt</span>
            </div>

            {/* Step 4: Ban hành */}
            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
              isPublished ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              <Megaphone size={14} className={isPublished ? 'text-teal-600' : 'text-slate-400'} />
              <span className="text-[10px]">4. Ban hành</span>
            </div>
          </div>
        </div>



        {/* Title & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Tiêu đề tài liệu *"
              fullWidth
              placeholder="Ví dụ: Quy chế công tác phí 2026..."
              value={titleVal}
              onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })}
              error={errors.title?.message}
            />
          </div>

          <div>
            <Input
              label="Mã văn bản (Tùy chọn)"
              fullWidth
              placeholder="TỰ ĐỘNG NẾU ĐỂ TRỐNG"
              value={codeVal}
              onChange={(e) => setValue('code', e.target.value.toUpperCase())}
              error={errors.code?.message}
              className="font-mono uppercase"
            />
          </div>
        </div>

        {/* Document Type & Folder Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Phân loại văn bản *"
              fullWidth
              value={documentTypeVal}
              onChange={(e) => setValue('documentType', e.target.value, { shouldValidate: true })}
              options={docTypeOptions}
              error={errors.documentType?.message}
            />
          </div>

          <div>
            <Select
              label="Lưu vào Thư mục"
              fullWidth
              value={categoryIdVal}
              onChange={(e) => setValue('categoryId', e.target.value ? Number(e.target.value) : '')}
              options={folderOptions}
            />
          </div>
        </div>

        {/* Share Scope & Approver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Phạm vi chia sẻ"
              fullWidth
              value={shareScopeVal}
              onChange={(e) => setValue('shareScope', e.target.value)}
              options={shareScopeOptions}
            />
          </div>

          <div>
            <Select
              label="Người phê duyệt (Chỉ Admin / HR / Super Admin)"
              fullWidth
              value={approverIdVal}
              onChange={(e) => setValue('approverId', e.target.value)}
              options={approverOptions}
            />
          </div>
        </div>

        {/* Recipients MultiSelect */}
        {shareScopeVal !== 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <MultiSelect
                label="Người nhận đích danh"
                options={employeeOptions}
                value={selectedUserIds}
                onChange={setSelectedUserIds}
                placeholder="Chọn nhân sự..."
                searchPlaceholder="Tìm tên hoặc email..."
                fullWidth
              />
            </div>
            <div>
              <MultiSelect
                label="Phòng ban nhận"
                options={departmentOptions}
                value={selectedDepartmentIds}
                onChange={setSelectedDepartmentIds}
                placeholder="Chọn phòng ban..."
                searchPlaceholder="Tìm tên phòng ban..."
                fullWidth
              />
            </div>
          </div>
        )}

        {/* Effective & Expiration Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              type="date"
              label="Ngày bắt đầu hiệu lực (Tùy chọn)"
              fullWidth
              value={effectiveDateVal}
              onChange={(e) => setValue('effectiveDate', e.target.value)}
            />
          </div>

          <div>
            <Input
              type="date"
              label="Ngày hết hiệu lực (Tùy chọn)"
              fullWidth
              value={expirationDateVal}
              onChange={(e) => setValue('expirationDate', e.target.value)}
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <Textarea
            label="Trích yếu nội dung"
            fullWidth
            rows={2}
            placeholder="Tóm tắt ngắn gọn nội dung tài liệu..."
            value={summaryVal}
            onChange={(e) => setValue('summary', e.target.value)}
          />
        </div>

        {/* Standard Save & Cancel */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/80">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading} loading={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDocumentModal;
