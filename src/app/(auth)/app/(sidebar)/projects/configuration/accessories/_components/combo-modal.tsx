'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { Plus, Trash2, Layers, Calculator } from 'lucide-react';
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
}

export function ComboModal({ isOpen, onClose, combo, accessories: initialAccessories }: ComboModalProps) {
  const isEdit = Boolean(combo);

  const { data: fetchedAccessories } = useQuery({
    queryKey: ['all-accessories-dropdown'],
    queryFn: async () => (await getAccessories({ limit: 9999 })).items,
    enabled: isOpen,
  });

  const accessories = (initialAccessories && initialAccessories.length > 0)
    ? initialAccessories
    : (fetchedAccessories || []);

  const { register, control, handleSubmit, reset, setValue } = useForm<AccessoryComboCreate>({
    defaultValues: {
      code: '',
      name: '',
      doorTypeId: null,
      comboItems: [],
      totalComboPrice: 0,
      isDefault: false,
      isActive: true,
    },
  });

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
        comboItems: [{ accessoryId: accessories[0]?.id || 1, quantity: 1, note: '' }],
        totalComboPrice: 0,
        isDefault: false,
        isActive: true,
      });
    }
  }, [combo, isOpen, reset, accessories]);

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

      if (isEdit && combo) {
        return await updateAccessoryCombo(combo.id, data);
      }
      return await createAccessoryCombo(data);
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

        {/* Danh sách phụ kiện trong combo */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers size={15} />
                Chi tiết các món phụ kiện trong gói
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Vị trí lắp: Ghi rõ vị trí lắp đặt trên cửa (VD: Bản lề trên/dưới, Tay nắm chính, Khóa sàn...)
              </p>
            </div>
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

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <select
                  {...register(`comboItems.${idx}.accessoryId`, { required: true })}
                  className="flex-1 h-9 px-2.5 border border-gray-200 rounded-md text-xs bg-white focus:outline-none focus:border-primary text-gray-800"
                >
                  {accessories.length === 0 && (
                    <option value="">Đang tải danh sách phụ kiện...</option>
                  )}
                  {accessories.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code || 'N/A'}) - {formatCurrency(a.retailPrice || a.salePrice || 0)}
                    </option>
                  ))}
                </select>
                <div className="w-20">
                  <Input
                    type="number"
                    min={1}
                    placeholder="SL"
                    {...register(`comboItems.${idx}.quantity`, { required: true })}
                  />
                </div>
                <div className="w-36">
                  <Input
                    placeholder="Ghi chú / Vị trí lắp"
                    title="Vị trí lắp đặt: VD Bản lề trên, Tay nắm, Khóa sàn..."
                    {...register(`comboItems.${idx}.note`)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition cursor-pointer"
                  title="Xóa món"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-xs text-gray-500 italic text-center py-2">
                Chưa có món phụ kiện nào trong gói
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div className="flex flex-col gap-1">
            <Input
              label="Tổng giá gói combo (VND) *"
              type="number"
              step="1000"
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
