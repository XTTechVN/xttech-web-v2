'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createGasket, updateGasket } from '@/actions';
import type { Gasket, GasketCreate } from '@/types';

export interface GasketModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasket?: Gasket | null;
}

const DEFAULT_GASKET_VALUES: GasketCreate = {
  code: '',
  name: '',
  unit: 'm',
  pricePerUnit: 4500,
  isActive: true,
};

export function GasketModal({ isOpen, onClose, gasket }: GasketModalProps) {
  const isEdit = Boolean(gasket);
  const { register, handleSubmit, reset } = useForm<GasketCreate>({
    defaultValues: DEFAULT_GASKET_VALUES,
  });

  useEffect(() => {
    if (gasket) {
      reset({
        code: gasket.code,
        name: gasket.name,
        unit: gasket.unit,
        pricePerUnit: gasket.pricePerUnit,
        isActive: gasket.isActive,
      });
    } else {
      reset(DEFAULT_GASKET_VALUES);
    }
  }, [gasket, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GasketCreate) => {
      data.pricePerUnit = Number(data.pricePerUnit);
      if (isEdit && gasket) {
        return updateGasket(gasket.id, data);
      }
      return createGasket(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaskets'] });
      toast.success(isEdit ? 'Cập nhật vật tư thành công' : 'Thêm vật tư thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa thông tin vật tư' : 'Thêm gioăng ron / keo mới'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <Input
          label="Mã hiệu vật tư *"
          placeholder="VD: RON_EPDM_KHUNG"
          {...register('code', { required: true })}
        />
        <Input
          label="Tên vật tư *"
          placeholder="VD: Gioăng cao su EPDM chèn khung"
          {...register('name', { required: true })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Đơn vị tính</label>
            <select
              {...register('unit')}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
            >
              <option value="m">Mét dài (m)</option>
              <option value="bottle">Chai keo (bottle)</option>
              <option value="pcs">Cái (pcs)</option>
              <option value="roll">Cuộn (roll)</option>
              <option value="set">Bộ (set)</option>
            </select>
          </div>
          <Input
            label="Đơn giá (VND) *"
            type="number"
            step="100"
            placeholder="4500"
            {...register('pricePerUnit', { required: true })}
          />
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

