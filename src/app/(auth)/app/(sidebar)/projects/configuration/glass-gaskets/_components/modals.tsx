'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Button } from '@/components';
import { useMutation } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';
import { createGlass, updateGlass, createGlassCategory, updateGlassCategory, createGasket, updateGasket, } from '@/actions';
import type { Glass, GlassCreate, GlassCategory, GlassCategoryCreate, Gasket, GasketCreate, } from '@/types';

const GLASS_TYPE_LABELS: Record<string, string> = {
  cuong_luc: 'Kính tôi cường lực',
  dan_an_toan: 'Kính dán an toàn PVB',
  kinh_hop: 'Kính hộp cách âm',
  trang: 'Kính sống/phôi nổi',
  panel_alu: 'Tấm Panel nhôm Alu/EPS',
  luoi_muoi: 'Lưới inox chống muỗi',
  nan_chop: 'Nan chớp nhôm thông gió',
  tam_to_ong: 'Tấm nhôm tổ ong (Honeycomb)',
  kinh_hop_rem: 'Kính hộp rèm cách âm',
  polycarbonate: 'Tấm Polycarbonate',
};

// ==========================================
// 1. GLASS MODAL (Tạo / Sửa Quy cách kính)
// ==========================================
interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  glass?: Glass | null;
  categories: GlassCategory[];
}

