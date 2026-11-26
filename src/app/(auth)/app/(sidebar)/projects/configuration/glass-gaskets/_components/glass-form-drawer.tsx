'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components';
import { Button, Chip, Drawer, DrawerBody, DrawerFooter, DrawerHeader, Select } from '@/components-remake';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createGlass, updateGlass } from '@/actions';
import type { Glass, GlassCreate, GlassCategory } from '@/types';
import { getCategoryMaterialType } from './glass-category-sidebar';

interface CategoryPreset {
  glassType: string;
  thicknessMm: number;
  weightPerM2: number;
  unitPrice?: number;
}

const CATEGORY_PRESET_MAP: Record<string, CategoryPreset> = {
  PANEL_ALU: { glassType: 'panel_alu', thicknessMm: 3.0, weightPerM2: 3.8, unitPrice: 380000 },
  LUOI_MUOI: { glassType: 'luoi_muoi', thicknessMm: 0.8, weightPerM2: 1.2, unitPrice: 180000 },
  NAN_CHOP: { glassType: 'nan_chop', thicknessMm: 1.2, weightPerM2: 2.8, unitPrice: 320000 },
  KINH_DAN_AN_TOAN: { glassType: 'dan_an_toan', thicknessMm: 6.38, weightPerM2: 15.5 },
  KINH_HOP: { glassType: 'kinh_hop', thicknessMm: 19.0, weightPerM2: 25.0 },
  TAM_TO_ONG: { glassType: 'tam_to_ong', thicknessMm: 10.0, weightPerM2: 4.5, unitPrice: 550000 },
  KINH_HOP_REM: { glassType: 'kinh_hop_rem', thicknessMm: 21.0, weightPerM2: 28.0, unitPrice: 1200000 },
  KINH_CUONG_LUC: { glassType: 'cuong_luc', thicknessMm: 8.0, weightPerM2: 20.0 },
};

const FIXED_WEIGHT_BY_GLASS_TYPE: Record<string, number> = {
  panel_alu: 3.8,
  luoi_muoi: 1.2,
  nan_chop: 2.8,
  tam_to_ong: 4.5,
  kinh_hop_rem: 28.0,
};

const MATERIAL_TYPE_DEFAULTS: Record<
  'glass' | 'panel' | 'screen_mesh',
  { glassType: string; thicknessMm: number; unitPrice: number; weightPerM2: number }
> = {
  glass: { glassType: 'cuong_luc', thicknessMm: 8.0, unitPrice: 250000, weightPerM2: 20.0 },
  panel: { glassType: 'panel_alu', thicknessMm: 3.0, unitPrice: 380000, weightPerM2: 3.8 },
  screen_mesh: { glassType: 'luoi_muoi', thicknessMm: 0.8, unitPrice: 180000, weightPerM2: 1.2 },
};

const MATERIAL_TABS = [
  { id: 'glass', label: 'Kính' },
  { id: 'panel', label: 'Tấm' },
  { id: 'screen_mesh', label: 'Lưới' },
] as const;

const GLASS_FORM_ID = 'glass-form';

export interface GlassFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  glass?: Glass | null;
  categories: GlassCategory[];
  defaultMaterialType?: 'glass' | 'panel' | 'screen_mesh';
  defaultCategoryId?: number;
}

