'use client';

import { useEffect } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createQuotation, updateQuotation } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Quotation, QuotationCreate, QuotationUpdate, Project } from '@/types';

// ==========================================
// 1. FORM MODAL ĐỂ TẠO BÁO GIÁ (QuotationCreate)
// ==========================================
interface QuotationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  projects?: Pick<Project, 'id' | 'name'>[];
  defaultProjectId?: number;
}

type QuotationCreateFormValues = Omit<QuotationCreate, 'projectId' | 'discountPercentage'> & {
  projectId?: string | number;
  discountPercentage?: string | number;
};

export function QuotationCreateModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận tạo',
  projects = [],
  defaultProjectId,
}: QuotationCreateModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuotationCreateFormValues>();

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      if (defaultProjectId) {
        queryClient.invalidateQueries({ queryKey: ['project_quotations', defaultProjectId] });
      }
      toast.success('Thêm báo giá thành công');
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
        title: '', 
        code: '', 
        discountPercentage: 0, 
        projectId: defaultProjectId || '' 
      });
    }
  }, [isOpen, defaultProjectId, reset]);

  const handleConfirm = (data: QuotationCreateFormValues) => {
    const formattedData: QuotationCreate = {
      title: data.title,
      projectId: Number(defaultProjectId || data.projectId),
      discountPercentage: Number(data.discountPercentage || 0),
    };
    if (data.code && data.code.trim() !== '') {
      formattedData.code = data.code;
    }
    createMutation(formattedData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <Input
            label="Tiêu đề báo giá *"
            placeholder="Nhập tiêu đề báo giá"
            fullWidth
            {...register('title', { required: true })}
            error={errors.title ? 'Tiêu đề không được để trống' : undefined}
          />
          {!defaultProjectId && (
            <Select
              label="Dự án áp dụng *"
              placeholder="Chọn dự án"
              fullWidth
              value={watch('projectId') || ''}
              {...register('projectId', { required: true })}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              error={errors.projectId ? 'Vui lòng chọn dự án' : undefined}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã báo giá"
              placeholder="Mã báo giá"
              fullWidth
              {...register('code')}
              error={errors.code ? 'Mã không hợp lệ' : undefined}
            />
            <Input
              label="Phần trăm chiết khấu (%)"
              placeholder="Ví dụ: 5"
              type="number"
              fullWidth
              {...register('discountPercentage')}
              error={errors.discountPercentage ? 'Tỉ lệ chiết khấu không hợp lệ' : undefined}
            />
          </div>
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
            disabled={isCreating}
            loading={isCreating}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 2. FORM MODAL ĐỂ CẬP NHẬT BÁO GIÁ (QuotationUpdate)
// ==========================================
interface QuotationUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Pick<Quotation, 'id' | 'title' | 'code' | 'discountPercentage' | 'status' | 'projectId' | 'reviewBy'>;
  projects?: Pick<Project, 'id' | 'name'>[];
}

type QuotationUpdateFormValues = Omit<QuotationUpdate, 'projectId' | 'discountPercentage'> & {
  projectId?: string | number;
  discountPercentage?: string | number;
};

export function QuotationUpdateModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận lưu',
  initialData,
  projects = [],
}: QuotationUpdateModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuotationUpdateFormValues>();

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuotationUpdate }) => updateQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Cập nhật báo giá thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        title: initialData.title || '',
        code: initialData.code || '',
        discountPercentage: initialData.discountPercentage || 0,
        projectId: initialData.projectId || '',
        status: initialData.status || '',
      });
    }
  }, [isOpen, initialData, reset]);

  const handleConfirm = (data: QuotationUpdateFormValues) => {
    if (!initialData) return;
    const formattedData: QuotationUpdate = {
      title: data.title,
      projectId: Number(data.projectId),
      discountPercentage: Number(data.discountPercentage || 0),
    };
    if (data.code && data.code.trim() !== '') {
      formattedData.code = data.code;
    }
    if (data.status && data.status.trim() !== '') {
      formattedData.status = data.status;
    }
    updateMutation({ id: initialData.id, data: formattedData });
  };

  const statusOptions = [
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Từ chối' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <Input
            label="Tiêu đề báo giá *"
            placeholder="Nhập tiêu đề báo giá"
            fullWidth
            {...register('title', { required: true })}
            error={errors.title ? 'Tiêu đề không được để trống' : undefined}
          />
          <Select
            label="Dự án áp dụng *"
            placeholder="Chọn dự án"
            fullWidth
            value={watch('projectId') || ''}
            {...register('projectId', { required: true })}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
            error={errors.projectId ? 'Vui lòng chọn dự án' : undefined}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã báo giá"
              placeholder="Mã báo giá"
              fullWidth
              {...register('code')}
              error={errors.code ? 'Mã không hợp lệ' : undefined}
            />
            <Input
              label="Phần trăm chiết khấu (%)"
              placeholder="Ví dụ: 5"
              type="number"
              fullWidth
              {...register('discountPercentage')}
              error={errors.discountPercentage ? 'Tỉ lệ chiết khấu không hợp lệ' : undefined}
            />
          </div>
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            fullWidth
            value={watch('status') || ''}
            {...register('status')}
            options={statusOptions}
            error={errors.status ? 'Trạng thái không hợp lệ' : undefined}
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
            disabled={updateIsPending}
            loading={updateIsPending}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 3. MODAL XÁC NHẬN XÓA BÁO GIÁ
// ==========================================
interface QuotationDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationTitle?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function QuotationDeleteModal({
  isOpen,
  onClose,
  quotationTitle,
  onConfirm,
  isPending = false,
}: QuotationDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa báo giá" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa báo giá <strong className="text-gray-900 font-semibold">{quotationTitle}</strong>?
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
