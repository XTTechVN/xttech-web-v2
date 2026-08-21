'use client';

import { useEffect } from 'react';
import { Input, Button, Modal } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createCustomer, updateCustomer } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Customer, CustomerCreate, CustomerUpdate } from '@/types';

// Form modal để Thêm / Sửa thông tin khách hàng
interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: {
    id: number;
    name: string;
    address?: string | null;
    identifyCode?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

type CustomerFormValues = CustomerCreate;

export function CustomerFormModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận tạo',
  initialData,
}: CustomerFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>();

  const { mutate, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Thêm khách hàng thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerUpdate }) =>
      updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cập nhật khách hàng thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
        address: initialData?.address || '',
        identifyCode: initialData?.identifyCode || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
      });
    } else {
      reset({ name: '', address: '', identifyCode: '', email: '', phone: '' });
    }
  }, [isOpen, initialData]);

  const handleConfirm = (data: CustomerFormValues) => {
    const payload: any = {
      name: data.name,
      phone: data.phone,
    };
    if (data.identifyCode && data.identifyCode.trim() !== '') {
      payload.identifyCode = data.identifyCode;
    }
    if (data.email && data.email.trim() !== '') {
      payload.email = data.email;
    }
    if (data.address && data.address.trim() !== '') {
      payload.address = data.address;
    }

    if (initialData) {
      updateMutation({ id: initialData.id, data: payload as CustomerUpdate });
    } else {
      mutate(payload as CustomerCreate);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <Input
            label="Tên khách hàng *"
            placeholder="Nhập tên khách hàng"
            fullWidth
            {...register('name', { required: true })}
            error={errors.name ? 'Tên khách hàng không được để trống' : undefined}
          />
          <Input
            label="Mã định danh"
            placeholder="Nhập mã định danh (MST/CCCD)"
            fullWidth
            {...register('identifyCode', {
              pattern: {
                value: /^(?:\d{10}|\d{12}|\d{13})$/,
                message: 'Mã định danh phải là MST (10 hoặc 13 số) hoặc CCCD (12 số)',
              },
            })}
            error={errors.identifyCode?.message}
          />
          <Input
            label="Số điện thoại *"
            placeholder="Nhập số điện thoại"
            fullWidth
            {...register('phone', {
              required: 'Số điện thoại không được để trống',
              pattern: {
                value: /^(0[3|5|7|8|9])[0-9]{8}$/,
                message: 'Số điện thoại không đúng định dạng Việt Nam',
              },
            })}
            error={errors.phone?.message}
          />
          <Input
            label="Email"
            placeholder="Nhập địa chỉ email"
            type="email"
            fullWidth
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email không đúng định dạng',
              },
            })}
            error={errors.email?.message}
          />
          <Input
            label="Địa chỉ"
            placeholder="Nhập địa chỉ"
            fullWidth
            {...register('address')}
            error={errors.address ? 'Địa chỉ không hợp lệ' : undefined}
          />
        </div>
        <div className="flex gap-2 justify-end w-full mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
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

// Modal xác nhận Xóa khách hàng
interface CustomerDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function CustomerDeleteModal({
  isOpen,
  onClose,
  customerName,
  onConfirm,
  isPending = false,
}: CustomerDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa khách hàng"
      className="m-2 max-w-md w-full"
    >
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa khách hàng <strong className="text-gray-900 font-semibold">{customerName}</strong>?
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end w-full mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          loading={isPending}
        >
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
