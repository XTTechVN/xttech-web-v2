'use client';

import { useEffect } from 'react';
import { Input, Button, Modal, CurrencyInput, Select } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { createMaterial, updateMaterial } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Material, MaterialCreate, MaterialUpdate } from '@/types';

// ==========================================
// 1. MODAL TẠO MỚI HỆ NHÔM (MaterialCreate)
// ==========================================
interface MaterialCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
}

type MaterialCreateFormValues = Omit<MaterialCreate, 'imagePath'>;

export function MaterialCreateModal({ isOpen, onClose, title, submitText = 'Xác nhận tạo' }: MaterialCreateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<MaterialCreateFormValues>();

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Thêm hệ nhôm thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: '', code: '', specification: '', description: '', costPrice: 0, retailPrice: 0, salePrice: 0, unit: 'set' });
    }
  }, [isOpen]);

  const handleConfirm = (data: MaterialCreateFormValues) => {
    const payload: any = {
      name: data.name,
      code: data.code,
      costPrice: data.costPrice || 0,
      retailPrice: data.retailPrice || 0,
      salePrice: data.salePrice || 0,
      unit: data.unit,
    };
    if (data.specification && data.specification.trim() !== '') {
      payload.specification = data.specification;
    }
    if (data.description && data.description.trim() !== '') {
      payload.description = data.description;
    }
    createMutation(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <Input
            label="Tên hệ nhôm *"
            placeholder="Nhập tên hệ nhôm"
            fullWidth
            {...register('name', { required: true })}
            error={errors.name ? 'Tên hệ nhôm không được để trống' : undefined}
          />
          <Input
            label="Mã hệ nhôm *"
            placeholder="Nhập mã hệ nhôm"
            fullWidth
            {...register('code', { required: true })}
            error={errors.code ? 'Mã hệ nhôm không được để trống' : undefined}
          />
          <Input
            label="Thông số kỹ thuật"
            placeholder="Nhập thông số kỹ thuật"
            fullWidth
            {...register('specification')}
            error={errors.specification ? 'Thông số kỹ thuật không hợp lệ' : undefined}
          />
          <Input
            label="Mô tả chi tiết"
            placeholder="Nhập mô tả"
            fullWidth
            {...register('description')}
            error={errors.description ? 'Mô tả không hợp lệ' : undefined}
          />
          <Select
            label="Đơn vị tính *"
            placeholder="Chọn đơn vị tính"
            fullWidth
            value={watch('unit') || ''}
            {...register('unit', { required: true })}
            options={[
              { value: 'set', label: 'Bộ' },
              { value: 'area', label: 'Diện tích (m²)' },
              // { value: 'm2', label: 'm²' },
            ]}
            error={errors.unit ? 'Vui lòng chọn đơn vị tính' : undefined}
          />
          <Controller
            name="costPrice"
            control={control}
            rules={{
              required: 'Giá vốn không được để trống',
              validate: (val) => {
                const num = Number(val);
                if (isNaN(num) || num < 0) return 'Giá vốn phải lớn hơn hoặc bằng 0';
                return true;
              },
            }}
            render={({ field }) => (
              <CurrencyInput
                label="Giá vốn (VNĐ) *"
                placeholder="Nhập giá vốn"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={errors.costPrice?.message}
              />
            )}
          />
          <Controller
            name="retailPrice"
            control={control}
            rules={{
              required: 'Giá bán lẻ không được để trống',
              validate: (val) => {
                const num = Number(val);
                if (isNaN(num) || num < 0) return 'Giá bán lẻ phải lớn hơn hoặc bằng 0';
                return true;
              },
            }}
            render={({ field }) => (
              <CurrencyInput
                label="Giá bán lẻ (VNĐ) *"
                placeholder="Nhập giá bán lẻ"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={errors.retailPrice?.message}
              />
            )}
          />
          <Controller
            name="salePrice"
            control={control}
            rules={{
              required: 'Giá đại lý không được để trống',
              validate: (val) => {
                const num = Number(val);
                if (isNaN(num) || num < 0) return 'Giá đại lý phải lớn hơn hoặc bằng 0';
                return true;
              },
            }}
            render={({ field }) => (
              <CurrencyInput
                label="Giá đại lý (VNĐ) *"
                placeholder="Nhập giá đại lý"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={errors.salePrice?.message}
              />
            )}
          />
        </div>
        <div className="flex gap-2 justify-end w-full mt-6">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={16} />} type="submit" disabled={isCreating} loading={isCreating}>
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 2. MODAL CẬP NHẬT HỆ NHÔM (MaterialUpdate)
// ==========================================
interface MaterialUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Pick<Material, 'id' | 'name' | 'code' | 'specification' | 'description' | 'costPrice' | 'retailPrice' | 'salePrice' | 'unit'>;
}

