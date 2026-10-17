'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Button, Input, Select } from '@/components';
import { createDocument } from '@/actions/document';
import { DOCUMENT_TYPE_MAP, RULE_DOC_TYPES, PERSONAL_DOC_TYPES } from '@/types';
import { formatBytes, getFileVisualInfo } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import toast from 'react-hot-toast';
import { Upload, FileUp, X, FileCheck } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: number | null;
  currentFolder?: DocumentCategory | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
  defaultGroup?: 'rules' | 'personal';
}

// Validation schema dùng Zod: Tạo ban đầu là bản nháp với các trường cơ bản
const documentSchema = z.object({
  title: z.string().min(1, { message: 'Tiêu đề không được để trống' }),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại văn bản' }),
  summary: z.string().optional(),
  code: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  currentFolderId = null,
  currentFolder = null,
  categories,
  onSuccess,
  defaultGroup = 'personal',
}) => {
  const queryClient = useQueryClient();
  const isRuleMode = defaultGroup === 'rules';
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
      documentType: isRuleMode ? 'regulation' : 'work_report',
      summary: '',
      code: '',
      categoryId: currentFolderId || '',
    },
  });

  // React Query Mutation để tạo mới tài liệu / quy chế dưới dạng BẢN NHÁP (draft)
  const createDocumentMutation = useMutation({
    mutationFn: async ({ data, file }: { data: DocumentFormValues; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const scope = isRuleMode ? 'all' : 'private';

      // Chuẩn hóa 100% camelCase theo đúng convention của dự án
      const documentData: Record<string, any> = {
        title: data.title.trim(),
        documentType: data.documentType,
        shareScope: scope,
        status: 'draft',
        approvalStatus: 'draft',
      };

      if (data.summary?.trim()) {
        documentData.summary = data.summary.trim();
      }
      if (data.code?.trim()) {
        documentData.code = data.code.trim().toUpperCase();
      }
      const targetCatId = currentFolderId ? Number(currentFolderId) : data.categoryId ? Number(data.categoryId) : undefined;
      if (targetCatId) {
        documentData.categoryId = targetCatId;
      }

      formData.append('document_data', JSON.stringify(documentData));
      formData.append('title', data.title.trim());
      formData.append('documentType', data.documentType);
      formData.append('shareScope', scope);
      formData.append('status', 'draft');
      formData.append('approvalStatus', 'draft');

      if (data.summary?.trim()) {
        formData.append('summary', data.summary.trim());
      }
      if (data.code?.trim()) {
        formData.append('code', data.code.trim().toUpperCase());
      }
      if (targetCatId) {
        formData.append('categoryId', String(targetCatId));
      }

      return createDocument(formData);
    },
    onSuccess: () => {
      toast.success(isRuleMode ? 'Tải lên quy chế thành công (Bản nháp)!' : 'Tải lên tài liệu thành công (Bản nháp)!');
      invalidateDocumentQueries(queryClient);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể tạo văn bản');
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
        documentType: defaultGroup === 'rules' ? 'regulation' : 'work_report',
        summary: '',
        code: '',
        categoryId: currentFolderId ? Number(currentFolderId) : '',
      });
    }
  }, [isOpen, currentFolderId, defaultGroup, reset]);

  // Options phân loại theo ngữ cảnh: Rules vs Personal Documents
  const docTypeOptions = useMemo(() => {
    const targetKeys = isRuleMode ? RULE_DOC_TYPES : PERSONAL_DOC_TYPES;
    return targetKeys
      .filter((key) => Boolean(DOCUMENT_TYPE_MAP[key]))
      .map((key) => ({
        value: key,
        label: DOCUMENT_TYPE_MAP[key].label,
      }));
  }, [isRuleMode]);

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
      setFileError('Vui lòng chọn tệp văn bản đính kèm');
      return;
    }
    createDocumentMutation.mutate({ data, file });
  };

  const titleVal = watch('title');
  const codeVal = watch('code');
  const documentTypeVal = watch('documentType');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          {isRuleMode ? <FileCheck className="text-primary" size={20} /> : <Upload className="text-primary" size={20} />}
          <span>{isRuleMode ? 'Tải lên quy chế / văn bản' : 'Tải lên & Tạo tài liệu mới'}</span>
        </div>
      }
      className="m-2 max-w-2xl w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-xs">
        {/* 1. Tệp đính kèm Dropzone */}
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

        {/* 2. Tiêu đề * & Mã văn bản (Tùy chọn) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label={isRuleMode ? 'Tiêu đề quy chế / văn bản *' : 'Tiêu đề tài liệu *'}
              fullWidth
              placeholder={isRuleMode ? 'Ví dụ: Quy chế công tác phí 2026...' : 'Ví dụ: Báo cáo công việc tuần 42...'}
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

        {/* 3. Trích yếu nội dung (Tùy chọn) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Trích yếu nội dung (Tùy chọn)
          </label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-2xs"
            placeholder="Tóm tắt ngắn gọn mục đích, nội dung chính của văn bản..."
            value={watch('summary') || ''}
            onChange={(e) => setValue('summary', e.target.value)}
          />
        </div>

        {/* 4. Phân loại văn bản * & Lưu vào Thư mục */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label={isRuleMode ? 'Phân loại văn bản quy chế / ban hành *' : 'Phân loại tài liệu *'}
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

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end w-full mt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading} loading={loading}>
            {isRuleMode ? 'Tải lên quy chế' : 'Tải lên tài liệu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
