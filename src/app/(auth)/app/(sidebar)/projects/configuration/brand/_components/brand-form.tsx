'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBrand, updateBrand } from '@/actions';
import { Input, Textarea } from '@/components';
import { Button, Chip, Select } from '@/components-remake';
import type { Brand } from '@/types';
import { showErrorToast } from '@/utils';
import { BrandLogo } from './brand-logo';
import { BRAND_TYPES, refreshBrands } from './format';

export const BRAND_FORM_ID = 'brand-form';

interface Props {
  /** Có = sửa; không có = thêm mới */
  initial?: Brand;
  onDone: (brand: Brand) => void;
  onPendingChange: (pending: boolean) => void;
}

export function BrandForm({ initial, onDone, onPendingChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [code, setCode] = useState(initial?.code ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState(initial?.brandType ?? 'aluminum');
  const [origin, setOrigin] = useState(initial?.originCountry ?? '');
  const [barLength, setBarLength] = useState(String(initial?.barLengthMm ?? 6000));
  const [website, setWebsite] = useState(initial?.website ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [active, setActive] = useState(initial ? initial.isActive : true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const touch = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));

  const pick = (f?: File) => {
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = useMutation({
    mutationFn: () => {
      const data = {
        code: code.trim(),
        name: name.trim(),
        brandType: type,
        originCountry: origin.trim() || null,
        website: website.trim() || null,
        description: description.trim() || null,
        barLengthMm: Number(barLength) || 6000,
        isActive: active,
      };
      return initial ? updateBrand(initial.id, data, file) : createBrand(data, file);
    },
    onSuccess: (brand) => {
      refreshBrands();
      toast.success(initial ? 'Đã cập nhật thương hiệu' : 'Đã thêm thương hiệu');
      onDone(brand);
    },
    onError: (e) => showErrorToast(e, 'Không thể lưu thương hiệu'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Record<string, string> = {};
    if (!code.trim()) next.code = 'Vui lòng nhập mã thương hiệu';
    if (!name.trim()) next.name = 'Vui lòng nhập tên thương hiệu';
    if (barLength && !(Number(barLength) > 0)) next.barLength = 'Chiều dài phải lớn hơn 0';
    setErrors(next);
    if (Object.keys(next).length) return;
    onPendingChange(true);
    save.mutate(undefined, { onSettled: () => onPendingChange(false) });
  };

  return (
    <form id={BRAND_FORM_ID} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {preview ? (
          <img src={preview} alt="Logo mới chọn" className="size-16 flex-none rounded-control border border-slate-200 object-contain p-1" />
        ) : (
          <BrandLogo brand={initial ?? { logoPath: null, updatedAt: '', name, code }} className="size-16" />
        )}
        <div className="flex min-w-0 flex-col items-start gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <Button variant="outline" icon={<ImagePlus size={16} />} onClick={() => fileRef.current?.click()}>
            {initial?.logoPath || preview ? 'Đổi logo' : 'Chọn logo'}
          </Button>
          <span className="max-w-full truncate text-xs text-slate-500">{file ? file.name : 'PNG, JPG, WEBP hoặc SVG, nên là ảnh vuông'}</span>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <Input
          label="Mã *"
          placeholder="XINGFA_QD"
          fullWidth
          value={code}
          error={errors.code}
          onChange={(e) => {
            setCode(e.target.value);
            touch('code');
          }}
        />
        <Input
          label="Tên *"
          placeholder="Xingfa Quảng Đông"
          fullWidth
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            touch('name');
          }}
        />
      </div>
      <Select side label="Phân loại" value={type} options={BRAND_TYPES} onChange={setType} />
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <Input label="Xuất xứ" placeholder="Trung Quốc" fullWidth value={origin} onChange={(e) => setOrigin(e.target.value)} />
        <Input
          label="Cây nhôm (mm)"
          type="number"
          inputMode="numeric"
          fullWidth
          value={barLength}
          error={errors.barLength}
          onChange={(e) => {
            setBarLength(e.target.value);
            touch('barLength');
          }}
        />
      </div>
      <Input
        label="Website"
        type="url"
        inputMode="url"
        placeholder="https://"
        fullWidth
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <Textarea label="Ghi chú" rows={3} fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
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
