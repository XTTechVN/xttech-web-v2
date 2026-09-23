'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createAccessoryCategory, updateAccessoryCategory } from '@/actions';
import type { AccessoryCategory, AccessoryCategoryCreate } from '@/types';

interface AccessoryCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: AccessoryCategory | null;
}

export function AccessoryCategoryFormModal({
  isOpen,
  onClose,
  category,
}: AccessoryCategoryFormModalProps) {
  const isEdit = Boolean(category);

  const { register, handleSubmit, reset } = useForm<AccessoryCategoryCreate>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        code: category.code,
        name: category.name,
        description: category.description || '',
        isActive: category.isActive ?? true,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [category, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AccessoryCategoryCreate) => {
      if (isEdit && category) {
        return await updateAccessoryCategory(category.id, {
          code: data.code,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        });
      }
      return await createAccessoryCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success(isEdit ? 'Cập nhật nhóm phụ kiện thành công' : 'Thêm nhóm phụ kiện mới thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa nhóm phụ kiện' : 'Thêm nhóm phụ kiện mới'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <Input
          label="Mã nhóm phụ kiện *"
          placeholder="VD: BAN_LE, KHOA_TAY_NAM, BANH_XE"
          {...register('code', { required: true })}
        />
        <Input
          label="Tên nhóm phụ kiện *"
          placeholder="VD: Bản lề cửa, Khóa & Tay nắm, Bánh xe"
          {...register('name', { required: true })}
        />
        <Input
          label="Mô tả / Ứng dụng"
          placeholder="VD: Phụ kiện kim khí dành cho cửa đi, cửa sổ mở quay, mở trượt..."
          {...register('description')}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
