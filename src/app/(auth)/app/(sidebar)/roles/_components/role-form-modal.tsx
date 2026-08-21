'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Textarea } from '@/components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole, updateRole } from '@/actions/role';
import type { Role } from '@/types';
import toast from 'react-hot-toast';

const roleSchema = z.object({
  name: z.string().min(1, { message: 'Tên vai trò không được để trống' }),
  code: z.string().min(1, { message: 'Mã vai trò không được để trống' }),
  description: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Role | null;
}

export default function RoleFormModal({ isOpen, onClose, initialData }: RoleFormModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(initialData);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
      });
    }
  }, [initialData, isOpen, reset]);

  const { mutate: handleSaveRole, isPending } = useMutation({
    mutationFn: async (data: RoleFormData) => {
      if (isEditMode && initialData?.id) {
        return await updateRole(initialData.id, {
          name: data.name,
          code: data.code,
          description: data.description || null,
        });
      } else {
        return await createRole({
          name: data.name,
          code: data.code,
          description: data.description || null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(isEditMode ? 'Cập nhật vai trò thành công' : 'Tạo vai trò mới thành công');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi lưu thông tin vai trò');
    },
  });

  const onSubmit = (data: RoleFormData) => {
    handleSaveRole(data);
  };

  const handleAttemptClose = () => {
    if (isPending) return;
    if (isDirty) {
      setIsCloseConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setIsCloseConfirmOpen(false);
    reset();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleAttemptClose}
        title={isEditMode ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}
        className="m-2 max-w-md w-full"
        disabled={isPending}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={handleAttemptClose} disabled={isPending}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isPending}
            >
              {isEditMode ? 'Lưu thay đổi' : 'Tạo vai trò'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Input
            label="Tên vai trò *"
            placeholder="Ví dụ: Quản trị viên, Nhân sự, Kế toán..."
            {...register('name')}
            error={errors.name?.message}
            disabled={isPending}
            fullWidth
          />

          <Input
            label="Mã vai trò *"
            placeholder="Ví dụ: admin, hr, accountant..."
            {...register('code')}
            error={errors.code?.message}
            disabled={isPending}
            fullWidth
          />

          <Textarea
            label="Mô tả vai trò"
            placeholder="Nhập mô tả về vai trò hạn và vai trò này..."
            {...register('description')}
            error={errors.description?.message}
            disabled={isPending}
            rows={3}
            fullWidth
          />
        </form>
      </Modal>

      {/* Modal xác nhận đóng form khi có thay đổi chưa lưu */}
      <Modal
        isOpen={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)}
        title="Xác nhận đóng form"
        className="m-2 max-w-md w-full"
      >
        <div className="py-2">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng form và hủy các nội dung đang nhập không?
          </p>
        </div>
        <div className="flex gap-3 justify-end w-full mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCloseConfirmOpen(false)}
          >
            Tiếp tục chỉnh sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmClose}
          >
            Xác nhận đóng
          </Button>
        </div>
      </Modal>
    </>
  );
}
