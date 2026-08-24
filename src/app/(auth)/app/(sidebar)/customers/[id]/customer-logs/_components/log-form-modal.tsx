'use client';

import { useEffect } from 'react';

// Thành phần dùng chung cho toàn trang
import { Input, Button, Modal, Select } from '@/components';

// Icons từ thư viện lucide react
import { CheckCircle2 } from 'lucide-react';

// Validation (Zod)
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Action
import { createCustomerLog, updateCustomerLog } from '@/actions'
  ;

// Config dữ liệu khách hàng
import { CUSTOMER_LOG_CHANNEL_OPTIONS, CUSTOMER_LOG_TYPE_OPTIONS, CUSTOMER_LOG_STATUS_OPTIONS } from '@/app/(auth)/app/(sidebar)/customers/config';

// Toast
import toast from 'react-hot-toast';

// Tanstack
import { useMutation } from '@tanstack/react-query';

// Utils
import queryClient from '@/utils/query';

// Types
import type { CustomerLogCreate, CustomerLog } from '@/types';

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  title: string;
  submitText?: string;
  initialData?: CustomerLog | null;
}

const logSchema = z.object({
  channel: z.string().min(1, { message: 'Vui lòng chọn kênh tương tác' }),
  type: z.string().min(1, { message: 'Vui lòng chọn loại tương tác' }),
  status: z.string().min(1, { message: 'Vui lòng chọn trạng thái' }),
  note: z.string().optional(),
  nextFollowDate: z.string().optional(),
});

type LogFormValues = z.infer<typeof logSchema>;

export function LogFormModal({ isOpen, onClose, customerId, title, submitText = 'Lưu tương tác', initialData }: LogFormModalProps) {
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

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ logId, data }: { logId: number; data: CustomerLogCreate }) => updateCustomerLog({ customerId, logId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-logs', customerId] });
      toast.success('Cập nhật lượt tương tác thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật lượt tương tác');
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          channel: initialData.channel || initialData.type || 'call',
          type: initialData.type || 'pending',
          status: initialData.status || 'completed',
          note: initialData.note || '',
          nextFollowDate: initialData.nextFollowDate ? new Date(initialData.nextFollowDate).toISOString().split('T')[0] : '',
        });
      } else {
        reset({
          channel: 'call',
          type: 'pending',
          status: 'completed',
          note: '',
          nextFollowDate: '',
        });
      }
    } else {
      reset({
        channel: 'call',
        type: 'pending',
        status: 'completed',
        note: '',
        nextFollowDate: '',
      });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (data: LogFormValues) => {
    const payload = {
      index: initialData?.index ?? 0,
      channel: data.channel,
      type: data.type,
      status: data.status,
      note: data.note || '',
      nextFollowDate: data.nextFollowDate || null,
    };

    if (initialData?.id) {
      updateMutation({ logId: initialData.id, data: payload });
    } else {
      mutate(payload);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
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
          
          {!!initialData && (
            <>
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
            </>
          )}
        </div>
        
        <div className="flex gap-4 justify-end w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending || updateIsPending}>
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
