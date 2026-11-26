'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBrandColor, updateBrandColor } from '@/actions';
import { Input } from '@/components';
import { Chip, Select } from '@/components-remake';
import type { BrandColor } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { SURFACE_TYPES } from './format';

export const COLOR_FORM_ID = 'brand-color-form';

const PRESETS = [
  ['#FFFFFF', 'Trắng tinh khiết'],
  ['#F5F5F7', 'Trắng sứ'],
  ['#D8CFC4', 'Champagne ánh bạc'],
  ['#C4B6A6', 'Anode bạc'],
  ['#B89758', 'Vàng champagne'],
  ['#D4AF37', 'Vàng gold'],
  ['#70757A', 'Ghi nhạt'],
  ['#4E4F54', 'Xám sần metallic'],
  ['#3A3B3C', 'Xám đậm'],
  ['#1F1F1F', 'Đen tuyền anode'],
  ['#000000', 'Đen bóng'],
  ['#4A3525', 'Nâu cà phê'],
  ['#5A3825', 'Nâu kim sa'],
  ['#6B4423', 'Nâu đồng'],
  ['#B5804C', 'Vân gỗ sồi'],
  ['#4A2E18', 'Vân gỗ óc chó'],
];
const LIGHT = new Set(['#FFFFFF', '#F5F5F7', '#D8CFC4']);
const HEX = /^#[0-9a-f]{6}$/i;

interface Props {
  brandId: number;
  /** Có = sửa; không có = thêm màu mới */
  initial?: BrandColor;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

export function ColorForm({ brandId, initial, onDone, onPendingChange }: Props) {
  const [hex, setHex] = useState((initial?.colorHex || '#333333').toUpperCase());
  const [code, setCode] = useState(initial?.code ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [surface, setSurface] = useState(initial?.surfaceType || 'powder_coat');
  const [price, setPrice] = useState(String(initial?.pricePerKg ?? 0));
  const [multiplier, setMultiplier] = useState(String(initial?.priceMultiplier ?? 1));
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [active, setActive] = useState(initial ? initial.isActive !== false : true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const save = useMutation({
    mutationFn: () => {
      const data = {
        brandId,
        code: code.trim(),
        name: name.trim(),
        colorHex: hex,
        surfaceType: surface,
        pricePerKg: Number(price) || 0,
        priceMultiplier: Number(multiplier) || 1,
        isDefault,
        isActive: active,
      };
      return initial ? updateBrandColor(initial.id, data) : createBrandColor(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-colors'] });
      toast.success(initial ? 'Đã cập nhật màu' : 'Đã thêm màu');
      onDone();
    },
    onError: (e) => showErrorToast(e, 'Không thể lưu màu'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!HEX.test(hex)) next.hex = 'Mã màu dạng #RRGGBB';
    if (!code.trim()) next.code = 'Vui lòng nhập mã màu';
    if (!name.trim()) next.name = 'Vui lòng nhập tên màu';
    if (Number(price) < 0) next.price = 'Đơn giá không được âm';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={COLOR_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <input
            type="color"
            aria-label="Chọn màu"
            value={HEX.test(hex) ? hex : '#333333'}
            onChange={(e) => {
              setHex(e.target.value.toUpperCase());
              touch('hex');
            }}
            className="h-11 w-12 flex-none cursor-pointer rounded-control border border-slate-200 bg-white p-1 md:h-10"
          />
          <div className="min-w-0 flex-1">
            <Input
              label="Mã màu HEX *"
              placeholder="#5A3825"
              fullWidth
              value={hex}
              error={errors.hex}
              onChange={(e) => {
                setHex(e.target.value.toUpperCase());
                touch('hex');
              }}
            />
          </div>
        </div>
        <ul className="grid grid-cols-[repeat(8,minmax(0,1fr))] gap-1.5" aria-label="Màu thông dụng">
          {PRESETS.map(([value, label]) => (
            <li key={value}>
              <button
                type="button"
                aria-label={label}
                title={label}
                onClick={() => {
                  setHex(value);
                  if (!name.trim()) setName(label);
                  touch('hex');
                }}
                style={{ backgroundColor: value }}
                className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-control border border-slate-300 transition active:scale-95"
              >
                {hex === value && <Check size={14} className={LIGHT.has(value) ? 'text-slate-800' : 'text-white'} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <Input
          label="Mã màu *"
          placeholder="XAM_XINGFA"
          fullWidth
          value={code}
          error={errors.code}
          onChange={(e) => {
            setCode(e.target.value);
            touch('code');
          }}
        />
        <Input
          label="Tên màu *"
          placeholder="Xám ghi ánh kim"
          fullWidth
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            touch('name');
          }}
        />
      </div>
      <Select side label="Bề mặt xử lý" value={surface} options={SURFACE_TYPES} onChange={setSurface} />
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <Input
          label="Đơn giá (đ/kg)"
          type="number"
          inputMode="numeric"
          fullWidth
          value={price}
          error={errors.price}
          onChange={(e) => {
            setPrice(e.target.value);
            touch('price');
          }}
        />
        <Input
          label="Hệ số giá"
          type="number"
          inputMode="decimal"
          step="0.05"
          fullWidth
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
        <Chip selected={isDefault} onClick={() => setIsDefault((v) => !v)}>
          Màu mặc định
        </Chip>
        <Chip selected={active} onClick={() => setActive((v) => !v)}>
          Đang dùng
        </Chip>
      </div>
    </form>
  );
}
