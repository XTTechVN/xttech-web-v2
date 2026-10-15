'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Button, Input, Select } from '@/components';
import { createDocument } from '@/actions/document';
import { getEmployees } from '@/actions/employee';
import { DOCUMENT_TYPE_MAP } from '@/types';
import { formatBytes, getFileVisualInfo, isApproverEligible, getApproverRoleBadge } from '../_utils/doc-helpers';
import toast from 'react-hot-toast';
import { Upload, FileUp, X } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: number | null;
  currentFolder?: DocumentCategory | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
}

// Validation schema dùng Zod theo chuẩn form-modal
const documentSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề tài liệu không được để trống' }),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại văn bản' }),
  code: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
  approverId: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  currentFolderId = null,
  currentFolder = null,
  categories,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      documentType: 'work_report',
      code: '',
      categoryId: currentFolderId || '',
      approverId: '',
    },
  });

  // React Query Mutation để tạo mới tài liệu
  const createDocumentMutation = useMutation({
    mutationFn: async ({ data, file }: { data: DocumentFormValues; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      // Backend FastAPI yêu cầu dữ liệu thông tin tài liệu nằm trong trường 'document_data' (dạng JSON string)
      const documentData: Record<string, any> = {
        title: data.title.trim(),
        documentType: data.documentType,
        document_type: data.documentType,
        shareScope: 'private',
        share_scope: 'private',
        status: 'draft',
        approvalStatus: 'draft',
        approval_status: 'draft',
      };

      if (data.code?.trim()) {
        documentData.code = data.code.trim().toUpperCase();
      }
      const targetCatId = currentFolderId ? Number(currentFolderId) : data.categoryId ? Number(data.categoryId) : undefined;
      if (targetCatId) {
        documentData.category_id = targetCatId;
        documentData.categoryId = targetCatId;
      }
      if (data.approverId?.trim()) {
        documentData.approver_id = data.approverId.trim();
        documentData.approverId = data.approverId.trim();
      }

      formData.append('document_data', JSON.stringify(documentData));
      formData.append('title', data.title.trim());
      formData.append('document_type', data.documentType);
      formData.append('documentType', data.documentType);
      formData.append('share_scope', 'private');
      formData.append('shareScope', 'private');
      formData.append('status', 'draft');
      formData.append('approval_status', 'draft');

      if (data.code?.trim()) {
        formData.append('code', data.code.trim().toUpperCase());
      }
      if (targetCatId) {
        formData.append('category_id', String(targetCatId));
        formData.append('categoryId', String(targetCatId));
      }
      if (data.approverId?.trim()) {
        formData.append('approver_id', data.approverId.trim());
        formData.append('approverId', data.approverId.trim());
      }

      return createDocument(formData);
    },
    onSuccess: () => {
      toast.success('Tải lên và tạo tài liệu thành công!');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-documents'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể tạo tài liệu');
    },
  });

  const loading = createDocumentMutation.isPending;

  useEffect(() => {
    register('title');
    register('documentType');
    register('code');
    register('categoryId');
  }, [register]);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setFileError(null);
      reset({
        title: '',
        documentType: 'work_report',
        code: '',
        categoryId: currentFolderId ? Number(currentFolderId) : '',
        approverId: '',
      });
    }
  }, [isOpen, currentFolderId, reset]);

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileError(null);
      if (!watch('title')?.trim()) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '');
        setValue('title', nameWithoutExt, { shouldValidate: true });
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileError(null);
      if (!watch('title')?.trim()) {
        const nameWithoutExt = droppedFile.name.replace(/\.[^/.]+$/, '');
        setValue('title', nameWithoutExt, { shouldValidate: true });
      }
    }
  };

  const handleFormSubmit = async (data: DocumentFormValues) => {
    if (!file) {
      setFileError('Vui lòng chọn tệp tài liệu đính kèm');
      return;
    }

    try {
      await createDocumentMutation.mutateAsync({
        data,
        file,
      });
    } catch (err) {
      // Error handled by mutation
    }
  };

  // Tạo thụt lề trực quan theo cấp bậc
  const flattenCategories = (cats: DocumentCategory[], prefix = '', visited = new Set<number>()): { id: number; name: string }[] => {
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

  const { data: employeesData } = useQuery({
    queryKey: ['users', 'approver-options'],
    queryFn: () => getEmployees({ limit: 200 }),
    enabled: isOpen,
  });

  const employees = useMemo(() => {
    if (Array.isArray(employeesData?.items)) return employeesData.items;
    if (Array.isArray(employeesData)) return employeesData;
    return [];
  }, [employeesData]);

  const approverOptions = useMemo(() => {
    const eligibleApprovers = employees.filter(isApproverEligible);
    const unique = eligibleApprovers.filter(
      (emp: any, index: number, self: any[]) => index === self.findIndex((t: any) => String(t.id) === String(emp.id)),
    );
    return [
      { value: '', label: 'Không chỉ định' },
      ...unique.map((emp: any) => {
        const roleName = getApproverRoleBadge(emp);
        return {
          value: String(emp.id),
          label: `${emp.fullName || emp.username} (${roleName})`,
        };
      }),
    ];
  }, [employees]);

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
    () => [{ value: '', label: 'Thư mục gốc (Root)' }, ...flatCategoryList.map((cat) => ({ value: cat.id, label: cat.name }))],
    [flatCategoryList],
  );

  const titleVal = watch('title');
  const codeVal = watch('code');
  const documentTypeVal = watch('documentType');
  const categoryIdVal = watch('categoryId');
  const approverIdVal = watch('approverId');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Upload className="text-primary" size={20} />
          <span>Tải lên & Tạo tài liệu mới</span>
        </div>
      }
      className="m-2 max-w-2xl w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-xs">
        {/* Upload Dropzone */}
        <div>
          <label className="text-xs font-semibold text-gray-700 select-none block mb-1.5">
            Tệp đính kèm (PDF, DOCX, XLSX, Ảnh...) <span className="text-rose-500">*</span>
          </label>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 group ${
                fileError ? 'border-red-500 bg-red-50/10' : 'border-slate-300 hover:border-primary/60'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileUp size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-xs">Nhấp để tải tệp hoặc kéo thả vào đây</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ tài liệu Word, Excel, PDF, hình ảnh...</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">{getFileVisualInfo(file.name).icon}</div>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Chọn tệp khác"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {fileError && <span className="text-xs text-red-500 mt-1 block">{fileError}</span>}
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
            <Input
              label="Lưu vào Thư mục"
              fullWidth
              readOnly
              disabled
              value={currentFolder ? currentFolder.name : 'Thư mục gốc (Root)'}
              className="bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* Approver Selection */}
        <div>
          <Select
            label="Người phê duyệt văn bản (Tùy chọn)"
            fullWidth
            value={approverIdVal || ''}
            onChange={(e) => setValue('approverId', e.target.value)}
            options={approverOptions}
            placeholder="-- Chọn người phê duyệt nếu cần --"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end w-full mt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading} loading={loading}>
            Tải lên tài liệu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
