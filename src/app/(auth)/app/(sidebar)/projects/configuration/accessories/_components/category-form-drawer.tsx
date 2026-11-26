'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components';
import { Button, DrawerBody, DrawerFooter, DrawerHeader, SideDrawer } from '@/components-remake';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createAccessoryCategory, updateAccessoryCategory } from '@/actions';
import type { AccessoryCategory, AccessoryCategoryCreate, AccessoryCategoryUpdate } from '@/types';

const CATEGORY_FORM_ID = 'accessory-category-form';

interface CategoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category?: AccessoryCategory | null;
}

export function CategoryFormDrawer({ isOpen, onClose, category }: CategoryFormDrawerProps) {
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

  const title = isEdit ? 'Sửa danh mục phụ kiện' : 'Thêm danh mục phụ kiện';

  return (
    <SideDrawer isOpen={isOpen} onClose={onClose} label={title}>
      <DrawerHeader compact title={title} onClose={onClose} />
      <DrawerBody>
        <form id={CATEGORY_FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4 py-4 md:w-96">
          <Input label="Mã danh mục" placeholder="VD: BAN_LE" required {...register('code', { required: 'Mã danh mục là bắt buộc' })} error={errors.code?.message} />
          <Input label="Tên danh mục" placeholder="VD: Bản lề" required {...register('name', { required: 'Tên danh mục là bắt buộc' })} error={errors.name?.message} />
          <Input type="number" label="Thứ tự hiển thị" placeholder="0" {...register('sortOrder')} />
          <div className="flex flex-col gap-1">
            <label htmlFor="accessory-category-description" className="text-xs font-medium text-slate-500">
              Mô tả / ghi chú
            </label>
            <textarea
              id="accessory-category-description"
              rows={3}
              {...register('description')}
              className="w-full resize-none rounded-control border border-slate-200 bg-white p-3 text-base text-slate-900 outline-none focus:border-primary md:text-sm"
            />
          </div>
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register('isActive')} className="size-4 rounded border-slate-300 accent-primary" />
            <span className="font-medium">Kích hoạt danh mục này</span>
          </label>
        </form>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={CATEGORY_FORM_ID} className="flex-1 md:flex-none" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </Button>
        </div>
      </DrawerFooter>
    </SideDrawer>
  );
}
