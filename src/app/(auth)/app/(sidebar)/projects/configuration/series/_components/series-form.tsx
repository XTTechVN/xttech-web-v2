'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createDoorSeries, updateDoorSeries } from '@/actions';
import { Input } from '@/components';
import { Chip, Select } from '@/components-remake';
import type { Brand, DoorSeries } from '@/types';
import { showErrorToast } from '@/utils';
import { JOINTS, refreshSeries } from './format';

export const SERIES_FORM_ID = 'series-form';

interface Props {
  brands: Brand[];
  /** Hãng chọn sẵn khi thêm mới */
  defaultBrandId?: number | null;
  /** Có = sửa; không có = thêm mới */
  initial?: DoorSeries;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

export function SeriesForm({ brands, defaultBrandId, initial, onDone, onPendingChange }: Props) {
  const [brandId, setBrandId] = useState(String(initial?.brandId ?? defaultBrandId ?? brands[0]?.id ?? ''));
  const [code, setCode] = useState(initial?.code ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [thickness, setThickness] = useState(String(initial?.aluminumThickness ?? 1.4));
  const [joint, setJoint] = useState(initial?.cornerJointType || 'ke_ep_goc');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [active, setActive] = useState(initial ? initial.isActive !== false : true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const save = useMutation({
    mutationFn: () => {
      const data = {
        brandId: Number(brandId),
        code: code.trim(),
        name: name.trim(),
        aluminumThickness: Number(thickness) || undefined,
        cornerJointType: joint,
        description: description.trim(),
        isActive: active,
      };
      return initial ? updateDoorSeries(initial.id, data) : createDoorSeries(data);
    },
    onSuccess: () => {
      refreshSeries();
      toast.success(initial ? 'Đã cập nhật hệ nhôm' : 'Đã thêm hệ nhôm');
      onDone();
    },
    onError: (e) => showErrorToast(e, 'Không thể lưu hệ nhôm'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!brandId) next.brand = 'Vui lòng chọn hãng nhôm';
    if (!code.trim()) next.code = 'Vui lòng nhập mã hệ nhôm';
    if (!name.trim()) next.name = 'Vui lòng nhập tên hệ nhôm';
    if (thickness && !(Number(thickness) > 0)) next.thickness = 'Độ dày phải lớn hơn 0';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={SERIES_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Select
          side
          label="Hãng nhôm *"
          value={brandId}
          options={brands.map((b) => ({ value: String(b.id), label: b.name, hint: b.code }))}
          onChange={(v) => {
            setBrandId(v);
            touch('brand');
          }}
        />
        {errors.brand && <p className="text-xs text-red-600">{errors.brand}</p>}
      </div>
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <Input
          label="Mã hệ *"
          placeholder="XINGFA_55"
          fullWidth
          value={code}
          error={errors.code}
          onChange={(e) => {
            setCode(e.target.value);
            touch('code');
          }}
        />
        <Input
          label="Tên hệ *"
          placeholder="Hệ 55 vát cạnh"
          fullWidth
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            touch('name');
          }}
        />
      </div>
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <Input
          label="Độ dày (mm)"
          type="number"
          inputMode="decimal"
          step="0.1"
          fullWidth
          value={thickness}
          error={errors.thickness}
          onChange={(e) => {
            setThickness(e.target.value);
            touch('thickness');
          }}
        />
        <Select side label="Liên kết góc" value={joint} options={JOINTS} onChange={setJoint} />
      </div>
      <Input
        label="Mô tả"
        placeholder="Ứng dụng cho cửa đi, cửa sổ..."
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {initial && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-500">Trạng thái</span>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
            <Chip selected={active} onClick={() => setActive(true)}>
              Hoạt động
            </Chip>
            <Chip selected={!active} onClick={() => setActive(false)}>
              Tạm ngưng
            </Chip>
          </div>
        </div>
      )}
    </form>
  );
}
