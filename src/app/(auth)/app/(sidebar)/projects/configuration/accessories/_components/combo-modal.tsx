'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { Plus, Trash2, Layers, Calculator } from 'lucide-react';
import { SearchableSelect } from './searchable-select';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast, formatCurrency } from '@/utils';
import { createAccessoryCombo, updateAccessoryCombo, getAccessories } from '@/actions';
import type { Accessory, AccessoryCombo, AccessoryComboCreate } from '@/types';

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  combo?: AccessoryCombo | null;
  accessories?: Accessory[];
  brandId?: number | null;
}

export function ComboModal({ isOpen, onClose, combo, accessories: initialAccessories, brandId }: ComboModalProps) {
  const isEdit = Boolean(combo);

  const { data: fetchedAccessories } = useQuery({
    queryKey: ['all-accessories-dropdown', brandId],
    queryFn: async () => (await getAccessories({ limit: 9999, brandId: brandId || undefined })).items,
    enabled: isOpen,
  });

  const accessories = (initialAccessories && initialAccessories.length > 0)
    ? initialAccessories
    : (fetchedAccessories || []);

  const { register, control, handleSubmit, reset, setValue, watch } = useForm<AccessoryComboCreate>({
    defaultValues: {
      code: '',
      name: '',
      doorTypeId: null,
      applyFor: 'khung',
      openingType: null,
      comboItems: [],
      totalComboPrice: 0,
      isDefault: false,
      isActive: true,
    },
  });

  const applyFor = watch('applyFor');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'comboItems',
  });

  const comboItems = useWatch({ control, name: 'comboItems' });

  // Tự động tính tổng tiền dự kiến từ phụ kiện thành phần (không dùng useEffect để tránh re-render loop)
  const suggestedTotal = useMemo(() => {
    if (!comboItems || !comboItems.length || !accessories.length) return 0;
    return comboItems.reduce((sum, item) => {
      const acc = accessories.find((a) => a.id === Number(item?.accessoryId));
      const price = acc?.retailPrice || acc?.salePrice || 0;
      return sum + (Number(item?.quantity) || 1) * price;
    }, 0);
  }, [comboItems, accessories]);

  // Reset form khi combo thay đổi hoặc khi modal mở
  useEffect(() => {
    if (!isOpen) return;

    if (combo) {
      const items = combo.comboItems || [];
      reset({
        code: combo.code,
        name: combo.name,
        doorTypeId: combo.doorTypeId ?? null,
        applyFor: combo.applyFor ?? 'khung',
        openingType: combo.openingType ?? null,
        comboItems: items.length > 0
          ? items.map((item) => ({
              accessoryId: item.accessoryId ?? (accessories[0]?.id || 1),
              quantity: item.quantity || 1,
              note: item.note || '',
            }))
          : [{ accessoryId: accessories[0]?.id || 1, quantity: 1, note: '' }],
        totalComboPrice: Number(combo.totalComboPrice) || 0,
        isDefault: combo.isDefault ?? false,
        isActive: combo.isActive ?? true,
      });
    } else {
      reset({
        code: '',
        name: '',
        doorTypeId: null,
        applyFor: 'khung',
        openingType: null,
        comboItems: [{ accessoryId: accessories[0]?.id || 1, quantity: 1, note: '' }],
        totalComboPrice: 0,
        isDefault: false,
        isActive: true,
      });
    }
  }, [combo, isOpen, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AccessoryComboCreate) => {
      let finalPrice = Number(data.totalComboPrice);
      if ((!finalPrice || finalPrice <= 0) && suggestedTotal > 0) {
        finalPrice = suggestedTotal;
      }
      data.totalComboPrice = finalPrice;
      data.comboItems = (data.comboItems || []).map((item) => ({
        accessoryId: Number(item.accessoryId),
        quantity: Number(item.quantity || 1),
        note: item.note || '',
      }));
      const doorTypeId = data.doorTypeId ? Number(data.doorTypeId) : null;

      if (isEdit && combo) {
        return await updateAccessoryCombo(combo.id, { ...data, doorTypeId, brandId: brandId || combo.brandId || null });
      }
      return await createAccessoryCombo({ ...data, doorTypeId, brandId: brandId || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-combos'] });
      toast.success(isEdit ? 'Cập nhật gói combo thành công' : 'Thêm gói combo thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa gói combo phụ kiện' : 'Tạo gói combo phụ kiện mới'}
      size="lg"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Mã gói combo *"
            placeholder="VD: COMBO_CD_1C_KL"
            {...register('code', { required: true })}
          />
          <Input
            label="Tên thương mại gói *"
            placeholder="VD: Combo Cửa đi 1 cánh Kinlong"
            {...register('name', { required: true })}
          />
        </div>

        {/* Dành cho + Loại hướng mở */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dành cho</label>
            <select
              {...register('applyFor')}
              className="w-full h-9 px-2.5 border border-slate-200 rounded-md text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              <option value="khung">Khung cửa</option>
              <option value="canh">Cánh cửa</option>
              <option value="huong_mo">Hướng mở</option>
              <option value="khac">Khác</option>
            </select>
          </div>

          {applyFor === 'huong_mo' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kiểu mở cánh</label>
              <select
                {...register('openingType')}
                className="w-full h-9 px-2.5 border border-slate-200 rounded-md text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
              >
                <option value="">-- Chọn kiểu mở --</option>
                <option value="vach_co_dinh">Vách cố định</option>
                <option value="2_canh_mo">2 cánh mở</option>
                <option value="1_canh_quay_trai">1 cánh quay (trái)</option>
                <option value="1_canh_quay_phai">1 cánh quay (phải)</option>
                <option value="mo_hat_khong_song">Mở hát (không song)</option>
                <option value="mo_lat_khong_song">Mở lật (không song)</option>
                <option value="lat_xuong">Lật xuống</option>
                <option value="quay_va_lat">Quay &amp; Lật</option>
                <option value="canh_truot_luoi">Cánh trượt lưới</option>
                <option value="canh_truot_ngang">Cánh trượt ngang</option>
              </select>
            </div>
          )}
        </div>

        {/* Danh sách phụ kiện trong combo */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers size={15} />
              Chi tiết các món phụ kiện trong gói
            </span>
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Plus size={13} />}
              onClick={() => append({ accessoryId: accessories[0]?.id || 1, quantity: 1, note: '' })}
              type="button"
            >
              Thêm món
            </Button>
          </div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                <SearchableSelect
                  options={accessories.map((a) => ({
                    value: a.id,
                    label: `${a.name} (${a.code || 'N/A'}) - ${formatCurrency(a.retailPrice || a.salePrice || 0)}`,
                  }))}
                  value={Number(comboItems?.[idx]?.accessoryId) || accessories[0]?.id || 0}
                  onChange={(val) => setValue(`comboItems.${idx}.accessoryId`, Number(val))}
                  placeholder="Chọn phụ kiện..."
                  className="min-w-0 flex-1"
                />
                <div className="w-16 shrink-0">
                  <Input
                    type="number"
                    min={1}
                    placeholder="SL"
                    {...register(`comboItems.${idx}.quantity`, { required: true })}
                  />
                </div>
                <div className="w-32 shrink-0">
                  <Input
                    placeholder="Vị trí lắp"
                    title="VD: Bản lề trên, Tay nắm, Khóa sàn..."
                    {...register(`comboItems.${idx}.note`)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition cursor-pointer shrink-0"
                  title="Xóa món"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-3 border border-dashed border-slate-200 rounded-lg">
                Chưa có món phụ kiện nào. Nhấn "Thêm món" để bắt đầu.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div className="flex flex-col gap-1">
            <Input
              label="Tổng giá gói combo (VND) *"
              type="number"
              placeholder="VD: 1250000"
              {...register('totalComboPrice', { required: true })}
            />
            {suggestedTotal > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <Calculator size={12} className="text-slate-400" />
                  Tổng phụ kiện: <b className="text-emerald-600">{formatCurrency(suggestedTotal)}</b>
                </span>
                <button
                  type="button"
                  onClick={() => setValue('totalComboPrice', suggestedTotal)}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Lấy giá này
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isDefault"
              {...register('isDefault')}
              className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-xs font-semibold text-gray-700 cursor-pointer">
              Đặt làm combo mặc định cho loại cửa
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới combo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
