'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea } from '@/components';
import { createDocumentCategory } from '@/actions/document';
import { generateSlugCode } from '../_utils/doc-helpers';
import toast from 'react-hot-toast';
import { FolderPlus } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: number | null;
  parentFolder?: DocumentCategory | null;
  onSuccess: () => void;
}

// Validation schema dùng Zod theo chuẩn form-modal
const folderSchema = z.object({
  name: z.string().min(1, { message: 'Tên thư mục không được để trống' }),
  code: z.string().optional(),
  description: z.string().optional(),
});

type FolderFormValues = z.infer<typeof folderSchema>;

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  parentId = null,
  parentFolder = null,
  onSuccess,
}) => {
  const [isManualCode, setIsManualCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: 'New folder',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    register('name');
    register('code');
    register('description');
  }, [register]);

  useEffect(() => {
    if (isOpen) {
      reset({
        name: 'New folder',
        code: '',
        description: '',
      });
      setIsManualCode(false);
    }
  }, [isOpen, reset]);

  const nameVal = watch('name');
  const codeVal = watch('code');
  const descVal = watch('description');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val, { shouldValidate: true });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('code', e.target.value.toUpperCase(), { shouldValidate: true });
    setIsManualCode(true);
  };

  const handleFormSubmit = async (data: FolderFormValues) => {
    const finalCode = (data.code?.trim() || generateSlugCode(data.name || 'New folder', 'DIR')).toUpperCase();

    try {
      setLoading(true);
      await createDocumentCategory({
        name: data.name.trim(),
        code: finalCode,
        description: data.description?.trim() || undefined,
        parentId: parentId || null,
      });
      toast.success('Đã tạo thư mục thành công!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo thư mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <FolderPlus className="text-primary" size={20} />
          <span>Tạo thư mục mới</span>
        </div>
      }
      className="m-2 max-w-md w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-xs">

        <div>
          <Input
            label="Tên thư mục *"
            placeholder="Ví dụ: New folder..."
            fullWidth
            value={nameVal}
            onChange={handleNameChange}
            error={errors.name?.message}
            autoFocus
          />
        </div>

        <div>
          <Input
            label="Mã thư mục (Code)"
            placeholder="Nhập mã folder..."
            fullWidth
            value={codeVal}
            onChange={handleCodeChange}
            error={errors.code?.message}
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Mã định danh viết hoa, không dấu, ngăn cách bằng dấu gạch dưới (tự động tạo nếu để trống).
          </p>
        </div>

        <Textarea
          label="Mô tả mục đích (Tùy chọn)"
          fullWidth
          rows={3}
          placeholder="Mô tả nội dung tài liệu lưu trong thư mục này..."
          value={descVal}
          onChange={(e) => setValue('description', e.target.value)}
          error={errors.description?.message}
        />

        <div className="flex gap-3 justify-end w-full mt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={loading} loading={loading}>
            Tạo thư mục
          </Button>
        </div>
      </form>
    </Modal>
  );
};

