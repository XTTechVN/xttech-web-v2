'use client';

import { useEffect } from 'react';
import { Input, Button, Modal, CurrencyInput, Select } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { createExtraOption, updateExtraOption } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import { EXTRA_OPTION_UNIT_MAP, type ExtraOption, type ExtraOptionCreate, type ExtraOptionUpdate, type ExtraOptionUnit } from '@/types';

// ==========================================
// 1. MODAL TẠO MỚI TÙY CHỌN PHÁT SINH
// ==========================================
interface ExtraOptionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
}

type ExtraOptionCreateFormValues = ExtraOptionCreate;

export function ExtraOptionCreateModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận tạo',
}: ExtraOptionCreateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExtraOptionCreateFormValues>({
    defaultValues: {
      name: '',
      code: '',
      costPrice: 0,
      retailPrice: 0,
      salePrice: 0,
      unit: 'set',
    },
  });

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createExtraOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extra-options'] });
      toast.success('Thêm tùy chọn phát sinh thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: '', code: '', costPrice: 0, retailPrice: 0, salePrice: 0, unit: 'set' });
    }
  }, [isOpen]);

  const handleConfirm = (data: ExtraOptionCreateFormValues) => {
    createMutation({
      name: data.name,
      code: data.code,
      costPrice: data.costPrice || 0,
      retailPrice: data.retailPrice || 0,
      salePrice: data.salePrice || 0,
      unit: data.unit,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <Input
            label="Tên tùy chọn *"
            placeholder="Ví dụ: Sơn anodet, Kính hộp"
            fullWidth
            {...register('name', { required: true })}
            error={errors.name ? 'Tên tùy chọn không được để trống' : undefined}
          />
          <Input
            label="Mã tùy chọn *"
            placeholder="Ví dụ: OPT01"
            fullWidth
            {...register('code', { required: true })}
            error={errors.code ? 'Mã tùy chọn không được để trống' : undefined}
          />
          <Select
            label="Đơn vị tính *"
            fullWidth
            value={watch('unit') || ''}
            {...register('unit', { required: 'Vui lòng chọn đơn vị tính' })}
            options={Object.entries(EXTRA_OPTION_UNIT_MAP).map(([value, label]) => ({
              value,
              label,
            }))}
            error={errors.unit?.message}
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
// 2. MODAL CẬP NHẬT TÙY CHỌN PHÁT SINH
// ==========================================
interface ExtraOptionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Pick<ExtraOption, 'id' | 'name' | 'code' | 'costPrice' | 'retailPrice' | 'salePrice' | 'unit'>;
}

type ExtraOptionUpdateFormValues = ExtraOptionUpdate;

export function ExtraOptionUpdateModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận lưu',
  initialData,
}: ExtraOptionUpdateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExtraOptionUpdateFormValues>();

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExtraOptionUpdate }) => updateExtraOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extra-options'] });
      toast.success('Cập nhật tùy chọn phát sinh thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name || '',
        code: initialData.code || '',
        costPrice: initialData.costPrice !== undefined ? initialData.costPrice : undefined,
        retailPrice: initialData.retailPrice !== undefined ? initialData.retailPrice : undefined,
        salePrice: initialData.salePrice !== undefined ? initialData.salePrice : undefined,
        unit: initialData.unit || 'set',
      });
    }
  }, [isOpen, initialData, reset]);

  const handleConfirm = (data: ExtraOptionUpdateFormValues) => {
    if (!initialData) return;
    updateMutation({ id: initialData.id, data });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-md w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <Input
            label="Tên tùy chọn *"
            placeholder="Ví dụ: Sơn anodet, Kính hộp"
            fullWidth
            {...register('name', { required: true })}
            error={errors.name ? 'Tên tùy chọn không được để trống' : undefined}
          />
          <Input
            label="Mã tùy chọn *"
            placeholder="Ví dụ: OPT01"
            fullWidth
            {...register('code', { required: true })}
            error={errors.code ? 'Mã tùy chọn không được để trống' : undefined}
          />
          <Select
            label="Đơn vị tính *"
            fullWidth
            value={watch('unit') || ''}
            {...register('unit', { required: 'Vui lòng chọn đơn vị tính' })}
            options={Object.entries(EXTRA_OPTION_UNIT_MAP).map(([value, label]) => ({
              value,
              label,
            }))}
            error={errors.unit?.message}
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
// 3. MODAL XÁC NHẬN XÓA TÙY CHỌN PHÁT SINH
// ==========================================
interface ExtraOptionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  optionName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ExtraOptionDeleteModal({
  isOpen,
  onClose,
  optionName,
  onConfirm,
  isPending = false,
}: ExtraOptionDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa tùy chọn phát sinh" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa tùy chọn phát sinh <strong className="text-gray-900 font-semibold">{optionName}</strong>?
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
