'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

// Thành phần dùng chung cho toàn trang
import { Input, Button, Modal } from '@/components';

// Icons từ thư viện lucide-react
import { CheckCircle2 } from 'lucide-react';

// thư viện validate form
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';

// Gọi API từ action
import { createPosition, updatePosition } from '@/actions';

// notification
import toast from 'react-hot-toast';

// query
import { useMutation } from '@tanstack/react-query';

// utils
import queryClient from '@/utils/query';

// Kiểu dữ liệu của vị trí
import { Position } from '@/types';

// Kiểu dữ liệu cho modal
interface PositionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: {
    id: number;
    name: string;
  };
}

// Validation cho thêm / sửa vị trí
const positionSchema = z.object({
  name: z.string().min(1, { message: 'Tên vị trí không được để trống' }),
});
type PositionFormValues = z.infer<typeof positionSchema>;

// Modal tạo / sửa vị trí
export default function PositionFormModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận tạo',
  initialData,
}: PositionFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
  });

  // Hàm thêm vị trí
  const { mutate, isPending } = useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Thêm vị trí thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi thêm vị trí');
    },
  });

  // Hàm sửa vị trí
  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Position, 'id' | 'createdAt'>> }) =>
      updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Cập nhật vị trí thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi cập nhật vị trí');
    },
  });

  // reset form khi open
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
      });
    } else {
      reset({
        name: '',
      });
    }
  }, [isOpen, initialData, reset]);

  const params = useParams();
  const departmentId = Number(params.id);

  // Xử lý thêm mới hoặc cập nhật chức vụ khi người dùng xác nhận
  const handleConfirm = (data: PositionFormValues) => {
    const payload = {
      name: data.name,
      departmentId: departmentId,
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
          {/* Tên vị trí */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="Tên vị trí *"
              placeholder="Nhập tên vị trí"
              fullWidth
              {...register('name')}
              error={errors.name?.message || undefined}
            />
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
export { PositionFormModal };
