'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input, Select } from '@/components';
import { Edit3 } from 'lucide-react';
import type { DocumentCategory, DocumentItem } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { invalidateDocumentQueries, showErrorToast } from '@/utils';
import {
  flattenCategoriesForSelect,
  DOC_TYPE_SELECT_OPTIONS,
  saveDocumentPersonalInfo,
} from './edit-document-helpers';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  categories: DocumentCategory[];
  onSuccess: () => void;
}

const editDocumentSchema = z.object({
  title: z.string().trim().min(1, { message: 'Tiêu đề tài liệu không được để trống' }),
  documentType: z.string().min(1, { message: 'Vui lòng chọn loại văn bản' }),
  code: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).optional(),
  summary: z.string().optional(),
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

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditDocumentFormValues>({
    resolver: zodResolver(editDocumentSchema),
  });

  useEffect(() => {
    if (!isOpen || !doc) return;
    reset({
      title: doc.title || '',
      documentType: doc.documentType || 'work_report',
      code: doc.code || '',
      categoryId: doc.categoryId || doc.category?.id || '',
      summary: doc.summary || '',
    });
  }, [isOpen, doc, reset]);

  const handleFormSubmit = async (data: EditDocumentFormValues) => {
    if (!doc) return;

    try {
      setLoading(true);
      await saveDocumentPersonalInfo({ doc, data });
      invalidateDocumentQueries(queryClient);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      showErrorToast(error, 'Không thể cập nhật tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const folderOptions = useMemo(
    () => [
      { value: '', label: 'Thư mục gốc (Drive của tôi)' },
      ...flattenCategoriesForSelect(categories).map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [categories],
  );

  if (!doc) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Edit3 className="text-primary" size={18} />
          <span className="font-semibold text-sm">Chỉnh sửa thông tin tài liệu</span>
        </div>
      }
      className="m-2 max-w-lg w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-3.5 text-xs">
        <Input
          label="Tiêu đề tài liệu *"
          fullWidth
          placeholder="Nhập tên tài liệu..."
          value={watch('title')}
          onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Phân loại văn bản *"
            fullWidth
            value={watch('documentType')}
            onChange={(e) => setValue('documentType', e.target.value, { shouldValidate: true })}
            options={DOC_TYPE_SELECT_OPTIONS}
            error={errors.documentType?.message}
          />
          <Input
            label="Mã văn bản (Tùy chọn)"
            fullWidth
            placeholder="Mã tài liệu..."
            value={watch('code')}
            onChange={(e) => setValue('code', e.target.value.toUpperCase())}
            error={errors.code?.message}
            className="font-mono uppercase"
          />
        </div>

        <Select
          label="Lưu vào Thư mục"
          fullWidth
          disabled
          value={watch('categoryId')}
          onChange={(e) => setValue('categoryId', e.target.value ? Number(e.target.value) : '')}
          options={folderOptions}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Trích yếu / Ghi chú (Tùy chọn)
          </label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-2xs"
            placeholder="Ghi chú ngắn mục đích hoặc nội dung của tài liệu..."
            value={watch('summary') || ''}
            onChange={(e) => setValue('summary', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80">
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
