'use client';

import React, { useEffect } from 'react';
import { Modal, Button, Textarea } from '@/components';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { cn } from '@/utils';

// Schema validate lý do từ chối bằng Zod
const rejectDocumentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, { message: 'Vui lòng nhập lý do từ chối phê duyệt tài liệu' })
    .max(500, { message: 'Lý do từ chối không được vượt quá 500 ký tự' }),
});

type RejectDocumentFormValues = z.infer<typeof rejectDocumentSchema>;

interface RejectDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle?: string;
  onConfirm: (reason: string) => Promise<void> | void;
  loading?: boolean;
}

export const RejectDocumentModal: React.FC<RejectDocumentModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  onConfirm,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectDocumentFormValues>({
    resolver: zodResolver(rejectDocumentSchema),
    defaultValues: {
      reason: '',
    },
  });

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      reset({ reason: '' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: RejectDocumentFormValues) => {
    await onConfirm(values.reason);
  };

  const handleClose = () => {
    if (loading) return;
    reset({ reason: '' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Từ chối phê duyệt tài liệu"
      className="m-2 max-w-md w-full"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {documentTitle && (
          <p className="text-gray-600 text-xs leading-relaxed">
            Bạn đang từ chối phê duyệt tài liệu:{' '}
            <strong className="text-gray-900 font-semibold">{documentTitle}</strong>
          </p>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 block">
            Lý do từ chối <span className="text-rose-500">*</span>
          </label>
          <Textarea
            {...register('reason')}
            placeholder="Ghi chú lý do từ chối để người soạn thảo nắm rõ..."
            rows={3}
            fullWidth
            disabled={loading}
            className={cn(
              'text-xs bg-white focus:bg-white',
              errors.reason && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
            )}
          />
          {errors.reason && (
            <p className="text-[11px] text-rose-500 font-medium animate-in fade-in">
              {errors.reason.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end w-full pt-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="danger"
            size="sm"
            type="submit"
            loading={loading}
            disabled={loading}
            className="bg-[#ff245a] hover:bg-[#e61a4d] text-white font-semibold"
          >
            Xác nhận từ chối
          </Button>
        </div>
      </form>
    </Modal>
  );
};
