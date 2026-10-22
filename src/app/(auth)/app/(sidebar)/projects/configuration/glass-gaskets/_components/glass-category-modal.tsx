'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createGlassCategory, updateGlassCategory } from '@/actions';
import type { GlassCategory, GlassCategoryCreate } from '@/types';

export interface GlassCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: GlassCategory | null;
}

const DEFAULT_CATEGORY_VALUES: GlassCategoryCreate = {
  code: '',
  name: '',
  materialType: 'glass',
  description: '',
  isActive: true,
};

export function GlassCategoryModal({ isOpen, onClose, category }: GlassCategoryModalProps) {
  const isEdit = Boolean(category);

  const { register, handleSubmit, reset, watch, setValue } = useForm<GlassCategoryCreate>({
    defaultValues: DEFAULT_CATEGORY_VALUES,
  });

  useEffect(() => {
    if (category) {
      reset({
        code: category.code,
        name: category.name,
        materialType: category.materialType || 'glass',
        description: category.description || '',
        isActive: category.isActive,
      });
    } else {
      reset(DEFAULT_CATEGORY_VALUES);
    }
  }, [category, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GlassCategoryCreate) => {
      if (isEdit && category) {
        return updateGlassCategory(category.id, {
          code: data.code,
          name: data.name,
          materialType: data.materialType,
          description: data.description,
          isActive: data.isActive,
        });
      }
      return createGlassCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glass-categories'] });
      toast.success(
        isEdit ? 'Cập nhật nhóm chủng loại thành công' : 'Thêm nhóm chủng loại mới thành công',
      );
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa nhóm chủng loại vật tư tấm' : 'Thêm nhóm chủng loại vật tư tấm mới'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Thuộc loại chính *</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'glass', label: 'Kính' },
                { id: 'panel', label: 'Tấm' },
                { id: 'screen_mesh', label: 'Lưới' },
              ] as const
            ).map((t) => {
              const isSelected = (watch('materialType') || 'glass') === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setValue('materialType', t.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Mã nhóm chủng loại *"
          placeholder="Mã nhóm (VD: KINH_CUONG_LUC)"
          {...register('code', { required: true })}
        />
        <Input
          label="Tên nhóm chủng loại *"
          placeholder="Tên nhóm chủng loại"
          {...register('name', { required: true })}
        />
        <Input
          label="Mô tả / Ứng dụng"
          placeholder="Mô tả ngắn gọn hoặc ứng dụng..."
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

