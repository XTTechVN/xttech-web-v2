'use client';

import { useEffect } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createCustomerLog } from '@/actions';
import { CUSTOMER_LOG_CHANNEL_OPTIONS, CUSTOMER_LOG_TYPE_OPTIONS, CUSTOMER_LOG_STATUS_OPTIONS } from '../../../config';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { CustomerLogCreate } from '@/types';

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
}

const logSchema = z.object({
  channel: z.string().min(1, { message: 'Vui lòng chọn kênh tương tác' }),
  type: z.string().min(1, { message: 'Vui lòng chọn loại tương tác' }),
  status: z.string().min(1, { message: 'Vui lòng chọn trạng thái' }),
  note: z.string().optional(),
  nextFollowDate: z.string().optional(),
});

type LogFormValues = z.infer<typeof logSchema>;

export function LogFormModal({ isOpen, onClose, customerId }: LogFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CustomerLogCreate) => createCustomerLog({ customerId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-logs', customerId] });
      toast.success('Thêm lượt tương tác thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi thêm lượt tương tác');
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        channel: 'call',
        type: 'pending', // Mặc định tạm thời theo ví dụ
        status: 'completed', // Mặc định tạm thời
        note: '',
        nextFollowDate: '',
      });
    } else {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: LogFormValues) => {
    mutate({
      index: 0, // Backend yêu cầu index
      channel: data.channel,
      type: data.type,
      status: data.status,
      note: data.note || '',
      nextFollowDate: data.nextFollowDate || null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo mới lượt tương tác" className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Select
              label="Kênh tương tác *"
              options={CUSTOMER_LOG_CHANNEL_OPTIONS}
              placeholder="Chọn kênh tương tác"
              fullWidth
              {...register('channel')}
              error={errors.channel?.message}
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <Select
              label="Loại tương tác (Đánh giá) *"
              options={CUSTOMER_LOG_TYPE_OPTIONS}
              placeholder="Chọn đánh giá mức độ tiềm năng"
              fullWidth
              {...register('type')}
              error={errors.type?.message}
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <Select
              label="Trạng thái *"
              options={CUSTOMER_LOG_STATUS_OPTIONS}
              placeholder="Chọn trạng thái kết quả"
              fullWidth
              {...register('status')}
              error={errors.status?.message}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              label="Ghi chú"
              placeholder="Nhập nội dung tương tác"
              fullWidth
              {...register('note')}
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <Input
              label="Ngày follow-up tiếp theo"
              type="date"
              fullWidth
              {...register('nextFollowDate')}
            />
          </div>
        </div>
        
        <div className="flex gap-4 justify-end w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            type="submit"
            disabled={isPending}
            loading={isPending}
          >
            Lưu tương tác
          </Button>
        </div>
      </form>
    </Modal>
  );
}
