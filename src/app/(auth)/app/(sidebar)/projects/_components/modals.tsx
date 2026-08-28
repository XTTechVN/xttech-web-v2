'use client';

import { useEffect } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createProject, updateProject } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Project, ProjectCreate, ProjectUpdate, Customer } from '@/types';

// Form modal để Thêm / Sửa thông tin dự án
interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Pick<Project, 'id' | 'name' | 'address' | 'note'> & { customerId: number };
  customers?: Pick<Customer, 'id' | 'name'>[];
}

type ProjectFormValues = Omit<ProjectCreate, 'customerId'> & { customerId?: string | number };

export function ProjectFormModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận tạo',
  initialData,
  customers = [],
}: ProjectFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>();

  const { mutate, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Thêm dự án thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateProject>[1] }) =>
      updateProject(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      toast.success('Cập nhật dự án thành công');
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
        customerId: initialData?.customerId || undefined,
        address: initialData?.address || '',
        note: initialData?.note || '',
      });
    } else {
      reset({ name: '', customerId: undefined, address: '', note: '' });
    }
  }, [isOpen, initialData, reset]);

  const handleConfirm = (data: ProjectFormValues) => {
    const formattedData = {
      ...data,
      customerId: Number(data.customerId),
    } as ProjectCreate;

    if (initialData) {
      updateMutation({ id: initialData.id, data: formattedData as ProjectUpdate });
    } else {
      mutate(formattedData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <Input
            label="Tên dự án *"
            placeholder="Nhập tên dự án"
            fullWidth
            {...register('name', { required: true })}
            error={errors.name ? 'Tên dự án không được để trống' : undefined}
          />
          <Select
            label="Khách hàng *"
            placeholder="Chọn khách hàng"
            fullWidth
            value={watch('customerId') || ''}
            {...register('customerId', { required: true })}
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.customerId ? 'Vui lòng chọn khách hàng' : undefined}
          />
          <Input
            label="Địa chỉ"
            placeholder="Nhập địa chỉ công trình"
            fullWidth
            {...register('address')}
            error={errors.address ? 'Địa chỉ không hợp lệ' : undefined}
          />
          <Input
            label="Ghi chú"
            placeholder="Nhập ghi chú"
            fullWidth
            {...register('note')}
            error={errors.note ? 'Ghi chú không hợp lệ' : undefined}
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

// Modal xác nhận xoá dự án
interface ProjectDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ProjectDeleteModal({
  isOpen,
  onClose,
  projectName,
  onConfirm,
  isPending = false,
}: ProjectDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa dự án"
      className="m-2 max-w-md w-full"
    >
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa dự án <strong className="text-gray-900 font-semibold">{projectName}</strong>?
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end w-full mt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isPending}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
