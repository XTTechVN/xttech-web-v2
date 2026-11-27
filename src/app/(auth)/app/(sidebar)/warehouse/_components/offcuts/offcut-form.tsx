'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createWarehouseOffcut, getBrandColors } from '@/actions';
import { Input } from '@/components';
import { Select } from '@/components-remake';
import type { WarehouseItem } from '@/types';
import { showErrorToast } from '@/utils';
import { refreshWarehouse } from '../format';

export const OFFCUT_FORM_ID = 'offcut-form';
const MIN_LENGTH = 1000;

interface Props {
  profileItems: WarehouseItem[];
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

// Thu hồi một thanh nhôm thừa từ 1.000 mm trở lên vào kho tái sử dụng
export function OffcutForm({ profileItems, onDone, onPendingChange }: Props) {
  const [itemSel, setItemSel] = useState('');
  const [colorSel, setColorSel] = useState('');
  const [length, setLength] = useState('1500');
  const [location, setLocation] = useState('Kệ nhôm thừa A1');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const colors = useQuery({
    queryKey: ['warehouse', 'brand-colors'],
    queryFn: () => getBrandColors({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  // Mặc định lấy mặt hàng đầu; màu theo mặt hàng đã chọn, nếu chưa có thì màu đầu danh mục
  const item = profileItems.find((p) => String(p.id) === itemSel) ?? profileItems[0];
  const colorId = colorSel || String(item?.colorId ?? colors.data?.items?.[0]?.id ?? '');
  const colorOptions = (colors.data?.items ?? []).map((c) => ({ value: String(c.id), label: c.name, hint: c.code }));
  if (item?.colorId && !colorOptions.some((o) => o.value === String(item.colorId))) {
    colorOptions.push({ value: String(item.colorId), label: item.colorName || `Màu #${item.colorId}`, hint: '' });
  }

  const save = useMutation({
    mutationFn: () =>
      createWarehouseOffcut({
        profileBarId: item!.profileBarId!,
        colorId: Number(colorId),
        lengthMm: Number(length),
        location: location.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      refreshWarehouse();
      toast.success(`Đã thu hồi thanh nhôm thừa ${Number(length)} mm`);
      onDone();
    },
    onError: (e) => showErrorToast(e, 'Không thể thu hồi nhôm thừa'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!item?.profileBarId) next.item = 'Vui lòng chọn mặt hàng nhôm có mã profile';
    if (!colorId) next.color = 'Vui lòng chọn màu nhôm';
    if (!(Number(length) >= MIN_LENGTH)) next.length = 'Chỉ thu hồi thanh từ 1.000 mm trở lên';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={OFFCUT_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Select
          side
          label="Mặt hàng nhôm gốc *"
          value={String(item?.id ?? '')}
          options={profileItems.map((p) => ({ value: String(p.id), label: p.itemName, hint: p.itemCode }))}
          onChange={(v) => {
            setItemSel(v);
            setColorSel('');
            touch('item');
          }}
          placeholder="Kho chưa có mặt hàng nhôm"
        />
        {errors.item && <p className="text-xs text-red-600">{errors.item}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <Select
          side
          label="Màu nhôm *"
          value={colorId}
          options={colorOptions}
          onChange={(v) => {
            setColorSel(v);
            touch('color');
          }}
          loading={colors.isLoading}
        />
        {errors.color && <p className="text-xs text-red-600">{errors.color}</p>}
      </div>
      <Input
        label="Chiều dài đoạn thừa (mm) *"
        type="number"
        inputMode="numeric"
        min={MIN_LENGTH}
        fullWidth
        value={length}
        error={errors.length}
        onChange={(e) => {
          setLength(e.target.value);
          touch('length');
        }}
      />
      <Input label="Vị trí kệ" placeholder="Ví dụ: Kệ A1" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} />
      <Input label="Ghi chú" placeholder="Ví dụ: Cắt thừa từ lệnh sản xuất 04" fullWidth value={note} onChange={(e) => setNote(e.target.value)} />
    </form>
  );
}
