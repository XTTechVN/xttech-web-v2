'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast, formatCurrency } from '@/utils';
import { createBrandColor, updateBrandColor } from '@/actions';
import type { BrandColor, BrandColorCreate, BrandColorUpdate } from '@/types';

interface BrandColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: number;
  brandColor?: BrandColor | null;
}

const SURFACE_TYPE_OPTIONS = [
  { value: 'powder_coat', label: 'Sơn tĩnh điện (Powder Coat)' },
  { value: 'anodize', label: 'Anodize / Xi mạ' },
  { value: 'wood_grain', label: 'Sơn vân gỗ (Wood Grain)' },
  { value: 'pvdf', label: 'Sơn PVDF cao cấp' },
  { value: 'other', label: 'Khác' },
];

const PRESET_COLORS = [
  { hex: '#FFFFFF', name: 'Trắng tinh khiết' },
  { hex: '#F5F5F7', name: 'Trắng sứ' },
  { hex: '#D8CFC4', name: 'Champagne ánh bạc' },
  { hex: '#C4B6A6', name: 'Xi mạ Anode Bạc' },
  { hex: '#B89758', name: 'Vàng Champagne' },
  { hex: '#D4AF37', name: 'Vàng Gold Hoàng Gia' },
  { hex: '#70757A', name: 'Ghi nhạt' },
  { hex: '#4E4F54', name: 'Xám sần Metallic' },
  { hex: '#3A3B3C', name: 'Xám đậm Xingfa' },
  { hex: '#1F1F1F', name: 'Đen tuyền Anode' },
  { hex: '#000000', name: 'Đen bóng' },
  { hex: '#4A3525', name: 'Nâu cafe ánh kim' },
  { hex: '#5A3825', name: 'Nâu kim sa cao cấp' },
  { hex: '#6B4423', name: 'Nâu đồng' },
  { hex: '#B5804C', name: 'Vân gỗ Sồi' },
  { hex: '#4A2E18', name: 'Vân gỗ Óc chó' },
];

export function BrandColorModal({
  isOpen,
  onClose,
  brandId,
  brandColor,
}: BrandColorModalProps) {
  const isEdit = Boolean(brandColor);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandColorCreate>({
    defaultValues: {
      brandId,
      code: '',
      name: '',
      colorHex: '#333333',
      surfaceType: 'powder_coat',
      pricePerKg: 0,
      priceMultiplier: 1,
      isDefault: false,
      isActive: true,
    },
  });

  const currentColorHex = watch('colorHex') || '#333333';

  useEffect(() => {
    if (!isOpen) return;

    if (brandColor) {
      reset({
        brandId: brandColor.brandId,
        code: brandColor.code,
        name: brandColor.name,
        colorHex: brandColor.colorHex || '#333333',
        surfaceType: brandColor.surfaceType || 'powder_coat',
        pricePerKg: brandColor.pricePerKg || 0,
        priceMultiplier: brandColor.priceMultiplier || 1,
        isDefault: brandColor.isDefault,
        isActive: brandColor.isActive,
      });
    } else {
      reset({
        brandId,
        code: '',
        name: '',
        colorHex: '#333333',
        surfaceType: 'powder_coat',
        pricePerKg: 0,
        priceMultiplier: 1,
        isDefault: false,
        isActive: true,
      });
    }
  }, [brandColor, brandId, reset, isOpen]);

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (data: BrandColorCreate) => createBrandColor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-colors', brandId] });
      toast.success('Thêm màu thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi thêm màu mới'),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: BrandColorUpdate) => updateBrandColor(brandColor!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-colors', brandId] });
      toast.success('Cập nhật màu thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật màu'),
  });

  const onSubmit = (data: BrandColorCreate) => {
    const payload = {
      ...data,
      brandId,
      pricePerKg: Number(data.pricePerKg) || 0,
      priceMultiplier: Number(data.priceMultiplier) || 1,
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
      size="md"
      title={isEdit ? 'Chỉnh sửa màu hãng' : 'Thêm màu mới cho hãng'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Bảng chọn màu sắc & Tùy chỉnh HEX */}
        <div className="flex flex-col gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã màu HEX & Bảng chọn màu <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={currentColorHex.startsWith('#') ? currentColorHex : `#${currentColorHex}`}
                onChange={(e) => setValue('colorHex', e.target.value.toUpperCase())}
                className="w-11 h-10 rounded-lg border border-slate-300 cursor-pointer p-1 bg-white hover:border-primary transition shrink-0 shadow-2xs"
                title="Bấm để mở bảng chọn màu"
              />
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="#5A3825"
                  required
                  {...register('colorHex', { required: 'Mã màu HEX là bắt buộc' })}
                  className="font-mono font-semibold uppercase"
                />
              </div>
            </div>
          </div>

          {/* Bảng màu mẫu thông dụng cho cửa & nhôm kính */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Mẫu màu thông dụng:</span>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = currentColorHex.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      setValue('colorHex', preset.hex.toUpperCase());
                      if (!watch('name')) {
                        setValue('name', preset.name);
                      }
                    }}
                    className={`group relative h-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-xs'
                        : 'border-slate-300 hover:scale-105 hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={`${preset.name} (${preset.hex})`}
                  >
                    {isSelected && (
                      <Check
                        size={13}
                        className={
                          preset.hex === '#FFFFFF' || preset.hex === '#F5F5F7' || preset.hex === '#D8CFC4'
                            ? 'text-slate-800'
                            : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                        }
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Mã màu"
            placeholder="VD: XAM_XINGFA, ANODE_DONG..."
            required
            {...register('code', { required: 'Mã màu là bắt buộc' })}
          />

          <Input
            label="Tên màu"
            placeholder="VD: Xám ghi ánh kim..."
            required
            {...register('name', { required: 'Tên màu là bắt buộc' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bề mặt xử lý
            </label>
            <select
              {...register('surfaceType')}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              {SURFACE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            step="1000"
            label="Đơn giá (VNĐ / kg)"
            placeholder="VD: 150000"
            {...register('pricePerKg')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            type="number"
            step="0.05"
            label="Hệ số giá (Price Multiplier)"
            placeholder="1.0"
            {...register('priceMultiplier')}
          />

          <div className="flex flex-col justify-center gap-2 pt-2 sm:pt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
              />
              <span className="font-semibold">Màu mặc định của hãng</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
              />
              <span className="font-medium">Kích hoạt màu này</span>
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isPending} className="px-5 font-semibold">
            {isEdit ? 'Lưu thay đổi' : 'Thêm màu mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
