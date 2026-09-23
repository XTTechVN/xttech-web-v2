'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button, Select } from '@/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createBrand, updateBrand, createDoorSeries, updateDoorSeries, createProfileBar, updateProfileBar, getProfileSections, createBrandColor, updateBrandColor, } from '@/actions';
import type { Brand, BrandCreate, DoorSeries, DoorSeriesCreate, ProfileBar, ProfileBarCreate, BrandColor, BrandColorCreate, ProfileSection, } from '@/types';

// ==========================================
// 1. BRAND MODAL (Tạo / Sửa Hãng nhôm)
// ==========================================
interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand | null;
}

export function BrandModal({ isOpen, onClose, brand }: BrandModalProps) {
  const isEdit = Boolean(brand);
  const { register, handleSubmit, reset } = useForm<BrandCreate>({
    defaultValues: {
      code: '',
      name: '',
      brandType: 'aluminum',
      originCountry: '',
      website: '',
      description: '',
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (brand) {
      reset({
        code: brand.code,
        name: brand.name,
        brandType: brand.brandType,
        originCountry: brand.originCountry || '',
        website: brand.website || '',
        description: brand.description || '',
        isActive: brand.isActive,
        sortOrder: brand.sortOrder,
      });
    } else {
      reset({
        code: '',
        name: '',
        brandType: 'aluminum',
        originCountry: '',
        website: '',
        description: '',
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [brand, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: BrandCreate) => {
      if (isEdit && brand) {
        return await updateBrand(brand.id, data);
      }
      return await createBrand(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(isEdit ? 'Cập nhật thương hiệu thành công' : 'Thêm thương hiệu thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa thông tin thương hiệu' : 'Thêm thương hiệu mới'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Mã thương hiệu *"
            placeholder="VD: XINGFA_QD"
            {...register('code', { required: true })}
          />
          <Input
            label="Tên thương hiệu *"
            placeholder="VD: Xingfa Quảng Đông"
            {...register('name', { required: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phân loại</label>
            <select
              {...register('brandType')}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            >
              <option value="aluminum">Hãng nhôm (Alu)</option>
              <option value="accessory">Phụ kiện (Accessory)</option>
              <option value="both">Cả hai</option>
            </select>
          </div>
          <Input
            label="Xuất xứ"
            placeholder="VD: Trung Quốc, Việt Nam"
            {...register('originCountry')}
          />
        </div>

        <Input
          label="Website"
          placeholder="https://..."
          {...register('website')}
        />

        <Input
          label="Ghi chú mô tả"
          placeholder="Mô tả tóm tắt..."
          {...register('description')}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 2. DOOR SERIES MODAL (Tạo / Sửa Hệ nhôm)
// ==========================================
interface DoorSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  series?: DoorSeries | null;
  brands: Brand[];
  defaultBrandId?: number;
}

export function DoorSeriesModal({ isOpen, onClose, series, brands, defaultBrandId }: DoorSeriesModalProps) {
  const isEdit = Boolean(series);
  const { register, handleSubmit, reset, watch, setValue } = useForm<DoorSeriesCreate>({
    defaultValues: {
      brandId: defaultBrandId ?? brands[0]?.id,
      code: '',
      name: '',
      aluminumThickness: 1.4,
      cornerJointType: 'ke_ep_goc',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (series) {
      reset({
        brandId: series.brandId ?? defaultBrandId ?? brands[0]?.id,
        code: series.code,
        name: series.name,
        aluminumThickness: series.aluminumThickness || 1.4,
        cornerJointType: series.cornerJointType || 'ke_ep_goc',
        description: series.description || '',
        isActive: series.isActive,
      });
    } else {
      reset({
        brandId: defaultBrandId ?? brands[0]?.id,
        code: '',
        name: '',
        aluminumThickness: 1.4,
        cornerJointType: 'ke_ep_goc',
        description: '',
        isActive: true,
      });
    }
  }, [series, brands, defaultBrandId, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: DoorSeriesCreate) => {
      const targetBrandId = Number(data.brandId) || brands[0]?.id;
      if (!targetBrandId) {
        throw new Error('Vui lòng tạo hoặc chọn hãng nhôm trước');
      }
      data.brandId = targetBrandId;
      data.aluminumThickness = data.aluminumThickness ? Number(data.aluminumThickness) : undefined;
      if (isEdit && series) {
        return await updateDoorSeries(series.id, data);
      }
      return await createDoorSeries(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['door-series'] });
      toast.success(isEdit ? 'Cập nhật hệ nhôm thành công' : 'Thêm hệ nhôm thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa hệ nhôm kỹ thuật' : 'Thêm hệ nhôm mới'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Hãng sản xuất *</label>
          <select
            value={watch('brandId') || brands[0]?.id || ''}
            onChange={(e) => setValue('brandId', Number(e.target.value))}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Mã hệ nhôm *"
            placeholder="VD: XF55, XF93"
            {...register('code', { required: true })}
          />
          <Input
            label="Tên hệ nhôm *"
            placeholder="VD: Xingfa Hệ 55 vát cạnh"
            {...register('name', { required: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Độ dày (mm)"
            type="number"
            step="0.1"
            placeholder="1.4"
            {...register('aluminumThickness')}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Kiểu liên kết góc</label>
            <select
              {...register('cornerJointType')}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            >
              <option value="ke_ep_goc">Ke ép góc (Máy ép)</option>
              <option value="ke_vinh_cuu">Ke vĩnh cửu</option>
              <option value="ke_nhay">Ke nhảy bắt vít</option>
            </select>
          </div>
        </div>

        <Input
          label="Ghi chú kỹ thuật"
          placeholder="Mô tả bổ sung..."
          {...register('description')}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 3. PROFILE BAR MODAL (Tạo / Sửa Thanh Profile)
// ==========================================
interface ProfileBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  bar?: ProfileBar | null;
  brands: Brand[];
  seriesList: DoorSeries[];
  defaultBrandId?: number;
}

export function ProfileBarModal({
  isOpen,
  onClose,
  bar,
  brands,
  seriesList,
  defaultBrandId,
}: ProfileBarModalProps) {
  const isEdit = Boolean(bar);

  const { data: sectionsData } = useQuery({
    queryKey: ['profile-sections'],
    queryFn: async () => await getProfileSections(),
    enabled: isOpen,
  });
  const sections = sectionsData || [];

  const initialBId = defaultBrandId ?? brands[0]?.id;
  const initialSId = seriesList.find((s) => s.brandId === initialBId)?.id || seriesList[0]?.id;

  const { register, handleSubmit, reset, watch, setValue } = useForm<ProfileBarCreate>({
    defaultValues: {
      brandId: initialBId,
      seriesId: initialSId,
      code: '',
      name: '',
      barType: 'FRAME',
      weightPerM: 0.8,
      sectionHeightMm: 50,
      barLengthMm: 6000,
      deductSashMm: 0,
      deductGlassMm: 0,
      deductMullionMm: 0,
      deductBeadMm: 0,
      sectionLibraryId: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (bar) {
      reset({
        brandId: bar.brandId ?? defaultBrandId ?? brands[0]?.id,
        seriesId: bar.seriesId,
        code: bar.code,
        name: bar.name,
        barType: bar.barType || 'FRAME',
        weightPerM: bar.weightPerM ?? 0.8,
        sectionHeightMm: bar.sectionHeightMm ?? 50,
        barLengthMm: bar.barLengthMm ?? 6000,
        deductSashMm: bar.deductSashMm ?? 0,
        deductGlassMm: bar.deductGlassMm ?? 0,
        deductMullionMm: bar.deductMullionMm ?? 0,
        deductBeadMm: bar.deductBeadMm ?? 0,
        sectionLibraryId: bar.sectionLibraryId ?? null,
        isActive: bar.isActive,
      });
    } else {
      const curBId = defaultBrandId ?? brands[0]?.id;
      const curSId = seriesList.find((s) => s.brandId === curBId)?.id || seriesList[0]?.id;
      reset({
        brandId: curBId,
        seriesId: curSId,
        code: '',
        name: '',
        barType: 'FRAME',
        weightPerM: 0.8,
        sectionHeightMm: 50,
        barLengthMm: 6000,
        deductSashMm: 0,
        deductGlassMm: 0,
        deductMullionMm: 0,
        deductBeadMm: 0,
        sectionLibraryId: null,
        isActive: true,
      });
    }
  }, [bar, brands, seriesList, defaultBrandId, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ProfileBarCreate) => {
      const targetBrandId = Number(data.brandId) || brands[0]?.id;
      const targetSeriesId = Number(data.seriesId) || seriesList[0]?.id;
      if (!targetBrandId || !targetSeriesId) {
        throw new Error('Vui lòng chọn hãng và hệ nhôm hợp lệ');
      }
      data.brandId = targetBrandId;
      data.seriesId = targetSeriesId;
      data.weightPerM = Number(data.weightPerM);
      data.sectionHeightMm = Number(data.sectionHeightMm);
      data.barLengthMm = Number(data.barLengthMm || 6000);
      data.deductSashMm = Number(data.deductSashMm || 0);
      data.deductGlassMm = Number(data.deductGlassMm || 0);
      data.deductMullionMm = Number(data.deductMullionMm || 0);
      data.deductBeadMm = Number(data.deductBeadMm || 0);
      data.sectionLibraryId = data.sectionLibraryId ? Number(data.sectionLibraryId) : undefined;

      if (isEdit && bar) {
        return await updateProfileBar(bar.id, data);
      }
      return await createProfileBar(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success(isEdit ? 'Cập nhật thanh nhôm thành công' : 'Thêm thanh nhôm thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  const selectedBrandId = watch('brandId') || brands[0]?.id;
  const filteredSeries = seriesList.filter((s) => !selectedBrandId || Number(s.brandId) === Number(selectedBrandId));
  const displaySeries = filteredSeries.length > 0 ? filteredSeries : seriesList;
  const selectedSecId = watch('sectionLibraryId');
  const selectedSection = sections.find((s) => s.id === Number(selectedSecId));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa thanh profile nhôm' : 'Thêm cây nhôm profile mới (6m)'}
      size="lg"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Hãng nhôm *</label>
            <select
              value={watch('brandId') || brands[0]?.id || ''}
              onChange={(e) => {
                const bId = Number(e.target.value);
                setValue('brandId', bId);
                const matching = seriesList.find((s) => s.brandId === bId);
                if (matching) setValue('seriesId', matching.id);
              }}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Hệ nhôm *</label>
            <select
              value={watch('seriesId') || displaySeries[0]?.id || ''}
              onChange={(e) => setValue('seriesId', Number(e.target.value))}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            >
              {displaySeries.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Mã dập thanh *"
            placeholder="VD: C3209, C3318"
            {...register('code', { required: true })}
          />
          <Input
            label="Tên gọi thanh nhôm *"
            placeholder="VD: Khung bao cửa đi 55"
            {...register('name', { required: true })}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vai trò hình học *</label>
            <select
              {...register('barType')}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            >
              <option value="FRAME">FRAME (Khung bao)</option>
              <option value="SASH">SASH (Khung cánh)</option>
              <option value="MULLION">MULLION (Đố chia ô)</option>
              <option value="BEAD">BEAD (Nẹp gài kính)</option>
              <option value="TRACK">TRACK (Ray trượt lùa)</option>
              <option value="ADAPTER">ADAPTER (Đảo / Nối khung / Ốp)</option>
              <option value="LOUVER">LOUVER (Nan chớp thông gió)</option>
              <option value="PANEL">PANEL (Thanh ghép nan Pano)</option>
            </select>
          </div>
        </div>

        {/* Liên kết mặt cắt CAD SVG */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
          <label className="block text-xs font-bold text-slate-700">Mặt cắt CAD / Biên dạng chuẩn</label>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8">
              <select
                value={watch('sectionLibraryId') || ''}
                onChange={(e) => setValue('sectionLibraryId', e.target.value ? Number(e.target.value) : null)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
              >
                <option value="">-- Chưa liên kết mặt cắt CAD --</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.code}) - {sec.category}
                  </option>
                ))}
              </select>
            </div>
            {selectedSection && (
              <div className="md:col-span-4 flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                  <svg viewBox={selectedSection.viewBox || '0 0 100 100'} className="w-full h-full text-primary">
                    <path d={selectedSection.svgPathData} fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-700 truncate">{selectedSection.code}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Tỷ trọng (kg/m) *"
            type="number"
            step="0.001"
            placeholder="0.802"
            {...register('weightPerM', { required: true })}
          />
          <Input
            label="Bề dày mặt cắt (mm) *"
            type="number"
            step="0.1"
            placeholder="50"
            {...register('sectionHeightMm', { required: true })}
          />
          <Input
            label="Chiều dài cây gốc (mm)"
            type="number"
            placeholder="6000"
            {...register('barLengthMm')}
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
          <p className="text-xs font-bold text-slate-700">Thông số trừ cơ khí ngàm & lọt lòng (mm)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              label="Trừ cánh (mm)"
              type="number"
              step="0.1"
              placeholder="61.0"
              {...register('deductSashMm')}
            />
            <Input
              label="Trừ kính (mm)"
              type="number"
              step="0.1"
              placeholder="36.0"
              {...register('deductGlassMm')}
            />
            <Input
              label="Trừ đố (mm)"
              type="number"
              step="0.1"
              placeholder="26.5"
              {...register('deductMullionMm')}
            />
            <Input
              label="Trừ nẹp (mm)"
              type="number"
              step="0.1"
              placeholder="31.2"
              {...register('deductBeadMm')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 4. BRAND COLOR MODAL (Tạo / Sửa Màu Sơn Nhôm)
// ==========================================
interface BrandColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  color?: BrandColor | null;
  brands: Brand[];
  defaultBrandId?: number;
}

export function BrandColorModal({ isOpen, onClose, color, brands, defaultBrandId }: BrandColorModalProps) {
  const isEdit = Boolean(color);
  const { register, handleSubmit, reset, watch, setValue } = useForm<BrandColorCreate>({
    defaultValues: {
      brandId: defaultBrandId ?? brands[0]?.id,
      code: '',
      name: '',
      colorHex: '#4B4F54',
      surfaceType: 'powder_coat',
      pricePerKg: 98000,
      priceMultiplier: 1.0,
      isDefault: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (color) {
      reset({
        brandId: color.brandId ?? defaultBrandId ?? brands[0]?.id,
        code: color.code,
        name: color.name,
        colorHex: color.colorHex || '#4B4F54',
        surfaceType: color.surfaceType || 'powder_coat',
        pricePerKg: Number(color.pricePerKg ?? 0),
        priceMultiplier: Number(color.priceMultiplier ?? 1.0),
        isDefault: color.isDefault ?? false,
        isActive: color.isActive ?? true,
      });
    } else {
      reset({
        brandId: defaultBrandId ?? brands[0]?.id,
        code: '',
        name: '',
        colorHex: '#4B4F54',
        surfaceType: 'powder_coat',
        pricePerKg: 98000,
        priceMultiplier: 1.0,
        isDefault: false,
        isActive: true,
      });
    }
  }, [color, brands, defaultBrandId, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: BrandColorCreate) => {
      data.brandId = Number(data.brandId) || brands[0]?.id;
      data.pricePerKg = Number(data.pricePerKg);
      data.priceMultiplier = Number(data.priceMultiplier || 1.0);
      if (isEdit && color) {
        return await updateBrandColor(color.id, data);
      }
      return await createBrandColor(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-colors'] });
      toast.success(isEdit ? 'Cập nhật màu sắc thành công' : 'Thêm màu sắc thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật màu' : 'Lỗi khi tạo màu mới'),
  });

  const currentColorHex = watch('colorHex') || '#4B4F54';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa màu sắc hãng nhôm' : 'Thêm màu sơn nhôm mới'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Hãng sản xuất *</label>
          <select
            value={watch('brandId') || brands[0]?.id || ''}
            onChange={(e) => setValue('brandId', Number(e.target.value))}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Mã màu *"
            placeholder="VD: XF_GREY, XF_BROWN"
            {...register('code', { required: true })}
          />
          <Input
            label="Tên màu thương mại *"
            placeholder="VD: Ghi xám sần Metallic"
            {...register('name', { required: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mã màu HEX (Xem trước)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColorHex}
                onChange={(e) => setValue('colorHex', e.target.value)}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
              />
              <Input
                placeholder="#4B4F54"
                {...register('colorHex', { required: true })}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Công nghệ bề mặt</label>
            <select
              {...register('surfaceType')}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            >
              <option value="powder_coat">Sơn tĩnh điện (Powder Coat)</option>
              <option value="anodize">Anodize / Xi mạ điện phân</option>
              <option value="wood_grain">Phủ phim vân gỗ (Wood Grain)</option>
              <option value="pvdf">Sơn PVDF chống ăn mòn biển</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Đơn giá nhôm màu này (VND/kg) *"
            type="number"
            step="1000"
            placeholder="98000"
            {...register('pricePerKg', { required: true })}
          />
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="color_is_default"
              {...register('isDefault')}
              className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
            />
            <label htmlFor="color_is_default" className="text-xs font-semibold text-gray-700 cursor-pointer">
              Màu tiêu chuẩn mặc định của hãng
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
