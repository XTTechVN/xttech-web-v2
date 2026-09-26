'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createProfileBar, updateProfileBar, getDoorSeriesList } from '@/actions';
import type { ProfileBar, ProfileBarCreate, ProfileBarUpdate, Brand } from '@/types';

interface ProfileBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileBar?: ProfileBar | null;
  brands: Brand[];
  defaultBrandId: number | null;
}

const BAR_TYPE_OPTIONS = [
  { value: 'frame', label: 'Khung bao (Frame)' },
  { value: 'sash', label: 'Cánh cửa (Sash)' },
  { value: 'mullion', label: 'Đố chia / Đố động (Mullion)' },
  { value: 'bead', label: 'Nẹp kính (Bead)' },
  { value: 'cover', label: 'Ốp / Nắp đậy (Cover)' },
  { value: 'corner', label: 'Ke góc liên kết (Corner Joint)' },
  { value: 'other', label: 'Khác (Other)' },
];

export function ProfileBarModal({
  isOpen,
  onClose,
  profileBar,
  brands,
  defaultBrandId,
}: ProfileBarModalProps) {
  const isEdit = Boolean(profileBar);

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
      barType: 'frame',
      weightPerM: 0,
      sectionHeightMm: 0,
      barLengthMm: 6000,
      deductMullionMm: 0,
      deductSashMm: 0,
      deductBeadMm: 0,
      deductGlassMm: 0,
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

  // Lọc danh sách hệ nhôm theo Hãng đang chọn
  const filteredSeries = useMemo(() => {
    if (!selectedBrandId) return seriesList;
    return seriesList.filter((s) => s.brandId === Number(selectedBrandId));
  }, [seriesList, selectedBrandId]);

  useEffect(() => {
    if (!isOpen) return;

    if (profileBar) {
      reset({
        brandId: profileBar.brandId,
        seriesId: profileBar.seriesId,
        code: profileBar.code,
        name: profileBar.name,
        barType: profileBar.barType || 'frame',
        weightPerM: profileBar.weightPerM ?? 0,
        sectionHeightMm: profileBar.sectionHeightMm ?? 0,
        barLengthMm: profileBar.barLengthMm ?? 6000,
        deductMullionMm: profileBar.deductMullionMm ?? 0,
        deductSashMm: profileBar.deductSashMm ?? 0,
        deductBeadMm: profileBar.deductBeadMm ?? 0,
        deductGlassMm: profileBar.deductGlassMm ?? 0,
        isActive: profileBar.isActive,
      });
    } else {
      const firstSeries = filteredSeries[0]?.id || 0;
      reset({
        brandId: defaultBrandId || (brands[0]?.id ?? 0),
        seriesId: firstSeries,
        code: '',
        name: '',
        barType: 'frame',
        weightPerM: 0,
        sectionHeightMm: 0,
        barLengthMm: 6000,
        deductMullionMm: 0,
        deductSashMm: 0,
        deductBeadMm: 0,
        deductGlassMm: 0,
        isActive: true,
      });
    }
  }, [isOpen, profileBar, defaultBrandId]);

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
      weightPerM: Number(data.weightPerM) || 0,
      sectionHeightMm: Number(data.sectionHeightMm) || 0,
      barLengthMm: Number(data.barLengthMm) || 6000,
      deductMullionMm: Number(data.deductMullionMm) || 0,
      deductSashMm: Number(data.deductSashMm) || 0,
      deductBeadMm: Number(data.deductBeadMm) || 0,
      deductGlassMm: Number(data.deductGlassMm) || 0,
    };

    if (isEdit) {
      updateMutate(payload);
    } else {
      createMutate(payload);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Chỉnh sửa thanh profile' : 'Thêm thanh profile mới'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Chọn Hãng & Hệ nhôm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hệ nhôm thuộc hãng <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('seriesId', { required: 'Hệ nhôm là bắt buộc' })}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              {filteredSeries.length === 0 ? (
                <option value={0}>Hãng này chưa có hệ nhôm nào</option>
              ) : (
                filteredSeries.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Mã thanh & Tên thanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Mã thanh profile"
            placeholder="VD: XF55-01, ALV-102..."
            required
            {...register('code', { required: 'Mã thanh profile là bắt buộc' })}
          />

          <Input
            label="Tên thanh profile"
            placeholder="VD: Khung bao cửa đi mở quay 55..."
            required
            {...register('name', { required: 'Tên thanh profile là bắt buộc' })}
          />
        </div>

        {/* Phân loại thanh & Chiều dài tiêu chuẩn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phân loại thanh <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('barType', { required: 'Phân loại thanh là bắt buộc' })}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition"
            >
              {BAR_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            label="Chiều dài tiêu chuẩn (mm)"
            placeholder="6000"
            {...register('barLengthMm')}
          />
        </div>

        {/* Trọng lượng & Chiều cao mặt cắt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            type="number"
            step="0.01"
            label="Trọng lượng (kg / mét dài)"
            placeholder="VD: 1.25"
            {...register('weightPerM')}
          />

          <Input
            type="number"
            step="0.1"
            label="Bề dày / Chiều cao mặt cắt (mm)"
            placeholder="VD: 55"
            {...register('sectionHeightMm')}
          />
        </div>

        {/* Thông số khấu trừ gia công (Tùy chọn nâng cao) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600">
            Thông số khấu trừ gia công sản xuất (mm)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              type="number"
              step="0.1"
              label="Khấu trừ đố"
              placeholder="0"
              {...register('deductMullionMm')}
            />
            <Input
              type="number"
              step="0.1"
              label="Khấu trừ cánh"
              placeholder="0"
              {...register('deductSashMm')}
            />
            <Input
              type="number"
              step="0.1"
              label="Khấu trừ nẹp"
              placeholder="0"
              {...register('deductBeadMm')}
            />
            <Input
              type="number"
              step="0.1"
              label="Khấu trừ kính"
              placeholder="0"
              {...register('deductGlassMm')}
            />
          </div>
        </div>

        {/* Trạng thái hoạt động */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 pt-1">
          <input
            type="checkbox"
            {...register('isActive')}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
          />
          <span className="font-semibold">Kích hoạt hoạt động thanh profile này</span>
        </label>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isPending} className="px-5 font-semibold">
            {isEdit ? 'Lưu thay đổi' : 'Thêm thanh profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