type MaterialUpdateFormValues = Omit<MaterialUpdate, 'imagePath'>;

export function MaterialUpdateModal({ isOpen, onClose, title, submitText = 'Xác nhận lưu', initialData }: MaterialUpdateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<MaterialUpdateFormValues>();

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MaterialUpdate }) => updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Cập nhật hệ nhôm thành công');
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
        name: initialData.name || '',
        code: initialData.code || '',
        specification: initialData.specification || '',
        description: initialData.description || '',
        costPrice: initialData.costPrice !== undefined ? initialData.costPrice : undefined,
        retailPrice: initialData.retailPrice !== undefined ? initialData.retailPrice : undefined,
        salePrice: initialData.salePrice !== undefined ? initialData.salePrice : undefined,
        unit: initialData.unit || undefined,
      });
    }
  }, [isOpen, initialData, reset]);

  const handleConfirm = (data: MaterialUpdateFormValues) => {
    if (!initialData) return;
    const payload: any = {
      name: data.name,
      code: data.code,
      costPrice: data.costPrice !== undefined ? data.costPrice : undefined,
      retailPrice: data.retailPrice !== undefined ? data.retailPrice : undefined,
      salePrice: data.salePrice !== undefined ? data.salePrice : undefined,
      unit: data.unit,
      specification: data.specification?.trim() || "",
      description: data.description?.trim() || "",
    };
    updateMutation({ id: initialData.id, data: payload });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <Input
            label="Tên hệ nhôm *"
            placeholder="Nhập tên hệ nhôm"
            fullWidth
            {...register('name', { required: true })}
            error={errors.name ? 'Tên hệ nhôm không được để trống' : undefined}
          />
          <Input
            label="Mã hệ nhôm *"
            placeholder="Nhập mã hệ nhôm"
            fullWidth
            {...register('code', { required: true })}
            error={errors.code ? 'Mã hệ nhôm không được để trống' : undefined}
          />
          <Input
            label="Thông số kỹ thuật"
            placeholder="Nhập thông số kỹ thuật"
            fullWidth
            {...register('specification')}
            error={errors.specification ? 'Thông số kỹ thuật không hợp lệ' : undefined}
          />
          <Input
            label="Mô tả chi tiết"
            placeholder="Nhập mô tả"
            fullWidth
            {...register('description')}
            error={errors.description ? 'Mô tả không hợp lệ' : undefined}
          />
          <Select
            label="Đơn vị tính *"
            placeholder="Chọn đơn vị tính"
            fullWidth
            value={watch('unit') || ''}
            {...register('unit', { required: true })}
            options={[
              { value: 'set', label: 'Bộ' },
              { value: 'area', label: 'Diện tích (m²)' },
              // { value: 'm2', label: 'm²' },
            ]}
            error={errors.unit ? 'Vui lòng chọn đơn vị tính' : undefined}
          />
          <Controller
            name="costPrice"
            control={control}
            rules={{
              required: 'Giá vốn không được để trống',
              validate: (val) => {
                const num = Number(val);
                if (isNaN(num) || num < 0) return 'Giá vốn phải lớn hơn hoặc bằng 0';
                return true;
              },
            }}
            render={({ field }) => (
              <CurrencyInput
                label="Giá vốn (VNĐ) *"
                placeholder="Nhập giá vốn"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={errors.costPrice?.message}
              />
            )}
          />
          <Controller
            name="retailPrice"
            control={control}
            rules={{
              required: 'Giá bán lẻ không được để trống',
              validate: (val) => {
                const num = Number(val);
                if (isNaN(num) || num < 0) return 'Giá bán lẻ phải lớn hơn hoặc bằng 0';
                return true;
              },
            }}
            render={({ field }) => (
              <CurrencyInput
                label="Giá bán lẻ (VNĐ) *"
                placeholder="Nhập giá bán lẻ"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={errors.retailPrice?.message}
              />
            )}
          />
          <Controller
            name="salePrice"
            control={control}
            rules={{
              required: 'Giá đại lý không được để trống',
              validate: (val) => {
                const num = Number(val);
                if (isNaN(num) || num < 0) return 'Giá đại lý phải lớn hơn hoặc bằng 0';
                return true;
              },
            }}
            render={({ field }) => (
              <CurrencyInput
                label="Giá đại lý (VNĐ) *"
                placeholder="Nhập giá đại lý"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={errors.salePrice?.message}
              />
            )}
          />
        </div>
        <div className="flex gap-2 justify-end w-full mt-6">
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
// 3. MODAL XÁC NHẬN XÓA HỆ NHÔM
// ==========================================
interface MaterialDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function MaterialDeleteModal({ isOpen, onClose, materialName, onConfirm, isPending = false }: MaterialDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa hệ nhôm" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa hệ nhôm <strong className="text-gray-900 font-semibold">{materialName}</strong>?
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
