'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createProfileBar, updateProfileBar, getDoorSeriesList, getProfileSections } from '@/actions';
import type { ProfileBar, ProfileBarCreate, ProfileBarUpdate, Brand, ProfileSection } from '@/types';
import { ProfileSectionLibraryModal } from './profile-section-library-modal';
import { Layers } from 'lucide-react';

interface ProfileBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileBar?: ProfileBar | null;
  brands: Brand[];
  defaultBrandId: number | null;
}

const BAR_TYPE_OPTIONS = [
  { value: 'FRAME', label: 'Khung bao' },
  { value: 'SASH', label: 'Cánh cửa' },
  { value: 'MULLION', label: 'Đố chia / Đố động' },
  { value: 'BEAD', label: 'Nẹp kính' },
  { value: 'TRACK', label: 'Ray trượt' },
  { value: 'COVER', label: 'Ốp / Nắp đậy' },
  { value: 'CORNER', label: 'Ke góc liên kết' },
  { value: 'OTHER', label: 'Khác' },
];

export function ProfileBarModal({
  isOpen,
  onClose,
  profileBar,
  brands,
  defaultBrandId,
}: ProfileBarModalProps) {
  const isEdit = Boolean(profileBar);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ProfileSection | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileBarCreate>({
    defaultValues: {
      brandId: defaultBrandId || 0,
      seriesId: 0,
      code: '',
      name: '',
      barType: 'FRAME',
      weightPerM: 0,
      sectionHeightMm: 0,
      barLengthMm: 6000,
      deductMullionMm: 0,
      deductSashMm: 0,
      deductBeadMm: 0,
      deductGlassMm: 0,
      sectionLibraryId: null,
      isActive: true,
    },
  });

  const selectedBrandId = watch('brandId') || defaultBrandId;

  // Lấy danh sách Hệ nhôm để chọn
  const { data: seriesData } = useQuery({
    queryKey: ['door-series'],
    queryFn: async () => (await getDoorSeriesList({ offset: 0, limit: 9999 })).items,
    enabled: isOpen,
  });

  const seriesList = seriesData || [];

  // Lấy thư viện mặt cắt để tra cứu nếu profileBar có sectionLibraryId
  const { data: sectionsData } = useQuery({
    queryKey: ['profile-sections-for-modal'],
    queryFn: async () => await getProfileSections({ limit: 500 }),
    enabled: isOpen && Boolean(profileBar?.sectionLibraryId),
  });

  // Lọc danh sách hệ nhôm theo Hãng đang chọn
  const filteredSeries = useMemo(() => {
    if (!selectedBrandId) return seriesList;
    return seriesList.filter((s) => s.brandId === Number(selectedBrandId));
  }, [seriesList, selectedBrandId]);

  useEffect(() => {
    if (!isOpen) return;

    if (profileBar) {
      const existingSec =
        profileBar.sectionLibrary ||
        sectionsData?.find((s) => s.id === profileBar.sectionLibraryId) ||
        null;
      setSelectedSection(existingSec);

      reset({
        brandId: profileBar.brandId,
        seriesId: profileBar.seriesId,
        code: profileBar.code,
        name: profileBar.name,
        barType: (profileBar.barType || 'FRAME').toUpperCase(),
        weightPerM: profileBar.weightPerM ?? 0,
        sectionHeightMm: profileBar.sectionHeightMm ?? 0,
        barLengthMm: profileBar.barLengthMm ?? 6000,
        deductMullionMm: profileBar.deductMullionMm ?? 0,
        deductSashMm: profileBar.deductSashMm ?? 0,
        deductBeadMm: profileBar.deductBeadMm ?? 0,
        deductGlassMm: profileBar.deductGlassMm ?? 0,
        sectionLibraryId: profileBar.sectionLibraryId ?? null,
        isActive: profileBar.isActive,
      });
    } else {
      setSelectedSection(null);
      const firstSeries = filteredSeries[0]?.id || 0;
      reset({
        brandId: defaultBrandId || (brands[0]?.id ?? 0),
        seriesId: firstSeries,
        code: '',
        name: '',
        barType: 'FRAME',
        weightPerM: 0,
        sectionHeightMm: 0,
        barLengthMm: 6000,
        deductMullionMm: 0,
        deductSashMm: 0,
        deductBeadMm: 0,
        deductGlassMm: 0,
        sectionLibraryId: null,
        isActive: true,
      });
    }
  }, [isOpen, profileBar, defaultBrandId, sectionsData]);

  // Mutations
  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (data: ProfileBarCreate) => createProfileBar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success('Thêm thanh profile thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi thêm thanh profile mới'),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: ProfileBarUpdate) => updateProfileBar(profileBar!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success('Cập nhật thanh profile thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật thanh profile'),
  });

  const onSubmit = (data: ProfileBarCreate) => {
    const payload = {
      ...data,
      brandId: Number(data.brandId),
      seriesId: Number(data.seriesId),
      barType: String(data.barType || 'FRAME').toUpperCase(),
      weightPerM: Number(data.weightPerM) || 0,
      sectionHeightMm: Number(data.sectionHeightMm) || 0,
      barLengthMm: Number(data.barLengthMm) || 6000,
      deductMullionMm: Number(data.deductMullionMm) || 0,
      deductSashMm: Number(data.deductSashMm) || 0,
      deductBeadMm: Number(data.deductBeadMm) || 0,
      deductGlassMm: Number(data.deductGlassMm) || 0,
      sectionLibraryId: selectedSection ? selectedSection.id : null,
    };

    if (isEdit) {
      updateMutate(payload);
    } else {
      createMutate(payload);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        title={isEdit ? 'Sửa profile nhôm' : 'Thêm profile nhôm'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-slate-800">
          {/* MẶT CẮT PROFILE (Windova Style - Top Center) */}
          <div className="flex flex-col items-center justify-center pt-1 pb-1">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">
              MẶT CẮT PROFILE
            </span>

            <div className="relative group">
              <div
                onClick={() => setIsLibraryOpen(true)}
                title={selectedSection ? 'Bấm để đổi mặt cắt khác' : 'Bấm để chọn mặt cắt từ thư viện'}
                className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 hover:border-primary hover:bg-slate-50 flex flex-col items-center justify-center p-2 cursor-pointer transition shadow-2xs group"
              >
                {selectedSection ? (
                  <svg
                    viewBox={selectedSection.viewBox || '0 0 100 100'}
                    className="w-full h-full stroke-slate-700 fill-none transition-transform group-hover:scale-105"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={selectedSection.svgPathData} />
                  </svg>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 group-hover:text-primary transition">
                    <Layers className="w-8 h-8 stroke-1" />
                    <span className="text-[11px] font-medium text-center leading-tight">
                      Chọn mặt cắt
                    </span>
                  </div>
                )}
              </div>

              {/* Nút tròn đỏ X để gỡ bỏ mặt cắt đã chọn */}
              {selectedSection && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSection(null);
                    setValue('sectionLibraryId', null);
                  }}
                  title="Gỡ mặt cắt này"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition transform hover:scale-110 z-10"
                >
                  ✕
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 mt-1.5 font-medium">
              {selectedSection ? (selectedSection.name || 'SVG (Vector)') : 'SVG (Vector)'}
            </span>
          </div>

          {/* Hàng 1: Hãng nhôm · Serie cửa · Chiều dài */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hãng nhôm <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('brandId', { required: 'Hãng nhôm là bắt buộc' })}
                onChange={(e) => {
                  const bId = Number(e.target.value);
                  setValue('brandId', bId);
                  const firstS = seriesList.find((s) => s.brandId === bId);
                  setValue('seriesId', firstS ? firstS.id : 0);
                }}
                className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serie cửa <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('seriesId', { required: 'Hệ nhôm là bắt buộc' })}
                className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
              >
                {filteredSeries.length === 0 ? (
                  <option value={0}>Chưa có hệ nhôm</option>
                ) : (
                  filteredSeries.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chiều dài (mm)
              </label>
              <Input
                type="number"
                placeholder="5800"
                className="h-9 text-xs"
                {...register('barLengthMm')}
              />
            </div>
          </div>

          {/* Hàng 2: Mã thanh · Tên thanh · Phân loại */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã thanh <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="VD: C3209"
                required
                className="h-9 text-xs"
                {...register('code', { required: 'Mã thanh là bắt buộc' })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên thanh <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="VD: Khung bao"
                required
                className="h-9 text-xs"
                {...register('name', { required: 'Tên thanh là bắt buộc' })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phân loại <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('barType', { required: 'Phân loại là bắt buộc' })}
                className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
              >
                {BAR_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Khối Thông số kích thước & tỷ trọng (Windova Box) */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="text-primary">📐</span>
              <span>Thông số kích thước & tỷ trọng</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tỷ trọng (kg/m) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.001"
                  placeholder="VD: 0.802"
                  className="h-8 text-xs bg-white"
                  {...register('weightPerM')}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Chiều cao tiết diện (mm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="VD: 50"
                  className="h-8 text-xs bg-white"
                  {...register('sectionHeightMm')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Trừ cánh (mm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  className="h-8 text-xs bg-white"
                  {...register('deductSashMm')}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Trừ nẹp (mm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  className="h-8 text-xs bg-white"
                  {...register('deductBeadMm')}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Trừ kính (mm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  className="h-8 text-xs bg-white"
                  {...register('deductGlassMm')}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Trừ đố chia (mm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  className="h-8 text-xs bg-white"
                  {...register('deductMullionMm')}
                />
              </div>
            </div>
          </div>

          {/* Trạng thái hoạt động */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 pt-0.5">
            <input
              type="checkbox"
              {...register('isActive')}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
            />
            <span className="font-semibold">Kích hoạt hoạt động thanh profile này</span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isPending} className="px-5 font-semibold">
              {isEdit ? 'Lưu thay đổi' : 'Thêm profile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Thư viện Mặt cắt SVG */}
      <ProfileSectionLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(sec) => {
          setSelectedSection(sec);
          setValue('sectionLibraryId', sec.id);
          setIsLibraryOpen(false);
          toast.success(`Đã chọn mặt cắt "${sec.name}"`);
        }}
        selectedSectionId={selectedSection?.id}
      />
    </>
  );
}
