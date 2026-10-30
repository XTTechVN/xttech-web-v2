'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button, Select } from '@/components';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createDoorSeries, updateDoorSeries } from '@/actions';
import type { DoorSeries, DoorSeriesCreate, Brand } from '@/types';

interface SeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  series?: DoorSeries | null;
  brands: Brand[];
  defaultBrandId?: number | null;
}

export function SeriesModal({
  isOpen,
  onClose,
  series,
  brands,
  defaultBrandId,
}: SeriesModalProps) {
  const isEdit = Boolean(series);

  const { register, handleSubmit, reset, setValue } = useForm<DoorSeriesCreate>({
    defaultValues: {
      brandId: defaultBrandId || 0,
      code: '',
      name: '',
      aluminumThickness: 1.4,
      cornerJointType: 'ke_ep_goc',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (series) {
      reset({
        brandId: series.brandId,
        code: series.code,
        name: series.name,
        aluminumThickness: series.aluminumThickness ?? 1.4,
        cornerJointType: series.cornerJointType || 'ke_ep_goc',
        description: series.description || '',
        isActive: series.isActive,
      });
    } else {
      reset({
        brandId: defaultBrandId || (brands[0]?.id ?? 0),
        code: '',
        name: '',
        aluminumThickness: 1.4,
        cornerJointType: 'ke_ep_goc',
        description: '',
        isActive: true,
      });
    }
  }, [isOpen, series, defaultBrandId]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: DoorSeriesCreate) => {
      const payload: DoorSeriesCreate = {
        ...data,
        brandId: Number(data.brandId),
        aluminumThickness: data.aluminumThickness ? Number(data.aluminumThickness) : undefined,
      };

      if (isEdit && series) {
        return await updateDoorSeries(series.id, payload);
      }
      return await createDoorSeries(payload);
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
      title={isEdit ? 'Sửa thông tin hệ nhôm' : 'Thêm hệ nhôm mới'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        {/* Chọn Hãng nhôm */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Hãng nhôm sản xuất *
          </label>
          <select
            {...register('brandId', { required: true, valueAsNumber: true })}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">-- Chọn thương hiệu --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        {/* Mã & Tên hệ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Mã hệ nhôm *"
            placeholder="VD: XINGFA_55"
            {...register('code', { required: true })}
          />
          <Input
            label="Tên hệ nhôm *"
            placeholder="VD: Hệ 55 vát cạnh"
            {...register('name', { required: true })}
          />
        </div>

        {/* Độ dày & Kiểu liên kết góc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="number"
            step="0.1"
            label="Độ dày nhôm (mm)"
            placeholder="1.4"
            {...register('aluminumThickness')}
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Kiểu liên kết góc
            </label>
            <select
              {...register('cornerJointType')}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="ke_ep_goc">Ke ép góc</option>
              <option value="ke_vinh_cuu">Ke vĩnh cửu</option>
              <option value="ke_nhay">Ke nhảy</option>
              <option value="ke_bat_vit">Ke bắt vít</option>
            </select>
          </div>
        </div>

        <Input
          label="Mô tả / Ghi chú"
          placeholder="Ghi chú về ứng dụng cửa đi, cửa sổ của hệ này..."
          {...register('description')}
        />

        {/* Trạng thái */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <input
            type="checkbox"
            id="series-isActive"
            {...register('isActive')}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
          />
          <label htmlFor="series-isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
            Kích hoạt hoạt động
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
