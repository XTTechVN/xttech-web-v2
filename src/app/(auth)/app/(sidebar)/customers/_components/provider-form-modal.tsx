'use client';

import { useEffect } from 'react';
import { Input, Button, Modal } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createCustomerProvider, updateCustomerProvider } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { CustomerProvider } from '@/types';

export interface CustomerProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: CustomerProvider | null;
  onSuccessCallback?: (provider: CustomerProvider) => void;
}

const providerSchema = z.object({
  code: z.string().min(1, { message: 'Mã nhà cung cấp không được để trống' }),
  name: z.string().min(1, { message: 'Tên nhà cung cấp không được để trống' }),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

export default function CustomerProviderFormModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận tạo',
  initialData,
  onSuccessCallback,
}: CustomerProviderFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
  });

  const { mutate: createMutate, isPending: isCreatePending } = useMutation({
    mutationFn: createCustomerProvider,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-providers'] });
      toast.success('Thêm nhà cung cấp thành công');
      onClose();
      reset();
      onSuccessCallback?.(data);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          'Có lỗi xảy ra khi tạo nhà cung cấp'
      );
    },
  });

  const { mutate: updateMutate, isPending: isUpdatePending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProviderFormValues }) =>
      updateCustomerProvider(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-providers'] });
      toast.success('Cập nhật nhà cung cấp thành công');
      onClose();
      reset();
      onSuccessCallback?.(data);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          'Có lỗi xảy ra khi cập nhật nhà cung cấp'
      );
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        code: initialData?.code || '',
        name: initialData?.name || '',
      });
    } else {
      reset({ code: '', name: '' });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = (values: ProviderFormValues) => {
    if (initialData?.id) {
      updateMutate({ id: initialData.id, data: values });
    } else {
      createMutate(values);
    }
  };

  const isPending = isCreatePending || isUpdatePending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Mã nhà cung cấp *"
          placeholder="VD: NCC-01, HOAPHAT..."
          fullWidth
          {...register('code')}
          error={errors.code?.message}
          disabled={isPending}
        />
        <Input
          label="Tên nhà cung cấp *"
          placeholder="Nhập tên nhà cung cấp / đối tác"
          fullWidth
          {...register('name')}
          error={errors.name?.message}
          disabled={isPending}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isPending ? 'Đang xử lý...' : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
