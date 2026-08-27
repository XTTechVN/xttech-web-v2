/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useRef, useState } from 'react';

// Thành phần dùng chung cho toàn trang
import { Input, Button, Modal, Select } from '@/components';

// Icons
import { CheckCircle2, Upload, X, LocateFixed } from 'lucide-react';

// Form sử dụng
import { useForm } from 'react-hook-form';

// Actions
import { createCustomer, updateCustomer, getUsers } from '@/actions';

import { BASE_MINIO_URL } from '@/config/app';
import { CUSTOMER_TYPE_OPTIONS } from '../config';

import toast from 'react-hot-toast';

import { useMutation, useQuery } from '@tanstack/react-query';

import queryClient from '@/utils/query';
import { usePermission } from '@/hooks';

import type { CustomerCreate, CustomerUpdate } from '@/types';

// Interface form modal để Thêm / Sửa thông tin khách hàng
interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: {
    id: number;
    name: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    identifyCode?: string | null;
    email?: string | null;
    phone?: string | null;
    staffId?: string | null;
    type?: string | null;
    images?: any[];
  };
}

type CustomerFormValues = CustomerCreate & { type?: string };
export function CustomerFormModal({ isOpen, onClose, title, submitText = 'Xác nhận tạo', initialData }: CustomerFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors }, watch, } = useForm<CustomerFormValues>();

  const { user, canAssignStaff } = usePermission();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllExistingImages, setShowAllExistingImages] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Lấy vị trí GPS hiện tại
  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị GPS');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
        setValue('longitude', lng, { shouldValidate: true, shouldDirty: true });
        toast.success('Đã lấy tọa độ vị trí hiện tại thành công');
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền trong cài đặt trình duyệt.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Không thể xác định vị trí hiện tại.');
            break;
          case error.TIMEOUT:
            toast.error('Quá thời gian lấy vị trí GPS.');
            break;
          default:
            toast.error('Lỗi khi lấy vị trí hiện tại.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Load danh sách nhân viên
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => getUsers({ limit: 1000 }),
  });

  const staffOptions =
    usersData?.items
      ?.filter((u) => u.roles?.some((r) => r.code === 'sale'))
      ?.map((u) => ({
        value: u.id,
        label: u.fullName || u.username || u.email,
      })) || [];
    
  if (!canAssignStaff && user) {
    const isExist = staffOptions.some(opt => opt.value === user.id);
    if (!isExist) {
      staffOptions.push({
        value: user.id,
        label: user.fullName || user.username || user.email,
      });
    }
  }

  // Xử lý upload hình ảnh có thể tải lên đc nhiều hình ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const newImages: { id: string; file: File; preview: string }[] = [];

    Array.from(files).forEach((file) => {
      if (!allowedImageTypes.includes(file.type)) {
        toast.error(`"${file.name}" không hợp lệ. Chỉ chấp nhận định dạng ảnh!`);
        return;
      }
      const sizeLimit = 20 * 1024 * 1024;
      if (file.size > sizeLimit) {
        toast.error(`Dung lượng ảnh "${file.name}" vượt quá giới hạn (tối đa 20MB)!`);
        return;
      }

      newImages.push({
        id: `${file.name}-${file.size}-${Date.now()}`,
        file,
        preview: URL.createObjectURL(file),
      });
    });

    if (newImages.length > 0) {
      setSelectedImages((prev) => [...prev, ...newImages]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Xử lý xóa hình ảnh
  const handleRemoveImage = (id: string) => {
    setSelectedImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleRemoveExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedImageIds((prev) => [...prev, id]);
  };

  // Logic Thêm khách hàng
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

  // Logic Cập nhật khách hàng
  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerUpdate }) => updateCustomer(id, data),
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

  // Xử lý khi open modal
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
        address: initialData?.address || '',
        latitude: initialData?.latitude ?? null,
        longitude: initialData?.longitude ?? null,
        identifyCode: initialData?.identifyCode || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        staffId: initialData?.staffId || (!canAssignStaff && user ? user.id : ''),
        type: initialData?.type || '',
      });
       
      setSelectedImages([]);

      const getFullImageUrl = (path: string) => {
        if (!path) return undefined;
        return `${BASE_MINIO_URL}${path}`;
      };

      const mappedImages = (initialData?.images || []).map((img, index) => {
        const imgPath = img.imagePath;
        const fullUrl = getFullImageUrl(imgPath);
        return {
          id: img.id || `img-obj-${index}`,
          url: fullUrl,
          preview: fullUrl,
          ...img,
        };
      });
      setExistingImages(mappedImages);

      setDeletedImageIds([]);
      setShowAllImages(false);
      setShowAllExistingImages(false);
    } else {
      reset({ name: '', address: '', latitude: null, longitude: null, identifyCode: '', email: '', phone: '', staffId: '', type: '' });
      setSelectedImages((prev) => {
        prev.forEach((img) => URL.revokeObjectURL(img.preview));
        return [];
      });
      setExistingImages([]);
      setDeletedImageIds([]);
      setShowAllImages(false);
      setShowAllExistingImages(false);
    }
  }, [isOpen, initialData, reset]);

  // Xử lý khi submit form
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
    if (data.latitude !== undefined && data.latitude !== null && !isNaN(Number(data.latitude))) {
      payload.latitude = Number(data.latitude);
    }
    if (data.longitude !== undefined && data.longitude !== null && !isNaN(Number(data.longitude))) {
      payload.longitude = Number(data.longitude);
    }
    if (data.staffId && data.staffId.trim() !== '') {
      payload.staffId = data.staffId;
    }
    if (initialData && data.type && data.type.trim() !== '') {
      payload.type = data.type;
    }

    if (initialData) {
      const updateFormData = new FormData();
      updateFormData.append('customer', JSON.stringify(payload));
      if (selectedImages.length > 0) {
        selectedImages.forEach((img) => {
          updateFormData.append('images', img.file);
        });
      }
      if (deletedImageIds.length > 0) {
        updateFormData.append('deleted_image_ids', JSON.stringify(deletedImageIds));
      }
      updateMutation({ id: initialData.id, data: updateFormData as any });
    } else {
      const formData = new FormData();
      formData.append('customer', JSON.stringify(payload));
      if (selectedImages.length > 0) {
        selectedImages.forEach((img) => {
          formData.append('images', img.file);
        });
      }
      mutate(formData as any);
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
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 select-none">Tọa độ địa lý (GPS)</span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Vĩ độ (Latitude)"
                placeholder="VD: 21.028511"
                type="number"
                step="any"
                fullWidth
                {...register('latitude', {
                  setValueAs: (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
                })}
                error={errors.latitude?.message}
              />
              <Input
                label="Kinh độ (Longitude)"
                placeholder="VD: 105.854444"
                type="number"
                step="any"
                fullWidth
                {...register('longitude', {
                  setValueAs: (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
                })}
                error={errors.longitude?.message}
              />
            </div>
          </div>
          {canAssignStaff && (
            <Select
              label="Nhân viên phụ trách"
              options={staffOptions}
              placeholder={isLoadingUsers ? 'Đang tải danh sách nhân viên...' : 'Chọn nhân viên phụ trách'}
              fullWidth
              disabled={isLoadingUsers}
              value={watch('staffId') || ''}
              {...register('staffId')}
              error={errors.staffId?.message}
            />
          )}
          {initialData && (
            <Select
              label="Loại khách hàng"
              options={CUSTOMER_TYPE_OPTIONS}
              placeholder="Chọn loại khách hàng"
              fullWidth
              disabled={updateIsPending}
              value={watch('type') || ''}
              {...register('type')}
              error={errors.type?.message}
            />
          )}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-700 select-none">Hình ảnh đính kèm (Cho phép chọn nhiều, tối đa 20MB/ảnh)</span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  disabled={isPending || updateIsPending}
                  multiple
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending || updateIsPending}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Chọn ảnh
                </Button>
              </div>

              {existingImages.length > 0 && (
                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 select-none">Hình ảnh đã tải lên ({existingImages.length})</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isPending || updateIsPending}
                        onClick={() => {
                          const allExistingIds = existingImages.map((img) => img.id);
                          setDeletedImageIds((prev) => [...prev, ...allExistingIds]);
                          setExistingImages([]);
                          setShowAllExistingImages(false);
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline disabled:text-rose-350 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                      >
                        Xóa toàn bộ hình ảnh
                      </button>
                      {showAllExistingImages && existingImages.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setShowAllExistingImages(false)}
                          className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
                        >
                          Thu gọn
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(showAllExistingImages ? existingImages : existingImages.slice(0, 4)).map((img, index) => {
                      const isLastItemAndHasMore = !showAllExistingImages && existingImages.length > 4 && index === 3;
                      if (isLastItemAndHasMore) {
                        return (
                          <div
                            key={img.id}
                            onClick={() => setShowAllExistingImages(true)}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group shrink-0"
                          >
                            <img
                              src={img.url || img.preview || undefined}
                              alt="Preview"
                              className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-200 bg-gray-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-sm">
                              +{existingImages.length - 3}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={img.id} className="relative w-16 h-16 rounded-lg border border-slate-200 group shrink-0">
                          <div className="w-full h-full rounded-lg overflow-hidden relative bg-gray-50">
                            <img src={img.url || img.preview || undefined} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={isPending || updateIsPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveExistingImage(img.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full w-5 h-5 p-0 flex items-center justify-center transition-colors cursor-pointer shadow-xs z-10 min-w-0 disabled:cursor-not-allowed"
                            title="Xóa ảnh"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedImages.length > 0 && (
                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 select-none">Hình ảnh đính kèm ({selectedImages.length})</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isPending || updateIsPending}
                        onClick={() => {
                          selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
                          setSelectedImages([]);
                          setShowAllImages(false);
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline disabled:text-rose-350 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                      >
                        Xóa toàn bộ hình ảnh
                      </button>
                      {showAllImages && selectedImages.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setShowAllImages(false)}
                          className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
                        >
                          Thu gọn
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(showAllImages ? selectedImages : selectedImages.slice(0, 4)).map((img, index) => {
                      const isLastItemAndHasMore = !showAllImages && selectedImages.length > 4 && index === 3;
                      if (isLastItemAndHasMore) {
                        return (
                          <div
                            key={img.id}
                            onClick={() => setShowAllImages(true)}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group shrink-0"
                          >
                            <img
                              src={img.preview || undefined}
                              alt="Preview"
                              className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-sm">
                              +{selectedImages.length - 3}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={img.id} className="relative w-16 h-16 rounded-lg border border-slate-200 group shrink-0">
                          <div className="w-full h-full rounded-lg overflow-hidden relative">
                            <img src={img.preview || undefined} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={isPending || updateIsPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(img.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full w-5 h-5 p-0 flex items-center justify-center transition-colors cursor-pointer shadow-xs z-10 min-w-0 disabled:cursor-not-allowed"
                            title="Xóa ảnh"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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

export function CustomerDeleteModal({ isOpen, onClose, customerName, onConfirm, isPending = false }: CustomerDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa khách hàng" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa khách hàng <strong className="text-gray-900 font-semibold">{customerName}</strong>?
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
