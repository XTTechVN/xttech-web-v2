'use client';

import { useEffect, useState } from 'react';
import { Input, Button, Modal, Select, CurrencyInput } from '@/components';
import { CheckCircle2, Upload, Settings } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { createAccessory, updateAccessory } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Accessory, AccessoryCreate, AccessoryUpdate } from '@/types';
import { BASE_MINIO_URL } from '@/config/app';

// ==========================================
// 1. MODAL TẠO MỚI PHỤ KIỆN (AccessoryCreate) HỖ TRỢ UPLOAD & PREVIEW 2 CỘT
// ==========================================
interface AccessoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
}

type AccessoryCreateFormValues = Omit<AccessoryCreate, 'imagePath'>;

export function AccessoryCreateModal({ isOpen, onClose, title, submitText = 'Xác nhận tạo' }: AccessoryCreateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<AccessoryCreateFormValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createAccessory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Thêm phụ kiện thành công');
      onClose();
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: '', code: '', specification: '', unit: '', price: 0 });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleConfirm = (data: AccessoryCreateFormValues) => {
    const payload: AccessoryCreate = {
      name: data.name,
      price: data.price || 0,
    };
    if (data.code && data.code.trim() !== '') {
      payload.code = data.code;
    }
    if (data.specification && data.specification.trim() !== '') {
      payload.specification = data.specification;
    }
    if (data.unit && data.unit.trim() !== '') {
      payload.unit = data.unit;
    }
    createMutation({
      data: payload,
      file: selectedFile || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-2xl w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Ảnh & Preview */}
          <div className="md:col-span-4 flex flex-col items-center gap-3">
            <span className="text-xs font-semibold text-gray-700 select-none self-start">Ảnh minh họa</span>
            <div className="w-full aspect-square max-w-50 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center relative group">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Settings className="w-10 h-10 text-gray-300 animate-spin-slow" />
              )}
            </div>
            <label className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition shadow-xs w-full justify-center">
              <Upload size={16} />
              <span>Chọn ảnh</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </label>
            <span className="text-[11px] text-gray-500 truncate max-w-full text-center">
              {selectedFile ? selectedFile.name : 'Chưa có ảnh được chọn'}
            </span>
          </div>

          {/* Cột phải: Thông tin nhập */}
          <div className="md:col-span-8 flex flex-col space-y-4">
            <Input
              label="Tên phụ kiện *"
              placeholder="Nhập tên phụ kiện"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên phụ kiện không được để trống' : undefined}
            />
            <Input
              label="Mã phụ kiện *"
              placeholder="Nhập mã phụ kiện"
              fullWidth
              {...register('code', { required: true })}
              error={errors.code ? 'Mã phụ kiện không được để trống' : undefined}
            />
            <Input
              label="Thông số kỹ thuật"
              placeholder="Nhập thông số phụ kiện"
              fullWidth
              {...register('specification')}
              error={errors.specification ? 'Thông số kỹ thuật không hợp lệ' : undefined}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Đơn vị tính *"
                placeholder="Chọn ĐVT"
                fullWidth
                value={watch('unit') || ''}
                {...register('unit', { required: true })}
                options={[
                  { value: 'set', label: 'Bộ' },
                  { value: 'pcs', label: 'Cái' },
                  { value: 'unit', label: 'Chiếc' },
                  { value: 'pair', label: 'Đôi' },
                ]}
                error={errors.unit ? 'Vui lòng chọn đơn vị tính' : undefined}
              />
              <Controller
                name="price"
                control={control}
                rules={{
                  required: 'Đơn giá không được để trống',
                  validate: (val) => {
                    const num = Number(val);
                    if (isNaN(num) || num <= 0) return 'Đơn giá phải lớn hơn 0';
                    return true;
                  },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    label="Đơn giá (VNĐ) *"
                    placeholder="Nhập đơn giá"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.price?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end w-full mt-6 pt-4 border-t border-gray-100">
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
// 2. MODAL CẬP NHẬT PHỤ KIỆN (AccessoryUpdate) HỖ TRỢ UPLOAD & PREVIEW 2 CỘT
// ==========================================
interface AccessoryUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Pick<Accessory, 'id' | 'name' | 'code' | 'specification' | 'unit' | 'price' | 'imagePath'>;
}

type AccessoryUpdateFormValues = Omit<AccessoryUpdate, 'imagePath'>;

export function AccessoryUpdateModal({ isOpen, onClose, title, submitText = 'Xác nhận lưu', initialData }: AccessoryUpdateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<AccessoryUpdateFormValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data, file }: { id: number; data: AccessoryUpdate; file?: File }) => updateAccessory(id, { data, file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Cập nhật phụ kiện thành công');
      onClose();
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
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
        unit: initialData.unit || '',
        price: initialData.price !== undefined ? initialData.price : undefined,
      });
      setSelectedFile(null);
      setPreviewUrl(
        initialData.imagePath
          ? initialData.imagePath.startsWith('http')
            ? initialData.imagePath
            : `${BASE_MINIO_URL}${initialData.imagePath}`
          : null,
      );
    }
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleConfirm = (data: AccessoryUpdateFormValues) => {
    if (!initialData) return;
    const payload: AccessoryUpdate = {
      name: data.name,
      code: data.code,
      unit: data.unit,
    };
    if (data.specification && data.specification.trim() !== '') {
      payload.specification = data.specification;
    }
    if (data.price !== undefined) {
      payload.price = data.price;
    }
    updateMutation({
      id: initialData.id,
      data: payload,
      file: selectedFile || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-2xl w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Ảnh & Preview */}
          <div className="md:col-span-4 flex flex-col items-center gap-3">
            <span className="text-gray-700 text-sm font-medium self-start">Ảnh minh họa</span>
            <div className="w-full aspect-square max-w-50 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center relative group">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Settings className="w-10 h-10 text-gray-300" />
              )}
            </div>
            <label className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition shadow-xs w-full justify-center">
              <Upload size={16} />
              <span>Thay thế ảnh</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </label>
            <span className="text-[11px] text-gray-500 truncate max-w-full text-center">
              {selectedFile ? selectedFile.name : 'Chưa chọn ảnh mới'}
            </span>
          </div>

          {/* Cột phải: Thông tin nhập */}
          <div className="md:col-span-8 flex flex-col space-y-4">
            <Input
              label="Tên phụ kiện *"
              placeholder="Nhập tên phụ kiện"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên phụ kiện không được để trống' : undefined}
            />
            <Input
              label="Mã phụ kiện *"
              placeholder="Nhập mã phụ kiện"
              fullWidth
              {...register('code', { required: true })}
              error={errors.code ? 'Mã phụ kiện không được để trống' : undefined}
            />
            <Input
              label="Thông số kỹ thuật"
              placeholder="Nhập thông số phụ kiện"
              fullWidth
              {...register('specification')}
              error={errors.specification ? 'Thông số kỹ thuật không hợp lệ' : undefined}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Đơn vị tính *"
                placeholder="Chọn ĐVT"
                fullWidth
                value={watch('unit') || ''}
                {...register('unit', { required: true })}
                options={[
                  { value: 'set', label: 'Bộ' },
                  { value: 'pcs', label: 'Cái' },
                  { value: 'unit', label: 'Chiếc' },
                  { value: 'pair', label: 'Đôi' },
                ]}
                error={errors.unit ? 'Vui lòng chọn đơn vị tính' : undefined}
              />
              <Controller
                name="price"
                control={control}
                rules={{
                  required: 'Đơn giá không được để trống',
                  validate: (val) => {
                    const num = Number(val);
                    if (isNaN(num) || num <= 0) return 'Đơn giá phải lớn hơn 0';
                    return true;
                  },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    label="Đơn giá (VNĐ) *"
                    placeholder="Nhập đơn giá"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.price?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end w-full mt-6 pt-4 border-t border-gray-150">
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
// 3. MODAL XÁC NHẬN XÓA PHỤ KIỆN
// ==========================================
interface AccessoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessoryName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function AccessoryDeleteModal({ isOpen, onClose, accessoryName, onConfirm, isPending = false }: AccessoryDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa phụ kiện" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa phụ kiện <strong className="text-gray-900 font-semibold">{accessoryName}</strong>?
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