export function GlassFormDrawer({ isOpen, onClose, glass, categories, defaultMaterialType = 'glass', defaultCategoryId }: GlassFormDrawerProps) {
  const isEdit = Boolean(glass);
  const [selectedMaterialType, setSelectedMaterialType] = useState<'glass' | 'panel' | 'screen_mesh'>(defaultMaterialType);

  const availableCategoriesForType = useMemo(
    () => categories.filter((c) => getCategoryMaterialType(c) === selectedMaterialType),
    [categories, selectedMaterialType],
  );

  const { register, handleSubmit, reset, watch, setValue } = useForm<GlassCreate>({
    defaultValues: {
      categoryId: defaultCategoryId || categories[0]?.id,
      code: '',
      name: '',
      glassType: 'cuong_luc',
      thicknessMm: 8.0,
      unitPrice: 250000,
      weightPerM2: 20.0,
      maxWidthMm: 2400,
      maxHeightMm: 3600,
      isActive: true,
    },
  });

  const currentGlassType = watch('glassType');
  const thicknessValue = watch('thicknessMm');
  const currentWeight = watch('weightPerM2');

  const handleCategoryChange = (catId: number) => {
    setValue('categoryId', catId);
    const cat = categories.find((c) => c.id === catId);
    const preset = cat ? CATEGORY_PRESET_MAP[cat.code] : undefined;
    if (!preset) return;

    setValue('glassType', preset.glassType);
    if (!isEdit) {
      setValue('thicknessMm', preset.thicknessMm);
      setValue('weightPerM2', preset.weightPerM2);
      if (preset.unitPrice) setValue('unitPrice', preset.unitPrice);
    }
  };

  const handleSelectMaterialType = (type: 'glass' | 'panel' | 'screen_mesh') => {
    setSelectedMaterialType(type);
    const matchedCats = categories.filter((c) => getCategoryMaterialType(c) === type);
    if (matchedCats.length > 0) handleCategoryChange(matchedCats[0].id);
    else setValue('glassType', MATERIAL_TYPE_DEFAULTS[type].glassType);
  };

  useEffect(() => {
    if (thicknessValue && (!currentWeight || currentWeight === 0)) {
      const fixedWeight = currentGlassType ? FIXED_WEIGHT_BY_GLASS_TYPE[currentGlassType] : undefined;
      setValue('weightPerM2', fixedWeight ?? Math.round(Number(thicknessValue) * 2.5 * 100) / 100);
    }
  }, [thicknessValue, currentWeight, currentGlassType, setValue]);

  useEffect(() => {
    if (glass) {
      const curCat = categories.find((c) => c.id === glass.categoryId);
      if (curCat) setSelectedMaterialType(getCategoryMaterialType(curCat));
      reset({
        categoryId: glass.categoryId,
        code: glass.code,
        name: glass.name,
        glassType: glass.glassType,
        thicknessMm: glass.thicknessMm,
        unitPrice: glass.unitPrice,
        weightPerM2: Number(glass.weightPerM2) || Math.round(glass.thicknessMm * 2.5 * 100) / 100,
        maxWidthMm: glass.maxWidthMm || 2400,
        maxHeightMm: glass.maxHeightMm || 3600,
        isActive: glass.isActive,
      });
      return;
    }

    const initialType = defaultMaterialType || 'glass';
    setSelectedMaterialType(initialType);
    const matchedCats = categories.filter((c) => getCategoryMaterialType(c) === initialType);
    const initialCatId =
      defaultCategoryId && matchedCats.some((c) => c.id === defaultCategoryId) ? defaultCategoryId : matchedCats[0]?.id || categories[0]?.id;
    const typeDefaults = MATERIAL_TYPE_DEFAULTS[initialType];

    reset({
      categoryId: initialCatId,
      code: '',
      name: '',
      glassType: typeDefaults.glassType,
      thicknessMm: typeDefaults.thicknessMm,
      unitPrice: typeDefaults.unitPrice,
      weightPerM2: typeDefaults.weightPerM2,
      maxWidthMm: 2400,
      maxHeightMm: 3600,
      isActive: true,
    });
  }, [glass, categories, reset, isOpen, defaultMaterialType, defaultCategoryId]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GlassCreate) => {
      const targetCatId = Number(data.categoryId) || availableCategoriesForType[0]?.id || categories[0]?.id;
      if (!targetCatId) throw new Error('Vui lòng tạo ít nhất 1 nhóm chủng loại thuộc loại này trước');

      data.categoryId = targetCatId;
      const targetCat = categories.find((c) => c.id === targetCatId);
      const preset = targetCat ? CATEGORY_PRESET_MAP[targetCat.code] : undefined;
      if (preset) data.glassType = preset.glassType;
      else if (!data.glassType) data.glassType = 'cuong_luc';

      data.thicknessMm = Number(data.thicknessMm);
      data.unitPrice = Number(data.unitPrice);
      data.weightPerM2 = Number(data.weightPerM2 ?? Math.round(data.thicknessMm * 2.5 * 100) / 100);
      data.maxWidthMm = data.maxWidthMm ? Number(data.maxWidthMm) : undefined;
      data.maxHeightMm = data.maxHeightMm ? Number(data.maxHeightMm) : undefined;

      if (isEdit && glass) return updateGlass(glass.id, data);
      return createGlass(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      toast.success(isEdit ? 'Cập nhật quy cách thành công' : 'Thêm quy cách mới thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  const materialTypeLabel = selectedMaterialType === 'glass' ? 'Kính' : selectedMaterialType === 'panel' ? 'Tấm' : 'Lưới';

  const title = isEdit ? 'Sửa quy cách vật tư' : 'Thêm quy cách vật tư';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label={title} width={560}>
      <DrawerHeader compact title={title} onClose={onClose} />
      <DrawerBody>
        <form id={GLASS_FORM_ID} onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4 py-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Loại vật tư chính *</p>
            <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
              {MATERIAL_TABS.map((t) => (
                <Chip key={t.id} selected={selectedMaterialType === t.id} onClick={() => handleSelectMaterialType(t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>

          {availableCategoriesForType.length > 0 ? (
            <Select
              side
              label={`Chủng loại (${materialTypeLabel}) *`}
              value={String(watch('categoryId') || availableCategoriesForType[0]?.id || '')}
              options={availableCategoriesForType.map((c) => ({ value: String(c.id), label: c.name, hint: c.code }))}
              onChange={(v) => handleCategoryChange(Number(v))}
            />
          ) : (
            <p className="rounded-control bg-amber-50 p-3 text-sm text-amber-800">Chưa có nhóm chủng loại nào cho loại này.</p>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="Mã hiệu *" placeholder="VD: T_8MM_CL" {...register('code', { required: true })} />
            <Input label="Tên quy cách *" placeholder="VD: Kính trắng 8mm CL" {...register('name', { required: true })} />
            <Input label="Độ dày (mm) *" type="number" step="0.01" placeholder="8.0" {...register('thicknessMm', { required: true })} />
            <Input label="Đơn giá (đ/m²) *" type="number" step="1000" placeholder="250000" {...register('unitPrice', { required: true })} />
            <Input label="Khối lượng (kg/m²)" type="number" step="0.01" placeholder="20.0" {...register('weightPerM2')} />
          </div>
          <p className="text-xs text-slate-500">Khối lượng tự gợi ý theo loại vật liệu (kính: độ dày × 2.5).</p>
        </form>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={GLASS_FORM_ID} className="flex-1 md:flex-none" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
