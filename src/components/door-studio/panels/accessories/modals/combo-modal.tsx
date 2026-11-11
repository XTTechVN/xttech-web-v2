'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Modal } from '@/components/modal';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Select } from '@/components/select';
import { Calculator, Check } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast, formatCurrency } from '@/utils';
import { createAccessoryCombo, updateAccessoryCombo, getAccessories, getBrands } from '@/actions';
import {
  normalizeDoorType,
  type Accessory,
  type AccessoryCombo,
  type AccessoryComboCreate,
} from '@/types';
import {
  APPLY_FOR_OPTIONS,
  DEFAULT_VALUES,
  DOOR_TYPE_OPTIONS,
  OPENING_TYPE_OPTIONS,
  buildAccessoryOptions,
  buildAccessoryPriceMap,
  buildComboSubmitPayload,
  resolveComboItemsForForm,
} from './combo-modal.constants';
import { ComboItemsEditor } from './combo-items-editor';

export interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  combo?: AccessoryCombo | null;
  isCopy?: boolean;
  accessories?: Accessory[];
  brandId?: number | null;
  defaultApplyFor?: 'khung' | 'canh' | 'huong_mo' | 'khac';
  onCreated?: (combo: AccessoryCombo) => void;
}

export function ComboModal({
  isOpen,
  onClose,
  combo,
  isCopy = false,
  accessories: initialAccessories,
  brandId,
  defaultApplyFor = 'khung',
  onCreated,
}: ComboModalProps) {
  const isEdit = Boolean(combo && !isCopy);
  const { register, control, handleSubmit, reset, setValue, watch } = useForm<AccessoryComboCreate>({
    defaultValues: DEFAULT_VALUES,
  });

  const applyFor = watch('applyFor');
  const openingType = watch('openingType');
  const formBrandId = watch('brandId');
  const selectedDoorTypes = watch('doorTypes') || [];
  const effectiveBrandId =
    formBrandId !== undefined
      ? (formBrandId ? Number(formBrandId) : null)
      : (brandId || null);

  const handleToggleDoorType = (doorTypeVal: string) => {
    const current = Array.isArray(selectedDoorTypes) ? selectedDoorTypes : [];
    const next = current.includes(doorTypeVal)
      ? current.filter((item) => item !== doorTypeVal)
      : [...current, doorTypeVal];
    setValue('doorTypes', next, { shouldDirty: true });
  };

  const { data: accessoryBrandsData } = useQuery({
    queryKey: ['brands', 'accessory'],
    queryFn: async () => {
      const res = await getBrands({ limit: 9999, offset: 0, allowDeleted: false, brandType: 'accessory' });
      if (res.items && res.items.length > 0) return res.items;
      const allRes = await getBrands({ limit: 9999, offset: 0, allowDeleted: false });
      return allRes.items || [];
    },
    enabled: isOpen,
  });

  const brandOptions = useMemo(() => {
    const list = accessoryBrandsData ?? [];
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [accessoryBrandsData]);

  const { data: fetchedAccessories } = useQuery({
    queryKey: ['all-accessories-dropdown', effectiveBrandId],
    queryFn: async () => (await getAccessories({ limit: 9999, brandId: effectiveBrandId || undefined })).items,
    enabled: isOpen,
  });

  const accessories = useMemo(() => {
    if (fetchedAccessories && fetchedAccessories.length > 0) return fetchedAccessories;
    if (initialAccessories && initialAccessories.length > 0) {
      if (effectiveBrandId) {
        const byBrand = initialAccessories.filter((a) => a.brandId === effectiveBrandId);
        if (byBrand.length > 0) return byBrand;
      }
      return initialAccessories;
    }
    return [];
  }, [initialAccessories, fetchedAccessories, effectiveBrandId]);

  const accessoryPriceMap = useMemo(() => buildAccessoryPriceMap(accessories, combo), [accessories, combo]);
  const accessoryOptions = useMemo(() => buildAccessoryOptions(accessories, combo), [accessories, combo]);

  const { fields, append, remove } = useFieldArray({ control, name: 'comboItems' });
  const comboItems = useWatch({ control, name: 'comboItems' });

  const suggestedTotal = useMemo(() => {
    if (!comboItems?.length || !accessoryPriceMap.size) return 0;
    return comboItems.reduce((sum, item) => {
      const price = accessoryPriceMap.get(Number(item?.accessoryId)) ?? 0;
      return sum + (Number(item?.quantity) || 1) * price;
    }, 0);
  }, [comboItems, accessoryPriceMap]);

  useEffect(() => {
    if (!isOpen) return;
    if (combo) {
      const normalizedTypes = Array.from(
        new Set((combo.doorTypes || []).map((t) => normalizeDoorType(t)).filter(Boolean)),
      );
      reset({
        code: isCopy ? `${combo.code}_COPY` : combo.code,
        name: isCopy ? `${combo.name} (Bản sao)` : combo.name,
        doorTypeId: combo.doorTypeId ?? null,
        doorTypes: normalizedTypes,
        applyFor: combo.applyFor ?? 'khung',
        openingType: combo.openingType ?? null,
        description: combo.description ?? '',
        brandId: combo.brandId ?? brandId ?? null,
        comboItems: resolveComboItemsForForm(combo.comboItems, accessories),
        totalComboPrice: Number(combo.totalComboPrice) || 0,
        isDefault: isCopy ? false : (combo.isDefault ?? false),
        isActive: combo.isActive ?? true,
      });
    } else {
      reset({
        ...DEFAULT_VALUES,
        applyFor: defaultApplyFor,
        brandId: brandId ?? brandOptions[0]?.id ?? null,
        comboItems: [{ accessoryId: 0, quantity: 1, note: '' }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo, isCopy, isOpen, reset, defaultApplyFor, brandId]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AccessoryComboCreate) => {
      const payload = buildComboSubmitPayload(data, suggestedTotal, accessories, combo, brandId);
      return isEdit && combo ? updateAccessoryCombo(combo.id, payload) : createAccessoryCombo(payload);
    },
    onSuccess: (savedCombo) => {
      queryClient.invalidateQueries({ queryKey: ['accessory-combos'] });
      queryClient.invalidateQueries({ queryKey: ['accessory-combos-list'] });
      toast.success(isEdit ? 'Cập nhật gói combo thành công' : isCopy ? 'Sao chép gói combo thành công' : 'Thêm gói combo thành công');
      if (!isEdit && savedCombo) onCreated?.(savedCombo);
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  const modalTitle = isEdit ? 'Sửa gói combo phụ kiện' : isCopy ? 'Sao chép gói combo phụ kiện' : 'Tạo gói combo phụ kiện mới';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Mã gói combo *" placeholder="VD: COMBO_CD_1C_KL" {...register('code', { required: true })} />
          <Input label="Tên thương mại gói *" placeholder="VD: Combo Cửa đi 1 cánh Kinlong" {...register('name', { required: true })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hãng phụ kiện</label>
            <Select
              fullWidth
              value={formBrandId != null ? String(formBrandId) : ''}
              onChange={(e) => setValue('brandId', e.target.value ? Number(e.target.value) : null, { shouldDirty: true })}
              options={[
                { value: '', label: '-- Tất cả / Chưa chọn hãng --' },
                ...brandOptions.map((b) => ({ value: String(b.id), label: `${b.name} (${b.code})` })),
              ]}
              placeholder="-- Tất cả / Chưa chọn hãng --"
              className="h-9 text-xs md:text-xs bg-slate-50 border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dành cho</label>
            <Select
              fullWidth
              value={applyFor || 'khung'}
              onChange={(e) => setValue('applyFor', e.target.value as 'khung' | 'canh' | 'huong_mo' | 'khac', { shouldDirty: true })}
              options={APPLY_FOR_OPTIONS}
              className="h-9 text-xs md:text-xs bg-slate-50 border-slate-200"
            />
          </div>

          {applyFor === 'huong_mo' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kiểu mở cánh</label>
              <Select
                fullWidth
                value={openingType || ''}
                onChange={(e) => setValue('openingType', e.target.value || null, { shouldDirty: true })}
                options={OPENING_TYPE_OPTIONS}
                placeholder="-- Chọn kiểu mở --"
                className="h-9 text-xs md:text-xs bg-slate-50 border-slate-200"
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Loại cửa áp dụng <span className="font-normal text-slate-400">(có thể chọn nhiều loại cửa)</span>
            </label>
            {selectedDoorTypes.length > 0 && (
              <button type="button" onClick={() => setValue('doorTypes', [], { shouldDirty: true })} className="text-[11px] text-rose-500 hover:underline cursor-pointer">
                Bỏ chọn tất cả ({selectedDoorTypes.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DOOR_TYPE_OPTIONS.map((opt) => {
              const isSelected = selectedDoorTypes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleToggleDoorType(opt.value)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected ? 'bg-primary/10 text-primary border-primary font-semibold shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {isSelected && <Check size={12} className="shrink-0" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả gói combo</label>
          <textarea
            rows={2}
            placeholder="VD: Dùng cho cửa đi 1 cánh hoặc 2 cánh hệ 55, đồng bộ bản lề 4D + khóa đa điểm..."
            {...register('description')}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition resize-none"
          />
        </div>

        <ComboItemsEditor
          fields={fields}
          comboItems={comboItems}
          accessoryOptions={accessoryOptions}
          register={register}
          setValue={setValue}
          onAppend={() => append({ accessoryId: 0, quantity: 1, note: '' })}
          onRemove={remove}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div className="flex flex-col gap-1">
            <Input label="Tổng giá gói combo (VND) *" type="number" placeholder="VD: 1250000" {...register('totalComboPrice', { required: true })} />
            {suggestedTotal > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <Calculator size={12} className="text-slate-400" />
                  Tổng phụ kiện: <b className="text-emerald-600">{formatCurrency(suggestedTotal)}</b>
                </span>
                <button type="button" onClick={() => setValue('totalComboPrice', suggestedTotal)} className="text-primary hover:underline font-semibold cursor-pointer">
                  Lấy giá này
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="isDefault" {...register('isDefault')} className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer" />
            <label htmlFor="isDefault" className="text-xs font-semibold text-gray-700 cursor-pointer">
              Đặt làm combo mặc định cho loại cửa
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">Hủy</Button>
          <Button variant="primary" type="submit" loading={isPending}>{isEdit ? 'Lưu thay đổi' : 'Tạo mới combo'}</Button>
        </div>
      </form>
    </Modal>
  );
}
