'use client';

import { useEffect, useState } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2, Upload, Columns, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createDoor, updateDoor, setPrimaryDoorImage } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Door, DoorCreate, DoorUpdate, DoorImage } from '@/types';
import { BASE_MINIO_URL } from '@/config/app';
import { showErrorToast } from '@/utils';

// ==========================================
// ==========================================
// 1. MODAL TẠO MỚI CỬA (DoorCreate) HỖ TRỢ UPLOAD NHIỀU ẢNH & CHỌN ẢNH CHÍNH
// ==========================================
interface DoorCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
}

type DoorCreateFormValues = Omit<DoorCreate, 'imagePath'>;

interface NewImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

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
    // Reset file input value
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

    // Sắp xếp file ảnh sao cho ảnh chính (primaryIndex) đứng đầu mảng files
    // Backend gán is_primary = True cho phần tử đầu tiên khi tạo mới
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

// ==========================================
// 2. MODAL CẬP NHẬT CỬA (DoorUpdate) HỖ TRỢ DANH SÁCH ẢNH, CHỌN ẢNH CHÍNH & UPLOAD NHIỀU ẢNH
// ==========================================
interface DoorUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Door;
}

type DoorUpdateFormValues = Omit<DoorUpdate, 'imagePath'>;

export function DoorUpdateModal({ isOpen, onClose, title, submitText = 'Xác nhận lưu', initialData }: DoorUpdateModalProps) {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<DoorUpdateFormValues>();

  // Ảnh hiện tại từ server
  const [existingImages, setExistingImages] = useState<DoorImage[]>([]);
  // Danh sách ID ảnh cần xóa
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  // ID ảnh đang được chọn làm chính (từ server)
  const [primaryImageId, setPrimaryImageId] = useState<number | null>(null);

  // Ảnh upload mới thêm
  const [newImages, setNewImages] = useState<NewImageItem[]>([]);
  // Nếu người dùng chọn ảnh chính nằm trong danh sách mới upload
  const [selectedNewPrimaryIdx, setSelectedNewPrimaryIdx] = useState<number | null>(null);

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({
      id,
      data,
      files,
      deletedImageIds,
    }: {
      id: number;
      data: DoorUpdate;
      files?: File[];
      deletedImageIds?: number[];
    }) => updateDoor(id, { data, files, deletedImageIds }),
    onSuccess: async () => {
      // Nếu có chọn ảnh chính từ ảnh cũ (đã có id trên server) và khác primary ban đầu, gọi api đặt primary
      if (initialData?.id && primaryImageId && !selectedNewPrimaryIdx) {
        try {
          await setPrimaryDoorImage(initialData.id, primaryImageId);
        } catch (e) {
          console.warn('Lỗi khi cập nhật ảnh chính', e);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['doors'] });
      toast.success('Cập nhật loại cửa thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      showErrorToast(error, 'Cập nhật loại cửa thất bại');
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

      const images = initialData.images || [];
      setExistingImages(images);
      setDeletedImageIds([]);
      setNewImages([]);
      setSelectedNewPrimaryIdx(null);

      // Xác định ảnh primary hiện tại
      const primary = images.find((img) => img.isPrimary);
      setPrimaryImageId(primary ? primary.id : images.length > 0 ? images[0].id : null);
    }
  }, [isOpen, initialData, reset]);

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

  const handleRemoveExistingImage = (imageId: number) => {
    setDeletedImageIds((prev) => [...prev, imageId]);
    const remaining = existingImages.filter((img) => img.id !== imageId);
    setExistingImages(remaining);

    // Nếu vừa xóa ảnh primary hiện tại
    if (primaryImageId === imageId) {
      if (remaining.length > 0) {
        setPrimaryImageId(remaining[0].id);
      } else if (newImages.length > 0) {
        setPrimaryImageId(null);
        setSelectedNewPrimaryIdx(0);
      } else {
        setPrimaryImageId(null);
      }
    }
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    const item = newImages[indexToRemove];
    if (item) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setNewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));

    if (selectedNewPrimaryIdx === indexToRemove) {
      if (existingImages.length > 0) {
        setSelectedNewPrimaryIdx(null);
        setPrimaryImageId(existingImages[0].id);
      } else {
        setSelectedNewPrimaryIdx(0);
      }
    } else if (selectedNewPrimaryIdx !== null && selectedNewPrimaryIdx > indexToRemove) {
      setSelectedNewPrimaryIdx((prev) => (prev !== null ? prev - 1 : null));
    }
  };

  // Chọn ảnh chính từ ảnh server
  const handleSelectExistingPrimary = (imgId: number) => {
    setPrimaryImageId(imgId);
    setSelectedNewPrimaryIdx(null);
  };

  // Chọn ảnh chính từ ảnh mới upload
  const handleSelectNewPrimary = (idx: number) => {
    setSelectedNewPrimaryIdx(idx);
    setPrimaryImageId(null);
  };

  const handleConfirm = (data: DoorUpdateFormValues) => {
    if (!initialData) return;
    const payload: DoorUpdate = {
      name: data.name,
      type: data.type,
      code: data.code,
      specification: data.specification?.trim() || '',
    };

    // Chuẩn bị mảng files mới
    const filesToUpload: File[] = [];
    if (newImages.length > 0) {
      if (selectedNewPrimaryIdx !== null && newImages[selectedNewPrimaryIdx]) {
        // Đưa ảnh chính lên đầu danh sách upload
        filesToUpload.push(newImages[selectedNewPrimaryIdx].file);
        newImages.forEach((img, idx) => {
          if (idx !== selectedNewPrimaryIdx) {
            filesToUpload.push(img.file);
          }
        });
      } else {
        newImages.forEach((img) => filesToUpload.push(img.file));
      }
    }

    updateMutation({
      id: initialData.id,
      data: payload,
      files: filesToUpload.length > 0 ? filesToUpload : undefined,
      deletedImageIds: deletedImageIds.length > 0 ? deletedImageIds : undefined,
    });
  };

  // Tính preview ảnh chính hiện tại
  let currentMainPreview: string | null = null;
  if (selectedNewPrimaryIdx !== null && newImages[selectedNewPrimaryIdx]) {
    currentMainPreview = newImages[selectedNewPrimaryIdx].previewUrl;
  } else if (primaryImageId) {
    const found = existingImages.find((img) => img.id === primaryImageId);
    if (found) {
      currentMainPreview = found.imagePath.startsWith('http')
        ? found.imagePath
        : `${BASE_MINIO_URL}${found.imagePath}`;
    }
  } else if (existingImages.length > 0) {
    const first = existingImages[0];
    currentMainPreview = first.imagePath.startsWith('http')
      ? first.imagePath
      : `${BASE_MINIO_URL}${first.imagePath}`;
  } else if (initialData?.imagePath) {
    currentMainPreview = initialData.imagePath.startsWith('http')
      ? initialData.imagePath
      : `${BASE_MINIO_URL}${initialData.imagePath}`;
  }

  const totalImageCount = existingImages.length + newImages.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-2xl w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Ảnh & Preview */}
          <div className="md:col-span-5 flex flex-col items-center gap-3 w-full">
            <div className="w-full flex items-center justify-between">
              <span className="text-gray-700 text-xs font-semibold self-start">
                Hình ảnh ({totalImageCount})
              </span>
              {totalImageCount > 0 && (
                <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium">
                  Đã chọn ảnh chính
                </span>
              )}
            </div>

            {/* Khung xem ảnh chính được chọn */}
            <div className="w-full aspect-square max-w-50 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center relative group">
              {currentMainPreview ? (
                <img src={currentMainPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Columns className="w-10 h-10 text-gray-300" />
              )}
              {currentMainPreview && (
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded shadow">
                  Ảnh chính
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition shadow-xs w-full justify-center">
              <Upload size={16} />
              <span>Thêm ảnh mới</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {/* Danh sách toàn bộ ảnh (hiện có + mới upload) */}
            {totalImageCount > 0 && (
              <div className="w-full flex flex-col gap-1.5 mt-1">
                <span className="text-[11px] text-gray-500">Nhấn vào ảnh để chọn làm ảnh chính:</span>
                <div className="grid grid-cols-3 gap-2.5 max-h-52 overflow-y-auto p-1.5 border border-gray-100 rounded-lg bg-gray-50/50">
                  {/* Render ảnh hiện có */}
                  {existingImages.map((img) => {
                    const isPrimary = primaryImageId === img.id && selectedNewPrimaryIdx === null;
                    const src = img.imagePath.startsWith('http')
                      ? img.imagePath
                      : `${BASE_MINIO_URL}${img.imagePath}`;
                    return (
                      <div
                        key={`existing-${img.id}`}
                        onClick={() => handleSelectExistingPrimary(img.id)}
                        className={`relative aspect-square rounded-xl border overflow-hidden cursor-pointer group transition-all ${
                          isPrimary
                            ? 'border-primary ring-2 ring-primary/40 shadow-xs'
                            : 'border-gray-200 hover:border-gray-400 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <img src={src} alt={img.name || 'Door'} className="w-full h-full object-cover" />
                        {isPrimary && (
                          <div className="absolute inset-x-0 bottom-0 bg-primary/95 text-white text-[10px] text-center font-medium py-0.5 leading-none">
                            Chính
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveExistingImage(img.id);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/95 text-slate-500 hover:text-red-600 hover:bg-white shadow-md border border-slate-200 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110"
                          title="Xóa ảnh"
                        >
                          <X size={11} strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Render ảnh mới thêm */}
                  {newImages.map((img, idx) => {
                    const isPrimary = selectedNewPrimaryIdx === idx;
                    return (
                      <div
                        key={img.id}
                        onClick={() => handleSelectNewPrimary(idx)}
                        className={`relative aspect-square rounded-xl border overflow-hidden cursor-pointer group transition-all ${
                          isPrimary
                            ? 'border-primary ring-2 ring-primary/40 shadow-xs'
                            : 'border-blue-200 hover:border-blue-400 opacity-90 hover:opacity-100'
                        }`}
                      >
                        <img src={img.previewUrl} alt={`New upload ${idx}`} className="w-full h-full object-cover" />
                        {isPrimary ? (
                          <div className="absolute inset-x-0 bottom-0 bg-primary/95 text-white text-[10px] text-center font-medium py-0.5 leading-none">
                            Chính (Mới)
                          </div>
                        ) : (
                          <div className="absolute inset-x-0 top-0 bg-emerald-600/85 text-white text-[9px] text-center py-0.5 leading-none font-medium">
                            Mới
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
