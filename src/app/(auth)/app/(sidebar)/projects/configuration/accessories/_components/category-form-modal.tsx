'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createAccessoryCategory, updateAccessoryCategory } from '@/actions';
import type { AccessoryCategory, AccessoryCategoryCreate, AccessoryCategoryUpdate } from '@/types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: AccessoryCategory | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccessoryCategoryCreate>({
    defaultValues: {
      code: '',
      name: '',
      sortOrder: 0,
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (category) {
      reset({
        code: category.code,
        name: category.name,
        sortOrder: category.sortOrder ?? 0,
        description: category.description || '',
        isActive: category.isActive ?? true,
      });
    } else {
      reset({
        code: '',
        name: '',
        sortOrder: 0,
        description: '',
        isActive: true,
      });
    }
  }, [isOpen, category, reset]);

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (data: AccessoryCategoryCreate) => createAccessoryCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Thêm danh mục phụ kiện thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi thêm danh mục phụ kiện'),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: AccessoryCategoryUpdate) => updateAccessoryCategory(category!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Cập nhật danh mục phụ kiện thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật danh mục phụ kiện'),
  });

  const onSubmit = (data: AccessoryCategoryCreate) => {
    const payload = {
      ...data,
      sortOrder: Number(data.sortOrder) || 0,
    };

    if (isEdit) {
      updateMutate(payload);
    } else {
      createMutate(payload);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? 'Chỉnh sửa danh mục phụ kiện' : 'Thêm danh mục phụ kiện mới'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Mã danh mục"
            placeholder="VD: BAN_LE, TAY_NAM..."
            required
            {...register('code', { required: 'Mã danh mục là bắt buộc' })}
          />

          <Input
            label="Tên danh mục"
            placeholder="VD: Bản lề, Tay nắm cửa..."
            required
            {...register('name', { required: 'Tên danh mục là bắt buộc' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            type="number"
            label="Thứ tự hiển thị"
            placeholder="0"
            {...register('sortOrder')}
          />

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
              />
              <span className="font-semibold">Kích hoạt hoạt động</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            Mô tả / Ghi chú
          </label>
          <textarea
            rows={3}
            placeholder="Thông tin chi tiết về danh mục phụ kiện này..."
            {...register('description')}
            className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isPending} className="px-5 font-semibold">
            {isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
