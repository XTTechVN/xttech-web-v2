'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, Select } from '@/components-remake';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createAccessory, updateAccessory, getAccessoryCategories } from '@/actions';
import type { Accessory, AccessoryCreate, AccessoryUpdate, Brand, AccessoryCategory } from '@/types';
import { BASE_MINIO_URL } from '@/config';
import { ImagePlus, X } from 'lucide-react';

const ACCESSORY_FORM_ID = 'accessory-form';

interface AccessoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessory?: Accessory | null;
  brands: Brand[];
  defaultBrandId: number | null;
}

const UNIT_OPTIONS = [
  { value: 'set', label: 'Bộ (Set)' },
  { value: 'pcs', label: 'Cái (Pcs)' },
  { value: 'unit', label: 'Chiếc (Unit)' },
  { value: 'pair', label: 'Đôi / Cặp (Pair)' },
  { value: 'roll', label: 'Cuộn (Roll)' },
  { value: 'box', label: 'Hộp (Box)' },
  { value: 'bag', label: 'Túi (Bag)' },
  { value: 'meter', label: 'Mét - Roan / Gioang (Meter)' },
  { value: 'bottle', label: 'Chai / Tuýp - Keo (Bottle)' },
  { value: 'sheet', label: 'Tấm (Sheet)' },
];

const COLOR_OPTIONS = [
  { value: 'silver', label: 'Bạc ánh kim / Silver' },
  { value: 'black', label: 'Đen tuyền / Black' },
  { value: 'white', label: 'Trắng sứ / White' },
  { value: 'gold', label: 'Vàng Champagne / Gold' },
  { value: 'grey', label: 'Xám ghi / Grey' },
  { value: 'brown', label: 'Nâu cafe / Brown' },
  { value: 'other', label: 'Khác / Other' },
];

const DEFAULT_VALUES: AccessoryCreate = {
  brandId: 0,
  categoryId: undefined,
  code: '',
  name: '',
  specification: '',
  unit: 'pcs',
  color: '',
  costPrice: 0,
  isActive: true,
};

