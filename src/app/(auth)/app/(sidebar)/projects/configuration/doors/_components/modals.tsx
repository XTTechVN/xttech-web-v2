'use client';

import { useEffect, useState } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2, Upload, Columns } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createDoor, updateDoor } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Door, DoorCreate, DoorUpdate } from '@/types';
import { BASE_MINIO_URL } from '@/config/app';

// ==========================================
// 1. MODAL TẠO MỚI CỬA (DoorCreate) HỖ TRỢ PREVIEW ẢNH & 2 CỘT
// ==========================================
interface DoorCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
}

type DoorCreateFormValues = Omit<DoorCreate, 'imagePath'>;

export function DoorCreateModal({ isOpen, onClose, title, submitText = 'Xác nhận tạo' }: DoorCreateModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DoorCreateFormValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createDoor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      toast.success('Thêm loại cửa thành công');
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
      reset({ name: '', type: '', code: '', specification: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleConfirm = (data: DoorCreateFormValues) => {
    const payload: DoorCreate = {
      name: data.name,
    };
    if (data.type && data.type.trim() !== '') {
      payload.type = data.type;
    }
    if (data.code && data.code.trim() !== '') {
      payload.code = data.code;
    }
    if (data.specification && data.specification.trim() !== '') {
      payload.specification = data.specification;
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
                <Columns className="w-10 h-10 text-gray-300" />
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
              label="Tên cửa *"
              placeholder="Nhập tên cửa"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên cửa không được để trống' : undefined}
            />
            <Input
              label="Mã cửa *"
              placeholder="Nhập mã sản phẩm cửa"
              fullWidth
              {...register('code', { required: true })}
              error={errors.code ? 'Mã cửa không được để trống' : undefined}
            />
            <Select
              label="Phân loại *"
              placeholder="Chọn phân loại"
              fullWidth
              value={watch('type') || ''}
              {...register('type', { required: true })}
              options={[
                { value: 'cd', label: 'Cửa đi' },
                { value: 'cs', label: 'Cửa sổ' },
                { value: 'ck', label: 'Cửa kính' },
              ]}
              error={errors.type ? 'Vui lòng chọn phân loại cửa' : undefined}
            />
            <Input
              label="Thông số kỹ thuật"
              placeholder="Nhập thông số kỹ thuật"
              fullWidth
              {...register('specification')}
              error={errors.specification ? 'Thông số kỹ thuật không hợp lệ' : undefined}
            />
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
// 2. MODAL CẬP NHẬT CỬA (DoorUpdate) HỖ TRỢ PREVIEW ẢNH & 2 CỘT
// ==========================================
interface DoorUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Pick<Door, 'id' | 'name' | 'type' | 'code' | 'imagePath' | 'specification'>;
}

type DoorUpdateFormValues = Omit<DoorUpdate, 'imagePath'>;

export function DoorUpdateModal({ isOpen, onClose, title, submitText = 'Xác nhận lưu', initialData }: DoorUpdateModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DoorUpdateFormValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data, file }: { id: number; data: DoorUpdate; file?: File }) => updateDoor(id, { data, file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      toast.success('Cập nhật loại cửa thành công');
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
        type: initialData.type || '',
        code: initialData.code || '',
        specification: initialData.specification || '',
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
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleConfirm = (data: DoorUpdateFormValues) => {
    if (!initialData) return;
    const payload: DoorUpdate = {
      name: data.name,
      type: data.type,
      code: data.code,
    };
    if (data.specification && data.specification.trim() !== '') {
      payload.specification = data.specification;
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
                <Columns className="w-10 h-10 text-gray-300" />
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
              label="Tên cửa *"
              placeholder="Nhập tên cửa"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên cửa không được để trống' : undefined}
            />
            <Input
              label="Mã cửa *"
              placeholder="Nhập mã sản phẩm cửa"
              fullWidth
              {...register('code', { required: true })}
              error={errors.code ? 'Mã cửa không được để trống' : undefined}
            />
            <Select
              label="Phân loại *"
              placeholder="Chọn phân loại"
              fullWidth
              value={watch('type') || ''}
              {...register('type', { required: true })}
              options={[
                { value: 'cd', label: 'Cửa đi' },
                { value: 'cs', label: 'Cửa sổ' },
                { value: 'ck', label: 'Cửa kính' },
              ]}
              error={errors.type ? 'Vui lòng chọn phân loại cửa' : undefined}
            />
            <Input
              label="Thông số kỹ thuật"
              placeholder="Nhập thông số kỹ thuật"
              fullWidth
              {...register('specification')}
              error={errors.specification ? 'Thông số kỹ thuật không hợp lệ' : undefined}
            />
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
// 3. MODAL XÁC NHẬN XÓA CỬA
// ==========================================
interface DoorDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  doorName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DoorDeleteModal({ isOpen, onClose, doorName, onConfirm, isPending = false }: DoorDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa thiết kế cửa" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa thiết kế cửa <strong className="text-gray-900 font-semibold">{doorName}</strong>?
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