export function GlassModal({ isOpen, onClose, glass, categories }: GlassModalProps) {
  const isEdit = Boolean(glass);
  const { register, handleSubmit, reset, watch, setValue } = useForm<GlassCreate>({
    defaultValues: {
      categoryId: categories[0]?.id,
      code: '',
      name: '',
      glassType: 'cuong_luc',
      thicknessMm: 8.0,
      unitPrice: 250000,
      weightPerM2: 20.0,
      maxWidthMm: 2400,
      maxHeightMm: 3600,
      isActive: true,
    },
  });

  const currentGlassType = watch('glassType');
  const thicknessValue = watch('thicknessMm');
  const currentWeight = watch('weightPerM2');

  const handleCategoryChange = (catId: number) => {
    setValue('categoryId', catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      if (cat.code === 'PANEL_ALU') {
        setValue('glassType', 'panel_alu');
        if (!isEdit) {
          setValue('thicknessMm', 3.0);
          setValue('weightPerM2', 3.8);
          setValue('unitPrice', 380000);
        }
      } else if (cat.code === 'LUOI_MUOI') {
        setValue('glassType', 'luoi_muoi');
        if (!isEdit) {
          setValue('thicknessMm', 0.8);
          setValue('weightPerM2', 1.2);
          setValue('unitPrice', 180000);
        }
      } else if (cat.code === 'NAN_CHOP') {
        setValue('glassType', 'nan_chop');
        if (!isEdit) {
          setValue('thicknessMm', 1.2);
          setValue('weightPerM2', 2.8);
          setValue('unitPrice', 320000);
        }
      } else if (cat.code === 'KINH_DAN_AN_TOAN') {
        setValue('glassType', 'dan_an_toan');
        if (!isEdit) {
          setValue('thicknessMm', 6.38);
          setValue('weightPerM2', 15.5);
        }
      } else if (cat.code === 'KINH_HOP') {
        setValue('glassType', 'kinh_hop');
        if (!isEdit) {
          setValue('thicknessMm', 19.0);
          setValue('weightPerM2', 25.0);
        }
      } else if (cat.code === 'TAM_TO_ONG') {
        setValue('glassType', 'tam_to_ong');
        if (!isEdit) {
          setValue('thicknessMm', 10.0);
          setValue('weightPerM2', 4.5);
          setValue('unitPrice', 550000);
        }
      } else if (cat.code === 'KINH_HOP_REM') {
        setValue('glassType', 'kinh_hop_rem');
        if (!isEdit) {
          setValue('thicknessMm', 21.0);
          setValue('weightPerM2', 28.0);
          setValue('unitPrice', 1200000);
        }
      } else if (cat.code === 'KINH_CUONG_LUC') {
        setValue('glassType', 'cuong_luc');
        if (!isEdit) {
          setValue('thicknessMm', 8.0);
          setValue('weightPerM2', 20.0);
        }
      }
    }
  };

  useEffect(() => {
    // Tự động gợi ý khối lượng nếu người dùng chưa nhập hoặc đang để 0
    if (thicknessValue && (!currentWeight || currentWeight === 0)) {
      if (currentGlassType === 'panel_alu') {
        setValue('weightPerM2', 3.8);
      } else if (currentGlassType === 'luoi_muoi') {
        setValue('weightPerM2', 1.2);
      } else if (currentGlassType === 'nan_chop') {
        setValue('weightPerM2', 2.8);
      } else if (currentGlassType === 'tam_to_ong') {
        setValue('weightPerM2', 4.5);
      } else if (currentGlassType === 'kinh_hop_rem') {
        setValue('weightPerM2', 28.0);
      } else {
        const w = Math.round(Number(thicknessValue) * 2.5 * 100) / 100;
        setValue('weightPerM2', w);
      }
    }
  }, [thicknessValue, currentWeight, currentGlassType, setValue]);

  useEffect(() => {
    if (glass) {
      reset({
        categoryId: glass.categoryId,
        code: glass.code,
        name: glass.name,
        glassType: glass.glassType,
        thicknessMm: glass.thicknessMm,
        unitPrice: glass.unitPrice,
        weightPerM2: Number(glass.weightPerM2) || Math.round(glass.thicknessMm * 2.5 * 100) / 100,
        maxWidthMm: glass.maxWidthMm || 2400,
        maxHeightMm: glass.maxHeightMm || 3600,
        isActive: glass.isActive,
      });
    } else {
      reset({
        categoryId: categories[0]?.id,
        code: '',
        name: '',
        glassType: 'cuong_luc',
        thicknessMm: 8.0,
        unitPrice: 250000,
        weightPerM2: 20.0,
        maxWidthMm: 2400,
        maxHeightMm: 3600,
        isActive: true,
      });
    }
  }, [glass, categories, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GlassCreate) => {
      const targetCatId = Number(data.categoryId) || categories[0]?.id;
      if (!targetCatId) {
        throw new Error('Vui lòng chọn hoặc tạo nhóm chủng loại kính trước');
      }
      data.categoryId = targetCatId;
      const targetCat = categories.find((c) => c.id === targetCatId);
      if (targetCat) {
        if (targetCat.code === 'PANEL_ALU') data.glassType = 'panel_alu';
        else if (targetCat.code === 'LUOI_MUOI') data.glassType = 'luoi_muoi';
        else if (targetCat.code === 'NAN_CHOP') data.glassType = 'nan_chop';
        else if (targetCat.code === 'TAM_TO_ONG') data.glassType = 'tam_to_ong';
        else if (targetCat.code === 'KINH_HOP_REM') data.glassType = 'kinh_hop_rem';
        else if (targetCat.code === 'KINH_DAN_AN_TOAN') data.glassType = 'dan_an_toan';
        else if (targetCat.code === 'KINH_HOP') data.glassType = 'kinh_hop';
        else if (!data.glassType) data.glassType = 'cuong_luc';
      }

      data.thicknessMm = Number(data.thicknessMm);
      data.unitPrice = Number(data.unitPrice);
      data.weightPerM2 = Number(data.weightPerM2 !== undefined && data.weightPerM2 !== null ? data.weightPerM2 : Math.round(data.thicknessMm * 2.5 * 100) / 100);
      data.maxWidthMm = data.maxWidthMm ? Number(data.maxWidthMm) : undefined;
      data.maxHeightMm = data.maxHeightMm ? Number(data.maxHeightMm) : undefined;

      if (isEdit && glass) {
        return await updateGlass(glass.id, data);
      }
      return await createGlass(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
      toast.success(isEdit ? 'Cập nhật quy cách thành công' : 'Thêm quy cách mới thành công');
      onClose();
    },
    onError: (err) => showErrorToast(err, isEdit ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa quy cách vật tư tấm' : 'Thêm quy cách vật tư tấm (Kính / Panel / Lưới muỗi)'}
      size="md"
    >
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-700">Nhóm chủng loại *</label>
            <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
              Bản chất: {(currentGlassType && GLASS_TYPE_LABELS[currentGlassType]) || currentGlassType || 'Kính tôi cường lực'}
            </span>
          </div>
          <select
            value={watch('categoryId') || categories[0]?.id || ''}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Mã hiệu *"
            placeholder="VD: T_8MM_CL, LUOI_MUOI_INOX"
            {...register('code', { required: true })}
          />
          <Input
            label="Tên quy cách vật tư *"
            placeholder="VD: Kính trắng 8mm CL, Lưới chống muỗi inox"
            {...register('name', { required: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Độ dày tấm (mm) *"
            type="number"
            step="0.01"
            placeholder="8.0"
            {...register('thicknessMm', { required: true })}
          />
          <Input
            label="Đơn giá xuất xưởng (đ/m²) *"
            type="number"
            step="1000"
            placeholder="250000"
            {...register('unitPrice', { required: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Khối lượng tấm (kg/m²)"
            type="number"
            step="0.01"
            placeholder="20.0"
            {...register('weightPerM2')}
          />
          <div className="flex flex-col justify-center">
            <span className="text-[11px] text-gray-500 italic mt-4">
              * Khối lượng tự động gợi ý theo loại vật liệu (hoặc = độ dày &times; 2.5 với kính).
            </span>
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
// 2. GASKET MODAL (Tạo / Sửa Gioăng Ron & Keo)
// ==========================================
interface GasketModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasket?: Gasket | null;
}

export function GasketModal({ isOpen, onClose, gasket }: GasketModalProps) {
  const isEdit = Boolean(gasket);
  const { register, handleSubmit, reset } = useForm<GasketCreate>({
    defaultValues: {
      code: '',
      name: '',
      unit: 'm',
      pricePerUnit: 4500,
      isActive: true,
    },
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
      reset({
        code: '',
        name: '',
        unit: 'm',
        pricePerUnit: 4500,
        isActive: true,
      });
    }
  }, [gasket, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GasketCreate) => {
      data.pricePerUnit = Number(data.pricePerUnit);
      if (isEdit && gasket) {
        return await updateGasket(gasket.id, data);
      }
      return await createGasket(data);
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

// ==========================================
// 3. GLASS CATEGORY MODAL (Nhóm chủng loại kính & vật tư tấm)
// ==========================================
interface GlassCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: GlassCategory | null;
}

export function GlassCategoryModal({ isOpen, onClose, category }: GlassCategoryModalProps) {
  const isEdit = Boolean(category);

  const { register, handleSubmit, reset } = useForm<GlassCategoryCreate>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        code: category.code,
        name: category.name,
        description: category.description || '',
        isActive: category.isActive,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [category, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GlassCategoryCreate) => {
      if (isEdit && category) {
        return await updateGlassCategory(category.id, {
          code: data.code,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        });
      }
      return await createGlassCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glass-categories'] });
      toast.success(isEdit ? 'Cập nhật nhóm chủng loại thành công' : 'Thêm nhóm chủng loại mới thành công');
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
        <Input
          label="Mã nhóm chủng loại *"
          placeholder="VD: PANEL_ALU, LUOI_MUOI, KINH_CUONG_LUC"
          {...register('code', { required: true })}
        />
        <Input
          label="Tên nhóm chủng loại *"
          placeholder="VD: Tấm Panel nhôm & Alu, Lưới inox chống muỗi"
          {...register('name', { required: true })}
        />
        <Input
          label="Mô tả / Ứng dụng"
          placeholder="VD: Dùng cho vách ngăn phòng, cửa đi pano, chống côn trùng..."
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

