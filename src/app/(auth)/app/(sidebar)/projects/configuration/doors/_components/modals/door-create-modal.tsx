'use client';

import React, { useEffect, useState } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2, Upload, Columns, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createDoor } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { DoorCreate } from '@/types';
import { showErrorToast } from '@/utils';
import { NewImageItem } from './types';

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

  const [newImages, setNewImages] = useState<NewImageItem[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createDoor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      toast.success('Thêm loại cửa thành công');
      onClose();
      reset();
      setNewImages([]);
      setPrimaryIndex(0);
    },
    onError: (error) => {
      showErrorToast(error, 'Thêm loại cửa thất bại');
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: '', type: '', code: '', specification: '' });
      setNewImages([]);
      setPrimaryIndex(0);
    }
  }, [isOpen, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const items: NewImageItem[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...items]);
    e.target.value = '';
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    const item = newImages[indexToRemove];
    if (item) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setNewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (primaryIndex === indexToRemove) {
      setPrimaryIndex(0);
    } else if (primaryIndex > indexToRemove) {
      setPrimaryIndex((prev) => prev - 1);
    }
  };

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

    const sortedFiles: File[] = [];
    if (newImages.length > 0) {
      const selectedPrimary = newImages[primaryIndex] || newImages[0];
      sortedFiles.push(selectedPrimary.file);
      newImages.forEach((img, idx) => {
        if (idx !== (newImages[primaryIndex] ? primaryIndex : 0)) {
          sortedFiles.push(img.file);
        }
      });
    }

    createMutation({
      data: payload,
      files: sortedFiles.length > 0 ? sortedFiles : undefined,
    });
  };

  const currentPrimaryPreview = newImages[primaryIndex]?.previewUrl || null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-2xl w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Ảnh & Preview */}
          <div className="md:col-span-5 flex flex-col items-center gap-3 w-full">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 select-none">Hình ảnh ({newImages.length})</span>
              {newImages.length > 0 && (
                <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium">
                  Đã chọn ảnh chính
                </span>
              )}
            </div>

            {/* Khung xem ảnh chính được chọn */}
            <div className="w-full aspect-square max-w-50 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center relative group">
              {currentPrimaryPreview ? (
                <img src={currentPrimaryPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Columns className="w-10 h-10 text-gray-300" />
              )}
              {currentPrimaryPreview && (
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded shadow">
                  Ảnh chính
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition shadow-xs w-full justify-center">
              <Upload size={16} />
              <span>Tải lên nhiều ảnh</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Danh sách ảnh thumbnails */}
            {newImages.length > 0 && (
              <div className="w-full flex flex-col gap-1.5 mt-1">
                <span className="text-[11px] text-gray-500">Nhấn vào ảnh để chọn làm ảnh chính:</span>
                <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1.5 border border-gray-100 rounded-lg bg-gray-50/50">
                  {newImages.map((img, idx) => {
                    const isPrimary = idx === primaryIndex;
                    return (
                      <div
                        key={img.id}
                        onClick={() => setPrimaryIndex(idx)}
                        className={`relative aspect-square rounded-xl border overflow-hidden cursor-pointer group transition-all ${
                          isPrimary
                            ? 'border-primary ring-2 ring-primary/40 shadow-xs'
                            : 'border-gray-200 hover:border-gray-400 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <img src={img.previewUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        {isPrimary && (
                          <div className="absolute inset-x-0 bottom-0 bg-primary/95 text-white text-[10px] text-center font-medium py-0.5 leading-none">
                            Chính
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNewImage(idx);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/95 text-slate-500 hover:text-red-600 hover:bg-white shadow-md border border-slate-200 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110"
                          title="Xóa ảnh"
                        >
                          <X size={11} strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin nhập */}
          <div className="md:col-span-7 flex flex-col space-y-4">
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
