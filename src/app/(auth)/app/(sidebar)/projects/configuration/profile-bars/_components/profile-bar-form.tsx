'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '@/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createProfileBar, updateProfileBar, getDoorSeriesList, getProfileSections, getProfileBars } from '@/actions';
import type { ProfileBar, ProfileBarCreate, ProfileBarVariant, ProfileBarCompanion, Brand, ProfileSection } from '@/types';
import { ProfileSectionLibraryModal } from './profile-section-library-modal';
import { ProfileSectionPicker } from './profile-section-picker';
import { ProfileVariantsSection } from './profile-variants-section';
import { ProfileCompanionsSection } from './profile-companions-section';
import { BAR_TYPE_OPTIONS, DEFAULT_VALUES, DEDUCTION_FIELDS, SELECT_CLASS } from './profile-bar-config';
import { buildProfileBarPayload, cloneVariants, cloneCompanions } from './profile-bar-payload';

interface ProfileBarFormProps {
  isOpen: boolean;
  onClose: () => void;
  profileBar: ProfileBar | null;
  isCopy: boolean;
  brands: Brand[];
  defaultBrandId: number | null;
}

const CHECKBOX_CLASS = 'w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary';
const LABEL_CLASS = 'block text-xs font-semibold text-slate-700 mb-1';

function buildInitialValues(profileBar: ProfileBar | null, isCopy: boolean, brandId: number): ProfileBarCreate {
  if (!profileBar) return { ...DEFAULT_VALUES, brandId };
  return {
    brandId: profileBar.brandId,
    seriesId: profileBar.seriesId,
    code: isCopy ? `${profileBar.code}-COPY` : profileBar.code,
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
    sectionImagePath: profileBar.sectionImagePath ?? null,
    note: profileBar.note ?? '',
    isVirtual: Boolean(profileBar.isVirtual),
    isFullCompanion: Boolean(profileBar.isFullCompanion),
    isActive: profileBar.isActive,
  };
}

