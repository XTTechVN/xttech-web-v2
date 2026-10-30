'use client';

import React, { useEffect, useMemo } from 'react';
import { Modal, Button, Input, Textarea } from '@/components';
import { FolderPlus, Edit2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createDocumentCategory, updateDocumentCategory } from '@/actions/document';
import { showErrorToast, invalidateDocumentQueries } from '@/utils';
import type { DocumentCategory } from '@/types';

export interface FolderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  submitText?: string;
  initialData?: DocumentCategory | null;
  parentId?: number | null;
  parentFolder?: DocumentCategory | null;
  existingFolders?: DocumentCategory[];
  onSuccess?: () => void;
}

const folderSchema = z.object({
  name: z.string().min(1, { message: 'Tên thư mục không được để trống' }),
  code: z.string().optional(),
  description: z.string().optional(),
});

type FolderFormValues = z.infer<typeof folderSchema>;

export function FolderFormModal({
  isOpen,
  onClose,
  title,
  submitText,
  initialData,
  parentId = null,
  parentFolder,
  existingFolders,
  onSuccess,
}: FolderFormModalProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(initialData);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: { name: '', code: '', description: '' },
  });

  const { mutate: createMutate, isPending: createIsPending } = useMutation({
    mutationFn: (payload: { name: string; code?: string; description?: string; parentId?: number | null }) =>
      createDocumentCategory({
        name: payload.name.trim(),
        code: payload.code?.trim() ? payload.code.trim().toUpperCase() : undefined,
        description: payload.description?.trim() || undefined,
        parentId: payload.parentId || null,
      }),
    onSuccess: () => {
      invalidateDocumentQueries(queryClient);
      toast.success('Đã tạo thư mục thành công!');
      onSuccess?.();
      onClose();
      reset();
    },
    onError: (error: unknown) => showErrorToast(error, 'Thêm thư mục thất bại'),
  });

  const { mutate: updateMutate, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description?: string } }) =>
      updateDocumentCategory(id, {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      }),
    onSuccess: () => {
      invalidateDocumentQueries(queryClient);
      toast.success('Cập nhật thư mục thành công!');
      onSuccess?.();
      onClose();
      reset();
    },
    onError: (error: unknown) => showErrorToast(error, 'Cập nhật thư mục thất bại'),
  });

  const isSubmitting = createIsPending || updateIsPending;

  useEffect(() => {
    if (!isOpen) {
      reset({ name: '', code: '', description: '' });
      return;
    }
    if (initialData) {
      reset({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
      });
    } else {
      reset({ name: 'New folder', code: '', description: '' });
    }
  }, [isOpen, initialData, reset]);

  const nameVal = watch('name');
  const codeVal = watch('code');
  const descVal = watch('description');

  const siblingFolders = useMemo(() => {
    if (existingFolders !== undefined) return existingFolders;
    if (parentFolder?.children && parentFolder.children.length > 0) return parentFolder.children;
    return [];
  }, [existingFolders, parentFolder]);

  const isDuplicateLive = useMemo(() => {
    const trimmed = nameVal?.trim().toLowerCase();
    if (!trimmed) return false;
    return siblingFolders.some((f) => {
      if (initialData?.id && f.id === initialData.id) return false;
      return f.name.trim().toLowerCase() === trimmed;
    });
  }, [nameVal, siblingFolders, initialData]);

  const executeSubmit = (data: FolderFormValues) => {
    if (initialData?.id) {
      updateMutate({ id: initialData.id, data: { name: data.name, description: data.description } });
    } else {
      createMutate({ name: data.name, code: data.code, description: data.description, parentId });
    }
  };

  const modalTitle = title || (
    <div className="flex items-center gap-2 text-slate-800">
      {isEdit ? <Edit2 className="text-primary" size={18} /> : <FolderPlus className="text-primary" size={20} />}
      <span>{isEdit ? 'Chỉnh sửa thư mục' : 'Tạo thư mục mới'}</span>
    </div>
  );

  const defaultSubmitText = submitText || (isEdit ? 'Lưu thay đổi' : 'Tạo thư mục');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      className="m-2 max-w-md w-full"
    >
      <form onSubmit={handleSubmit(executeSubmit)} className="flex flex-col gap-4 text-xs">
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Input
              label="Tên thư mục *"
              placeholder="Nhập tên thư mục..."
              fullWidth
              value={nameVal}
              onChange={(e) => setValue('name', e.target.value, { shouldValidate: true })}
              error={errors.name?.message}
              autoFocus
            />
            {isDuplicateLive && (
              <p className="text-[12px] text-amber-600 flex items-center gap-1.5 font-medium mt-1">
                <AlertTriangle size={14} className="shrink-0 text-amber-500" />
                <span>Tên thư mục này đã tồn tại trong thư mục hiện tại</span>
              </p>
            )}
          </div>

          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <Input
                label="Mã thư mục (Code)"
                placeholder="Nhập mã folder (tùy chọn)..."
                fullWidth
                value={codeVal}
                onChange={(e) => setValue('code', e.target.value.toUpperCase(), { shouldValidate: true })}
                error={errors.code?.message}
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Mã định danh viết hoa, không dấu (để trống nếu muốn hệ thống tự động sinh).
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Textarea
              label="Mô tả mục đích (Tùy chọn)"
              fullWidth
              rows={3}
              placeholder="Mô tả nội dung tài liệu lưu trong thư mục này..."
              value={descVal}
              onChange={(e) => setValue('description', e.target.value)}
              error={errors.description?.message}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end w-full mt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            leftIcon={<CheckCircle2 size={16} />}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {defaultSubmitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FolderFormModal;
