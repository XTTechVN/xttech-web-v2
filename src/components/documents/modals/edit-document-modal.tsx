'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input, Select, MultiSelect } from '@/components';
import { getDocumentById } from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { getDepartments } from '@/actions/department';
import toast from 'react-hot-toast';
import { Edit3 } from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/utils';
import {
  flattenCategoriesForSelect,
  extractDocumentRecipientIds,
  DOC_TYPE_SELECT_OPTIONS,
  SHARE_SCOPE_SELECT_OPTIONS,
  buildApproverOptions,
  buildEmployeeRecipientOptions,
  buildDepartmentRecipientOptions,
  saveAndOptionallySubmitDocument,
} from './edit-document-helpers';

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

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  categories,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'submit'>('save');
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<(string | number)[]>([]);

  const currentUser = useAuthStore((state) => state.user);
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditDocumentFormValues>({
    resolver: zodResolver(editDocumentSchema),
  });

  const { data: employeesData } = useQuery({
    queryKey: DOC_QUERY_KEYS.options.employees,
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  const { data: departmentsData } = useQuery({
    queryKey: DOC_QUERY_KEYS.options.departments,
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen,
  });

  const { data: fullDoc } = useQuery({
    queryKey: DOC_QUERY_KEYS.documents.detail(doc?.id),
    queryFn: () => (doc?.id ? getDocumentById(doc.id) : null),
    enabled: Boolean(isOpen && doc?.id),
  });

  const employees = employeesData?.items || [];
  const departments = useMemo(() => {
    const raw = (departmentsData as any)?.data ?? departmentsData;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
  }, [departmentsData]);

  const targetDoc = fullDoc || doc;
  const syncKey = `${isOpen}::${doc?.id ?? ''}::${Boolean(fullDoc)}::${departments.length}`;
  const [prevSyncKey, setPrevSyncKey] = useState('');
  if (syncKey !== prevSyncKey) {
    setPrevSyncKey(syncKey);
    if (isOpen && targetDoc) {
      const { userIds, departmentIds } = extractDocumentRecipientIds(targetDoc, departments);
      setSelectedUserIds(userIds);
      setSelectedDepartmentIds(departmentIds);
    }
  }

  useEffect(() => {
    if (!isOpen || !targetDoc) return;
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
  }, [isOpen, targetDoc, reset]);

  const handleFormSubmit = async (data: EditDocumentFormValues, isSubmittingForApproval = false) => {
    if (!doc) return;
    if (isSubmittingForApproval && !data.approverId?.trim()) {
      toast.error('Vui lòng chọn Người phê duyệt để trình duyệt văn bản sang trạng thái Chờ duyệt!');
      return;
    }

    try {
      setLoading(true);
      await saveAndOptionallySubmitDocument({
        doc,
        data,
        selectedUserIds,
        selectedDepartmentIds,
        isSubmittingForApproval,
      });
      invalidateDocumentQueries(queryClient);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể cập nhật tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const folderOptions = useMemo(
    () => [
      { value: '', label: 'Thư mục gốc (Root)' },
      ...flattenCategoriesForSelect(categories).map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [categories],
  );

  const approverOptions = useMemo(() => buildApproverOptions(employees), [employees]);
  const employeeOptions = useMemo(
    () => buildEmployeeRecipientOptions(employees, doc, currentUser),
    [employees, doc, currentUser],
  );
  const departmentOptions = useMemo(() => buildDepartmentRecipientOptions(departments), [departments]);

  if (!doc) return null;

  const isDraftOrRejected =
    !doc.approvalStatus ||
    doc.approvalStatus === 'draft' ||
    doc.status === 'draft' ||
    doc.approvalStatus === 'rejected';
  const shareScopeVal = watch('shareScope');

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
      <form
        onSubmit={handleSubmit((d) => {
          setSubmitAction('save');
          return handleFormSubmit(d, false);
        })}
        className="flex flex-col gap-4 text-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Tiêu đề tài liệu *" fullWidth placeholder="Ví dụ: Quy chế công tác phí 2026..." value={watch('title')} onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })} error={errors.title?.message} />
          <Input label="Mã văn bản (Tùy chọn)" fullWidth placeholder="TỰ ĐỘNG NẾU ĐỂ TRỐNG" value={watch('code')} onChange={(e) => setValue('code', e.target.value.toUpperCase())} error={errors.code?.message} className="font-mono uppercase" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Trích yếu nội dung (Tùy chọn)</label>
          <textarea rows={2} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-2xs" placeholder="Tóm tắt ngắn gọn mục đích, nội dung chính của văn bản..." value={watch('summary') || ''} onChange={(e) => setValue('summary', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Phân loại văn bản *" fullWidth value={watch('documentType')} onChange={(e) => setValue('documentType', e.target.value, { shouldValidate: true })} options={DOC_TYPE_SELECT_OPTIONS} error={errors.documentType?.message} />
          <Select label="Lưu vào Thư mục" fullWidth disabled value={watch('categoryId')} onChange={(e) => setValue('categoryId', e.target.value ? Number(e.target.value) : '')} options={folderOptions} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Phạm vi chia sẻ" fullWidth value={shareScopeVal} onChange={(e) => setValue('shareScope', e.target.value)} options={SHARE_SCOPE_SELECT_OPTIONS} />
          <Select label="Người phê duyệt (Chỉ Admin / HR / Super Admin)" fullWidth value={watch('approverId')} onChange={(e) => setValue('approverId', e.target.value)} options={approverOptions} />
        </div>

        {shareScopeVal !== 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MultiSelect label="Người nhận đích danh" options={employeeOptions} value={selectedUserIds} onChange={setSelectedUserIds} placeholder="Chọn nhân sự..." searchPlaceholder="Tìm tên hoặc email..." fullWidth />
            <MultiSelect label="Phòng ban nhận" options={departmentOptions} value={selectedDepartmentIds} onChange={setSelectedDepartmentIds} placeholder="Chọn phòng ban..." searchPlaceholder="Tìm tên phòng ban..." fullWidth />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input type="date" label="Ngày bắt đầu hiệu lực (Tùy chọn)" fullWidth value={watch('effectiveDate')} onChange={(e) => setValue('effectiveDate', e.target.value)} />
          <Input type="date" label="Ngày hết hiệu lực (Tùy chọn)" fullWidth value={watch('expirationDate')} onChange={(e) => setValue('expirationDate', e.target.value)} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button variant="outline" size="sm" type="button" disabled={loading} loading={loading && submitAction === 'save'} onClick={handleSubmit((d) => { setSubmitAction('save'); return handleFormSubmit(d, false); })}>
            {isDraftOrRejected ? 'Lưu bản nháp' : 'Lưu thay đổi'}
          </Button>
          {isDraftOrRejected && (
            <Button variant="primary" size="sm" type="button" disabled={loading} loading={loading && submitAction === 'submit'} onClick={handleSubmit((d) => { setSubmitAction('submit'); return handleFormSubmit(d, true); })}>
              Lưu & Trình duyệt
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default EditDocumentModal;
