'use client';

import { useEffect } from 'react';

// Thành phần dùng chung cho toàn trang
import { Input, Button, Modal, Select, Textarea } from '@/components';

// Icons từ thư viện lucide react
import { CheckCircle2 } from 'lucide-react';

// Validation (Zod)
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Action
import { createCustomerLog, updateCustomerLog } from '@/actions';

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


// Props của LogFormModal
interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
  title: string;
  submitText?: string;
  initialData?: CustomerLog | null;
}

// Validate dữ liệu cho thêm / sửa khách hàng
const logSchema = z.object({
  channel: z.string().min(1, { message: 'Vui lòng chọn kênh tương tác' }),
  type: z.string().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
  nextFollowDate: z.string().optional(),
});

type LogFormValues = z.infer<typeof logSchema>;

// Modal thêm / sửa thông tin khách hàng
export function LogFormModal({ isOpen, onClose, customerId, title, submitText = 'Lưu tương tác', initialData }: LogFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
  });

  // Mutation thêm lượt tương tác của khách hàng
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

  // Mutation cập nhật lượt tương tác của khách hàng
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

  // Effect xử lý khi mở / đóng modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          channel: initialData.channel || 'call',
          type: initialData.type || 'pending',
          status: initialData.status || 'pending',
          note: initialData.note || '',
          nextFollowDate: initialData.nextFollowDate ? new Date(initialData.nextFollowDate).toISOString().split('T')[0] : '',
        });
      } else {
        reset({
          channel: 'call',
          type: 'pending',
          status: 'pending',
          note: '',
          nextFollowDate: '',
        });
      }
    } else {
      reset({
        channel: 'call',
        type: 'pending',
        status: 'pending',
        note: '',
        nextFollowDate: '',
      });
    }
  }, [isOpen, initialData, reset]);

  // Xử lý thêm mới hoặc cập nhật lượt tương tác
  const onSubmit = (data: LogFormValues) => {
    const payload = {
      index: initialData?.index ?? 0,
      channel: data.channel,
      type: data.type || 'pending',
      status: data.status || 'pending',
      note: data.note ? data.note.trim() : '',
      nextFollowDate: data.nextFollowDate || null,
    };

    if (initialData?.id) {
      updateMutation({ logId: initialData.id, data: payload });
    } else {
      mutate(payload);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className={initialData ? 'm-2 max-w-lg w-full' : 'm-2 max-w-md w-full'}
      footer={
        <div className="flex gap-3 justify-end w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending || updateIsPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            form="log-form"
            type="submit"
            leftIcon={<CheckCircle2 size={16} />}
            disabled={isPending || updateIsPending}
            loading={isPending || updateIsPending}
          >
            {submitText}
          </Button>
        </div>
      }
    >
      <form id="log-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1">
        {/* Kênh tương tác luôn hiển thị */}
        <div className="flex flex-col gap-1.5">
          <Select
            label="Kênh tương tác *"
            options={CUSTOMER_LOG_CHANNEL_OPTIONS}
            placeholder="Chọn kênh tương tác"
            fullWidth
            value={watch('channel') || ''}
            {...register('channel')}
            error={errors.channel?.message}
          />
        </div>

        {/* Các trường bổ sung chỉ hiển thị khi Chỉnh sửa */}
        {!!initialData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Select
                  label="Loại tương tác (Đánh giá) *"
                  options={CUSTOMER_LOG_TYPE_OPTIONS}
                  placeholder="Chọn đánh giá mức độ tiềm năng"
                  fullWidth
                  value={watch('type') || ''}
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
                  value={watch('status') || ''}
                  {...register('status')}
                  error={errors.status?.message}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Input
                label="Ngày chăm sóc tiếp theo"
                type="date"
                fullWidth
                {...register('nextFollowDate')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Textarea
                label="Ghi chú nội dung *"
                placeholder="Nhập nội dung tương tác, nhu cầu khách hàng..."
                rows={3}
                fullWidth
                {...register('note')}
                error={errors.note?.message}
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