export function AccessoryFormDrawer({ isOpen, onClose, accessory, brands, defaultBrandId }: AccessoryFormDrawerProps) {
  const isEdit = Boolean(accessory);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<AccessoryCreate>({
    defaultValues: { ...DEFAULT_VALUES, brandId: defaultBrandId || 0 },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => await getAccessoryCategories({ limit: 9999, offset: 0, allowDeleted: false }),
    enabled: isOpen,
  });

  const categories = React.useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    const items = (categoriesData as { items?: AccessoryCategory[] }).items;
    return Array.isArray(items) ? items : [];
  }, [categoriesData]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedFile(null);
    setPreviewUrl(null);

    if (accessory) {
      reset({
        brandId: accessory.brandId ?? defaultBrandId ?? 0,
        categoryId: accessory.categoryId ?? undefined,
        code: accessory.code || '',
        name: accessory.name || '',
        specification: accessory.specification || '',
        unit: accessory.unit || 'pcs',
        color: accessory.color || '',
        costPrice: accessory.costPrice ?? 0,
        isActive: accessory.isActive,
      });
    } else {
      reset({
        ...DEFAULT_VALUES,
        brandId: defaultBrandId || (brands[0]?.id ?? 0),
        categoryId: categories[0]?.id,
      });
    }
  }, [isOpen, accessory, defaultBrandId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const existingImageUrl = accessory?.imagePath
    ? accessory.imagePath.startsWith('http')
      ? accessory.imagePath
      : `${BASE_MINIO_URL}/${accessory.imagePath.replace(/^\//, '')}`
    : null;

  const displayImage = previewUrl || existingImageUrl;

  const invalidateAccessoryAndComboQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['accessories'] });
    queryClient.invalidateQueries({ queryKey: ['accessories-list'] });
    queryClient.invalidateQueries({ queryKey: ['accessory-combos'] });
    queryClient.invalidateQueries({ queryKey: ['accessory-combos-list'] });
    queryClient.invalidateQueries({ queryKey: ['all-accessories-dropdown'] });
  };

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (data: AccessoryCreate) => createAccessory({ data, file: selectedFile || undefined }),
    onSuccess: () => {
      invalidateAccessoryAndComboQueries();
      toast.success('Thêm phụ kiện thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi thêm phụ kiện mới'),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: AccessoryUpdate) => updateAccessory(accessory!.id, { data, file: selectedFile || undefined }),
    onSuccess: () => {
      invalidateAccessoryAndComboQueries();
      toast.success('Cập nhật phụ kiện thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật phụ kiện'),
  });

  const onSubmit = (data: AccessoryCreate) => {
    const payload = {
      ...data,
      brandId: Number(data.brandId),
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      costPrice: Number(data.costPrice) || 0,
    };
    if (isEdit) updateMutate(payload);
    else createMutate(payload);
  };

  const isPending = isCreating || isUpdating;

  const title = isEdit ? 'Chỉnh sửa phụ kiện' : 'Thêm phụ kiện';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} label={title} width={560}>
      <DrawerHeader compact title={title} onClose={onClose} />
      <DrawerBody>
      <form id={ACCESSORY_FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hình ảnh</label>
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20 rounded-control border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
              {displayImage ? (
                <>
                  <img src={displayImage} alt="preview" className="w-full h-full object-contain" />
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  )}
                </>
              ) : (
                <ImagePlus size={22} className="text-slate-300" />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-control text-slate-700 bg-white hover:bg-slate-50 hover:border-primary hover:text-primary transition cursor-pointer"
              >
                <ImagePlus size={13} />
                {displayImage ? 'Đổi ảnh' : 'Chọn ảnh'}
              </button>
              <p className="text-[11px] text-slate-400">JPG, PNG, WebP. Tối đa 5MB.</p>
              {selectedFile && <p className="text-[11px] text-emerald-600 font-medium truncate max-w-[180px]">✓ {selectedFile.name}</p>}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
        </div>

        <Select
          side
          label="Hãng phụ kiện *"
          value={String(watch('brandId') || '')}
          options={brands.map((b) => ({ value: String(b.id), label: b.name, hint: b.code }))}
          onChange={(v) => setValue('brandId', Number(v))}
        />
        <Select
          side
          label="Danh mục phụ kiện"
          value={String(watch('categoryId') || '')}
          options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          onChange={(v) => setValue('categoryId', v ? Number(v) : undefined)}
          placeholder="Chưa chọn danh mục"
          clearLabel="Chưa chọn danh mục"
        />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Input label="Mã phụ kiện" placeholder="VD: BL-A30" required {...register('code', { required: true })} />
          <Input label="Tên phụ kiện" placeholder="VD: Bản lề chữ A 12 inch" required {...register('name', { required: true })} />
        </div>

        <Input label="Quy cách / chi tiết kỹ thuật" placeholder="VD: 12 inch, dày 2.5mm..." {...register('specification')} />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Select
            side
            label="Đơn vị tính *"
            value={watch('unit') || ''}
            options={UNIT_OPTIONS}
            onChange={(v) => setValue('unit', v)}
          />
          <Select
            side
            label="Màu sắc"
            value={watch('color') || ''}
            options={COLOR_OPTIONS}
            onChange={(v) => setValue('color', v)}
            placeholder="Để trống"
            clearLabel="Để trống"
          />
        </div>

        <Input type="number" label="Giá nhập (VNĐ)" placeholder="VD: 65000" {...register('costPrice')} />

        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register('isActive')} className="size-4 rounded border-slate-300 accent-primary" />
          <span className="font-medium">Kích hoạt phụ kiện này</span>
        </label>
      </form>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={ACCESSORY_FORM_ID} className="flex-1 md:flex-none" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm phụ kiện'}
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
