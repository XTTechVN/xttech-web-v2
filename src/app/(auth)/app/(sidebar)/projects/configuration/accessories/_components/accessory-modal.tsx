'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createAccessory, updateAccessory, getAccessoryCategories } from '@/actions';
import type { Accessory, AccessoryCreate, AccessoryUpdate, Brand, AccessoryCategory } from '@/types';

interface AccessoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessory?: Accessory | null;
  brands: Brand[];
  defaultBrandId: number | null;
}

const UNIT_OPTIONS = [
  { value: 'set', label: 'Bộ (Set)' },
  { value: 'pcs', label: 'Cái (Pcs)' },
  { value: 'unit', label: 'Chiếc (Unit)' },
  { value: 'pair', label: 'Đôi / Cặp (Pair)' },
  { value: 'roll', label: 'Cuộn (Roll)' },
  { value: 'box', label: 'Hộp (Box)' },
  { value: 'meter', label: 'Mét (Meter)' },
  { value: 'sheet', label: 'Tấm (Sheet)' },
];

const COLOR_OPTIONS = [
  { value: 'silver', label: 'Bạc ánh kim / Silver' },
  { value: 'black', label: 'Đen tuyền / Black' },
  { value: 'white', label: 'Trắng sứ / White' },
  { value: 'gold', label: 'Vàng Champagne / Gold' },
  { value: 'grey', label: 'Xám ghi / Grey' },
  { value: 'brown', label: 'Nâu cafe / Brown' },
  { value: 'other', label: 'Khác / Other' },
];

export function AccessoryModal({
  isOpen,
  onClose,
  accessory,
  brands,
  defaultBrandId,
}: AccessoryModalProps) {
  const isEdit = Boolean(accessory);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AccessoryCreate>({
    defaultValues: {
      brandId: defaultBrandId || 0,
      categoryId: undefined,
      code: '',
      name: '',
      specification: '',
      unit: 'pcs',
      color: 'silver',
      unitPrice: 0,
      costPrice: 0,
      retailPrice: 0,
      salePrice: 0,
      isActive: true,
    },
  });

  // Queries danh mục phụ kiện
  const { data: categoriesData } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => await getAccessoryCategories({ limit: 9999, offset: 0, allowDeleted: false }),
    enabled: isOpen,
  });

  const categories = React.useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    if (Array.isArray((categoriesData as { items?: AccessoryCategory[] }).items)) {
      return (categoriesData as { items: AccessoryCategory[] }).items;
    }
    return [];
  }, [categoriesData]);

  useEffect(() => {
    if (!isOpen) return;

    if (accessory) {
      reset({
        brandId: accessory.brandId ?? defaultBrandId ?? 0,
        categoryId: accessory.categoryId ?? undefined,
        code: accessory.code || '',
        name: accessory.name || '',
        specification: accessory.specification || '',
        unit: accessory.unit || 'pcs',
        color: accessory.color || 'silver',
        unitPrice: accessory.unitPrice ?? accessory.salePrice ?? 0,
        costPrice: accessory.costPrice ?? 0,
        retailPrice: accessory.retailPrice ?? 0,
        salePrice: accessory.salePrice ?? accessory.unitPrice ?? 0,
        isActive: accessory.isActive,
      });
    } else {
      reset({
        brandId: defaultBrandId || (brands[0]?.id ?? 0),
        categoryId: categories[0]?.id,
        code: '',
        name: '',
        specification: '',
        unit: 'pcs',
        color: 'silver',
        unitPrice: 0,
        costPrice: 0,
        retailPrice: 0,
        salePrice: 0,
        isActive: true,
      });
    }
  }, [isOpen, accessory, defaultBrandId]);

  // Mutations
  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (data: AccessoryCreate) => createAccessory({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Thêm phụ kiện thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi thêm phụ kiện mới'),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: AccessoryUpdate) => updateAccessory(accessory!.id, { data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Cập nhật phụ kiện thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật phụ kiện'),
  });

  const onSubmit = (data: AccessoryCreate) => {
    const price = Number(data.unitPrice) || 0;
    const payload = {
      ...data,
      brandId: Number(data.brandId),
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      unitPrice: price,
      salePrice: price,
      retailPrice: price,
      costPrice: Number(data.costPrice) || 0,
    };

    if (isEdit) {
      updateMutate(payload);
    } else {
      createMutate(payload);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Chỉnh sửa phụ kiện' : 'Thêm phụ kiện mới'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Hãng & Danh mục phụ kiện */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hãng phụ kiện <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('brandId', { required: 'Hãng phụ kiện là bắt buộc' })}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Danh mục phụ kiện
            </label>
            <select
              {...register('categoryId')}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              <option value="">-- Chưa chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mã & Tên phụ kiện */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Mã phụ kiện"
            placeholder="VD: BL-A30, BM001..."
            required
            {...register('code', { required: 'Mã phụ kiện là bắt buộc' })}
          />

          <Input
            label="Tên phụ kiện"
            placeholder="VD: Bản lề chữ A 12 inch..."
            required
            {...register('name', { required: 'Tên phụ kiện là bắt buộc' })}
          />
        </div>

        {/* Quy cách & Đơn vị tính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Quy cách / Chi tiết kỹ thuật"
            placeholder="VD: 12 inch, dày 2.5mm..."
            {...register('specification')}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đơn vị tính <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('unit', { required: 'Đơn vị tính là bắt buộc' })}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Màu sắc & Đơn giá */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Màu sắc
            </label>
            <select
              {...register('color')}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              {COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            step="1000"
            label="Đơn giá (VNĐ)"
            placeholder="VD: 85000"
            {...register('unitPrice')}
          />
        </div>

        {/* Giá vốn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            type="number"
            step="1000"
            label="Giá vốn / nhập (VNĐ)"
            placeholder="VD: 65000"
            {...register('costPrice')}
          />

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
              />
              <span className="font-semibold">Kích hoạt hoạt động phụ kiện này</span>
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isPending} className="px-5 font-semibold">
            {isEdit ? 'Lưu thay đổi' : 'Thêm phụ kiện'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
