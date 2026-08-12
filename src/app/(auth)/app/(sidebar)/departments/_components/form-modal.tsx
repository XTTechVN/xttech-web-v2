'use client';

import { useEffect } from 'react';

// Thành phần dùng chung cho toàn trang
import { Input, Button, Modal } from '@/components';

// Icons từ thư viện lucide-react
import { CheckCircle2 } from 'lucide-react';

// thư viện validate form
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Gọi API từ action
import { createDepartment, updateDepartment } from '@/actions/department';

// notification
import toast from 'react-hot-toast';

// query
import { useMutation } from '@tanstack/react-query';

// utils
import queryClient from '@/utils/query';

// Kiểu dữ liệu của phòng ban
import { Department } from '@/types';

// Kiểu dữ liệu cho modal
interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: {
    id: number;
    name: string;
    code: string;
  };
}

// Validation cho thêm / sửa  phòng ban
const departmentSchema = z.object({
  name: z.string().min(1, { message: 'Tên phòng ban không được để trống' }),
  code: z.string().min(1, { message: 'Mã phòng ban không được để trống' }),
});
type DepartmentFormValues = z.infer<typeof departmentSchema>;

// Modal tạo / sửa phòng ban
export default function DepartmentFormModal({ isOpen, onClose, title, submitText = 'Xác nhận tạo', initialData }: DepartmentFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
  });

  // Hàm tạo department bằng mutation
  const { mutate, isPending } = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Thêm phòng ban thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Hàm cập nhật department bằng mutation
  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Department, 'id' | 'createdAt' | 'mainColor' | 'mainIcon'> }) => updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Cập nhật phòng ban thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // reset form khi open
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
        code: initialData?.code || '',
      });
    } else {
      reset({
        name: '',
        code: '',
      });
    }
  }, [isOpen, initialData]);

  const handleConfirm = (data: DepartmentFormValues) => {
    const payload = {
      name: data.name,
      code: data.code,
    };
    if (initialData) {
      updateMutation({ id: Number(initialData?.id), data: payload });
    } else {
      mutate(payload);
    }
  };
  const handleOnClose = () => {
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 py-2">
          {/* Tên Phòng Ban */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="Tên phòng ban *"
              placeholder="Nhập tên phòng ban"
              fullWidth
              {...register('name')}
              error={errors.name?.message || undefined}
            />
          </div>

          {/* Mã Phòng Ban */}
          <div className="flex flex-col gap-1.5">
            <Input label="Mã phòng ban *" placeholder="Nhập mã phòng ban" fullWidth {...register('code')} error={errors.code?.message || undefined} />
          </div>
        </div>

        {/* Button Thêm / Sửa */}
        <div className="flex gap-4 justify-end w-full">
          <Button variant="outline" size="sm" onClick={handleOnClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            type="submit"
            disabled={isPending || updateIsPending}
            loading={isPending || updateIsPending}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
