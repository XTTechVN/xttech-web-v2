'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createWarehouseItem, getAccessories, getBrandColors, getBrands, getProfileBars, updateWarehouseItem } from '@/actions';
import { Input } from '@/components';
import { Chip, Select } from '@/components-remake';
import type { WarehouseItem, WarehouseItemType } from '@/types';
import { showErrorToast } from '@/utils';
import { STANDARD_UNIT_OPTIONS, toBackendUnit, toDisplayUnit } from '../../_utils/unit-mapping';
import { num, refreshWarehouse } from '../format';

export const ITEM_FORM_ID = 'item-form';

const STALE = 5 * 60 * 1000;
const TYPES: { value: WarehouseItemType; label: string; unit: string }[] = [
  { value: 'profile', label: 'Nhôm thanh', unit: 'Cây' },
  { value: 'accessory', label: 'Phụ kiện', unit: 'Bộ' },
  { value: 'consumable', label: 'Vật tư phụ', unit: 'Cái' },
];

interface Props {
  /** Có = sửa thông tin cơ bản; không có = thêm mặt hàng mới */
  initial?: WarehouseItem;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

// Chọn id đang có trong danh sách, nếu không thì lấy dòng đầu
const pick = <T extends { id: number }>(list: T[] | undefined, sel: string, prefer?: (x: T) => boolean) =>
  list?.find((x) => String(x.id) === sel) ?? (prefer && list?.find(prefer)) ?? list?.[0];

// Thêm mặt hàng: chọn từ thư viện (mã, tên, đơn vị, giá tự điền) hoặc nhập tay. Sửa: chỉ đổi thông tin cơ bản.
export function ItemForm({ initial, onDone, onPendingChange }: Props) {
  const edit = !!initial;
  const [type, setType] = useState<WarehouseItemType>(initial?.itemType ?? 'profile');
  const [fromLibrary, setFromLibrary] = useState(!edit);
  const [code, setCode] = useState(initial?.itemCode ?? '');
  const [name, setName] = useState(initial?.itemName ?? '');
  const [unit, setUnit] = useState(initial ? toDisplayUnit(initial.unit) : 'Cây');
  const [length, setLength] = useState(String(initial?.standardLengthMm || 6000));
  const [cost, setCost] = useState(String(initial?.costPrice ?? 0));
  const [minStock, setMinStock] = useState(String(initial?.minStockLevel ?? 5));
  const [stock, setStock] = useState('0');
  const [location, setLocation] = useState(initial?.location ?? (edit ? '' : 'Giá A1'));
  const [sel, setSel] = useState({ brand: '', profile: '', color: '', accessory: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));
  const lib = !edit && fromLibrary && type !== 'consumable';

  const brands = useQuery({ queryKey: ['warehouse', 'lib', 'brands'], queryFn: () => getBrands({ limit: 100 }), enabled: lib, staleTime: STALE });
  const accessories = useQuery({
    queryKey: ['warehouse', 'lib', 'accessories'],
    queryFn: () => getAccessories({ limit: 200 }),
    enabled: lib && type === 'accessory',
    staleTime: STALE,
  });
  const brand = pick(brands.data?.items, sel.brand);
  const profiles = useQuery({
    queryKey: ['warehouse', 'lib', 'profiles', brand?.id],
    queryFn: () => getProfileBars({ brandId: brand?.id, limit: 150 }),
    enabled: lib && type === 'profile' && !!brand,
    staleTime: STALE,
  });
  const colors = useQuery({
    queryKey: ['warehouse', 'lib', 'colors', brand?.id],
    queryFn: () => getBrandColors({ brandId: brand?.id, limit: 50 }),
    enabled: lib && type === 'profile' && !!brand,
    staleTime: STALE,
  });
  const profile = pick(profiles.data?.items, sel.profile);
  const color = pick(colors.data?.items, sel.color, (c) => c.isDefault);
  const accessory = pick(accessories.data?.items, sel.accessory);

  // Ở chế độ thư viện, các giá trị này được tính ra từ lựa chọn chứ không nhập
  let auto: { code: string; name: string; unit: string; length: string; cost: string } | null = null;
  if (lib && type === 'profile' && profile) {
    const price = color?.pricePerKg && color.pricePerKg > 0 ? color.pricePerKg : 150000;
    auto = {
      code: `${profile.code}${color ? `_${color.code || color.name.trim()}` : ''}`,
      name: `${profile.name}${brand ? ` [${brand.name}]` : ''}${color ? ` (${color.name})` : ''}`,
      unit: 'Cây',
      length: String(profile.barLengthMm || 6000),
      cost: String(Math.round((profile.weightPerM || 1.25) * 6 * price)),
    };
  } else if (lib && type === 'accessory' && accessory) {
    auto = {
      code: accessory.code || `ACC-${accessory.id}`,
      name: accessory.name,
      unit: toDisplayUnit(accessory.unit || 'pcs'),
      length: '6000',
      cost: String(accessory.costPrice || 0),
    };
  }
  const v = auto ?? { code, name, unit, length, cost };
  const locked = lib; // thư viện: ô tự điền bị khóa

  const save = useMutation({
    mutationFn: async () => {
      const base = {
        itemName: v.name.trim(),
        unit: toBackendUnit(v.unit),
        standardLengthMm: type === 'profile' ? Number(v.length) || 6000 : undefined,
        costPrice: Number(v.cost) || 0,
        minStockLevel: Number(minStock) || 0,
        location: location.trim() || undefined,
      };
      if (initial) return updateWarehouseItem(initial.id, base);
      return createWarehouseItem({
        ...base,
        itemCode: v.code.trim().toUpperCase(),
        itemType: type,
        profileBarId: lib && type === 'profile' ? profile?.id : undefined,
        colorId: lib && type === 'profile' ? color?.id : undefined,
        currentStock: Number(stock) || 0,
      });
    },
    onSuccess: () => {
      refreshWarehouse();
      toast.success(edit ? 'Đã cập nhật mặt hàng' : 'Đã thêm mặt hàng vào kho');
      onDone();
    },
    onError: (e) => showErrorToast(e, 'Không thể lưu mặt hàng'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!v.code.trim()) next.code = lib ? 'Vui lòng chọn mặt hàng từ thư viện' : 'Vui lòng nhập mã vật tư';
    if (!v.name.trim()) next.name = 'Vui lòng nhập tên mặt hàng';
    if (Number(v.cost) < 0 || Number(minStock) < 0 || Number(stock) < 0) next.cost = 'Số không được âm';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  const numField = (label: string, value: string, set: (s: string) => void, key?: string, disabled?: boolean) => (
    <Input
      label={label}
      type="number"
      inputMode="decimal"
      min={0}
      fullWidth
      value={value}
      disabled={disabled}
      error={key ? errors[key] : undefined}
      onChange={(e) => {
        set(e.target.value);
        if (key) touch(key);
      }}
    />
  );

  return (
    <form id={ITEM_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-4">
      {!edit && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">Loại mặt hàng</span>
            <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
              {TYPES.map((t) => (
                <Chip
                  key={t.value}
                  selected={type === t.value}
                  className="px-1"
                  onClick={() => {
                    setType(t.value);
                    setUnit(t.unit);
                  }}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>
          {type !== 'consumable' && (
            <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
              <Chip selected={fromLibrary} onClick={() => setFromLibrary(true)}>
                Chọn từ thư viện
              </Chip>
              <Chip selected={!fromLibrary} onClick={() => setFromLibrary(false)}>
                Nhập tay
              </Chip>
            </div>
          )}
        </>
      )}

      {lib && type === 'profile' && (
        <>
          <Select
            side
            label="Hãng nhôm"
            value={String(brand?.id ?? '')}
            options={(brands.data?.items ?? []).map((b) => ({ value: String(b.id), label: b.name }))}
            onChange={(id) => setSel({ ...sel, brand: id, profile: '', color: '' })}
            loading={brands.isLoading}
          />
          <Select
            side
            label="Thanh profile"
            value={String(profile?.id ?? '')}
            options={(profiles.data?.items ?? []).map((p) => ({ value: String(p.id), label: p.name, hint: `${p.code} · ${p.weightPerM || 0} kg/m` }))}
            onChange={(id) => setSel({ ...sel, profile: id })}
            loading={profiles.isLoading}
          />
          <Select
            side
            label="Màu sắc"
            value={String(color?.id ?? '')}
            options={(colors.data?.items ?? []).map((c) => ({ value: String(c.id), label: c.isDefault ? `${c.name} (mặc định)` : c.name }))}
            onChange={(id) => setSel({ ...sel, color: id })}
            loading={colors.isLoading}
          />
        </>
      )}
      {lib && type === 'accessory' && (
        <Select
          side
          label="Phụ kiện"
          value={String(accessory?.id ?? '')}
          options={(accessories.data?.items ?? []).map((a) => ({
            value: String(a.id),
            label: a.name,
            hint: `${a.code || 'ACC'} · ${num(a.costPrice)} đ`,
          }))}
          onChange={(id) => setSel({ ...sel, accessory: id })}
          loading={accessories.isLoading}
        />
      )}

      <Input
        label="Mã vật tư *"
        placeholder="Ví dụ: C3209_TRANG"
        fullWidth
        value={v.code}
        disabled={locked || edit}
        error={errors.code}
        onChange={(e) => {
          setCode(e.target.value);
          touch('code');
        }}
      />
      <Input
        label="Tên mặt hàng *"
        placeholder="Ví dụ: Khung bao cửa đi Xingfa 55 (Trắng sứ)"
        fullWidth
        value={v.name}
        disabled={locked}
        error={errors.name}
        onChange={(e) => {
          setName(e.target.value);
          touch('name');
        }}
      />
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <Select side label="Đơn vị tính" value={v.unit} options={STANDARD_UNIT_OPTIONS} onChange={setUnit} disabled={locked} />
        {type === 'profile'
          ? numField('Chiều dài (mm)', v.length, setLength, undefined, locked)
          : numField('Giá vốn (đ)', v.cost, setCost, 'cost', locked)}
      </div>
      {type === 'profile' && numField('Giá vốn (đ)', v.cost, setCost, 'cost', locked)}
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        {numField('Định mức tối thiểu', minStock, setMinStock)}
        {!edit && numField('Tồn ban đầu', stock, setStock)}
      </div>
      <Input label="Vị trí lưu kho" placeholder="Ví dụ: Giá A1" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} />
    </form>
  );
}
