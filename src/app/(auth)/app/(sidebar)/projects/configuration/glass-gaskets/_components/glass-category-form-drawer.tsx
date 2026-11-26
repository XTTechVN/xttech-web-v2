'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components';
import { Button, Chip, DrawerBody, DrawerFooter, DrawerHeader, SideDrawer } from '@/components-remake';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createGlassCategory, updateGlassCategory } from '@/actions';
import type { GlassCategory, GlassCategoryCreate } from '@/types';

export interface GlassCategoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category?: GlassCategory | null;
}

const CATEGORY_FORM_ID = 'glass-category-form';
const TYPES = [
  { id: 'glass', label: 'Kính' },
  { id: 'panel', label: 'Tấm' },
  { id: 'screen_mesh', label: 'Lưới' },
] as const;

const DEFAULT_CATEGORY_VALUES: GlassCategoryCreate = {
  code: '',
  name: '',
  materialType: 'glass',
  description: '',
  isActive: true,
};

export function GlassCategoryFormDrawer({ isOpen, onClose, category }: GlassCategoryFormDrawerProps) {
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
      toast.success(isEdit ? 'Cập nhật nhóm chủng loại thành công' : 'Thêm nhóm chủng loại mới thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  const title = isEdit ? 'Sửa nhóm chủng loại' : 'Thêm nhóm chủng loại';
  const type = watch('materialType') || 'glass';

  return (
    <SideDrawer isOpen={isOpen} onClose={onClose} label={title}>
      <DrawerHeader compact title={title} onClose={onClose} />
      <DrawerBody>
        <form id={CATEGORY_FORM_ID} onSubmit={handleSubmit((d) => mutate(d))} className="flex w-full flex-col gap-4 py-4 md:w-96">
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500">Thuộc loại chính *</p>
            <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-2">
              {TYPES.map((t) => (
                <Chip key={t.id} selected={type === t.id} onClick={() => setValue('materialType', t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>
          <Input label="Mã nhóm *" placeholder="VD: KINH_CUONG_LUC" {...register('code', { required: true })} />
          <Input label="Tên nhóm *" placeholder="Tên nhóm chủng loại" {...register('name', { required: true })} />
          <Input label="Mô tả / ứng dụng" placeholder="Mô tả ngắn gọn..." {...register('description')} />
        </form>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="flex-1 md:flex-none" disabled={isPending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form={CATEGORY_FORM_ID} className="flex-1 md:flex-none" loading={isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </div>
      </DrawerFooter>
    </SideDrawer>
  );
}