export function ProfileBarForm({ isOpen, onClose, profileBar, isCopy, brands, defaultBrandId }: ProfileBarFormProps) {
  const isEdit = Boolean(profileBar) && !isCopy;
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  // undefined = chưa người dùng chọn (dùng mặt cắt gốc); null = đã gỡ
  const [pickedSection, setPickedSection] = useState<ProfileSection | null | undefined>(undefined);
  const [variants, setVariants] = useState<ProfileBarVariant[]>(() => cloneVariants(profileBar?.variants));
  const [companions, setCompanions] = useState<ProfileBarCompanion[]>(() => cloneCompanions(profileBar?.companions));

  const { register, handleSubmit, watch, setValue } = useForm<ProfileBarCreate>({
    defaultValues: buildInitialValues(profileBar, isCopy, defaultBrandId || (brands[0]?.id ?? 0)),
  });

  const selectedBrandId = Number(watch('brandId')) || 0;
  const watchedSeriesId = Number(watch('seriesId')) || 0;
  const isFullCompanion = Boolean(watch('isFullCompanion'));
  const watchedCode = watch('code') ?? '';
  const watchedName = watch('name') ?? '';

  const { data: seriesList = [] } = useQuery({
    queryKey: ['door-series'],
    queryFn: async () => (await getDoorSeriesList({ offset: 0, limit: 9999 })).items,
    enabled: isOpen,
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['profile-sections-for-modal'],
    queryFn: async () => await getProfileSections({ limit: 500 }),
    enabled: isOpen && Boolean(profileBar?.sectionLibraryId) && !profileBar?.sectionLibrary,
  });

  const { data: candidateBars = [] } = useQuery({
    queryKey: ['profile-bars', 'companion-candidates', selectedBrandId],
    queryFn: async () => (await getProfileBars({ brandId: selectedBrandId, offset: 0, limit: 1000 })).items,
    enabled: isOpen && selectedBrandId > 0,
  });

  const selectedSection =
    pickedSection !== undefined
      ? pickedSection
      : profileBar?.sectionLibrary || sectionsData?.find((s) => s.id === profileBar?.sectionLibraryId) || null;

  const filteredSeries = useMemo(
    () => (!selectedBrandId ? seriesList : seriesList.filter((s) => s.brandId === selectedBrandId)),
    [seriesList, selectedBrandId],
  );

  const { mutate: saveMutate, isPending } = useMutation({
    mutationFn: (data: ProfileBarCreate) => (isEdit ? updateProfileBar(profileBar!.id, data) : createProfileBar(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success(isEdit ? 'Cập nhật thanh profile thành công' : isCopy ? 'Sao chép thanh profile thành công' : 'Thêm thanh profile thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật thanh profile' : 'Lỗi khi lưu thanh profile mới'),
  });

  const onSubmit = (data: ProfileBarCreate) => {
    const payload = buildProfileBarPayload(
      { ...data, seriesId: Number(data.seriesId) || filteredSeries[0]?.id || 0 },
      selectedSection,
      variants,
      companions,
    );
    payload.sectionImagePath = profileBar?.sectionImagePath ?? null;
    if (payload.companions?.some((companion) => !companion.companionBarId)) {
      toast.error('Vui lòng chọn thanh kèm theo cho mọi dòng thanh đính kèm');
      return;
    }
    saveMutate(payload);
  };

  const submitLabel = isEdit ? 'Lưu thay đổi' : isCopy ? 'Tạo bản sao' : 'Thêm profile';

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-slate-800">
        <ProfileSectionPicker
          section={selectedSection}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onClear={() => {
            setPickedSection(null);
            setValue('sectionLibraryId', null);
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Hãng nhôm <span className="text-rose-500">*</span></label>
            <select
              {...register('brandId', { required: true })}
              onChange={(e) => {
                const bId = Number(e.target.value);
                setValue('brandId', bId);
                setValue('seriesId', seriesList.find((s) => s.brandId === bId)?.id || 0);
                setCompanions([]);
              }}
              className={SELECT_CLASS}
            >
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Serie cửa <span className="text-rose-500">*</span></label>
            <select {...register('seriesId', { required: true })} className={SELECT_CLASS}>
              {filteredSeries.length === 0 ? <option value={0}>Chưa có hệ nhôm</option> : filteredSeries.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Chiều dài (mm)</label>
            <Input type="number" placeholder="5800" className="h-9 text-xs" {...register('barLengthMm')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Mã thanh <span className="text-rose-500">*</span></label>
            <Input placeholder="VD: C3209" required className="h-9 text-xs" {...register('code', { required: true })} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Tên thanh <span className="text-rose-500">*</span></label>
            <Input placeholder="VD: Khung bao" required className="h-9 text-xs" {...register('name', { required: true })} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Phân loại <span className="text-rose-500">*</span></label>
            <select {...register('barType', { required: true })} className={SELECT_CLASS}>
              {BAR_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="text-primary">📐</span>
            <span>Thông số kích thước & tỷ trọng</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tỷ trọng (kg/m) <span className="text-rose-500">*</span></label>
              <Input type="number" step="0.001" placeholder="VD: 0.802" className="h-8 text-xs bg-white" {...register('weightPerM')} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chiều cao tiết diện (mm)</label>
              <Input type="number" step="0.1" placeholder="VD: 50" className="h-8 text-xs bg-white" {...register('sectionHeightMm')} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {DEDUCTION_FIELDS.map(({ name, label }) => (
              <div key={name}>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">{label}</label>
                <Input type="number" step="0.1" placeholder="0" className="h-8 text-xs bg-white" {...register(name)} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Ghi chú</label>
          <Input placeholder="Ghi chú thêm..." className="h-9 text-xs" {...register('note')} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
          <input type="checkbox" {...register('isVirtual')} className={CHECKBOX_CLASS} />
          <span className="font-semibold">Profile ảo (dùng để tính kích thước, không xuất trong danh sách cắt)</span>
        </label>

        <ProfileVariantsSection variants={variants} onChange={setVariants} />

        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
          <input type="checkbox" {...register('isFullCompanion')} className={CHECKBOX_CLASS} />
          <span className="font-semibold">Combine toàn phần (vẽ/tính như profile thật, BOM bung thanh kèm)</span>
        </label>

        <ProfileCompanionsSection
          companions={companions}
          onChange={setCompanions}
          availableBars={candidateBars}
          parent={{ id: isEdit ? profileBar?.id : undefined, code: watchedCode, name: watchedName, brandId: selectedBrandId, seriesId: watchedSeriesId }}
          isFullCompanion={isFullCompanion}
        />

        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 pt-0.5">
          <input type="checkbox" {...register('isActive')} className={CHECKBOX_CLASS} />
          <span className="font-semibold">Kích hoạt hoạt động thanh profile này</span>
        </label>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>Hủy</Button>
          <Button type="submit" variant="primary" size="sm" loading={isPending} className="px-5 font-semibold">{submitLabel}</Button>
        </div>
      </form>

      <ProfileSectionLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(sec) => {
          setPickedSection(sec);
          setValue('sectionLibraryId', sec.id);
          setIsLibraryOpen(false);
          toast.success(`Đã chọn mặt cắt "${sec.name}"`);
        }}
        selectedSectionId={selectedSection?.id}
      />
    </>
  );
}
