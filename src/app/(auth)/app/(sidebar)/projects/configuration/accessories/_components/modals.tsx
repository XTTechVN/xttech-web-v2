'use client';

import { useEffect, useState } from 'react';
import { Input, Button, Modal, Select, CurrencyInput } from '@/components';
import { CheckCircle2, Upload, Plus, Package, BadgePercent } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { createAccessory, updateAccessory, getAccessoryCategories, getBrands } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Accessory, AccessoryCreate, AccessoryUpdate, AccessoryCategory } from '@/types';
import { AccessoryCategoryModal } from './category-modal';
import { BrandModal } from '../../aluminum/_components/modals';
import { showErrorToast, getFileUrl } from '@/utils';

const ACCESSORY_COLOR_OPTIONS = [
  { value: 'black', label: 'Đen tuyền (Black)' },
  { value: 'white', label: 'Trắng sứ (White)' },
  { value: 'silver', label: 'Bạc ánh kim (Silver)' },
  { value: 'gold', label: 'Vàng champagne (Gold)' },
  { value: 'grey', label: 'Xám ghi (Grey)' },
  { value: 'brown', label: 'Nâu cafe (Brown)' },
];

const ACCESSORY_UNIT_OPTIONS = [
  { value: 'pcs', label: 'Cái (pcs)' },
  { value: 'set', label: 'Bộ (set)' },
  { value: 'unit', label: 'Chiếc (unit)' },
  { value: 'pair', label: 'Đôi / Cặp (pair)' },
  { value: 'roll', label: 'Cuộn (roll)' },
  { value: 'box', label: 'Hộp (box)' },
  { value: 'meter', label: 'Mét (meter)' },
  { value: 'sheet', label: 'Tấm (sheet)' },
];

// ==========================================
// 1. MODAL TẠO MỚI PHỤ KIỆN (AccessoryCreate)
// ==========================================
interface AccessoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
}

type AccessoryCreateFormValues = Omit<AccessoryCreate, 'imagePath'>;

export function AccessoryCreateModal({ isOpen, onClose, title, submitText = 'Xác nhận tạo' }: AccessoryCreateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccessoryCreateFormValues>({
    defaultValues: {
      name: '',
      code: '',
      categoryId: null,
      brandId: null,
      color: 'black',
      specification: '',
      unit: 'pcs',
      unitPrice: 0,
      costPrice: 0,
      retailPrice: 0,
      salePrice: 0,
      isActive: true,
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);

  const { data: categoryData } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => {
      const res = await getAccessoryCategories({ limit: 9999 });
      return res.items;
    },
    enabled: isOpen,
  });

  const { data: brandData } = useQuery({
    queryKey: ['brands-dropdown-accessories'],
    queryFn: async () => {
      const res = await getBrands({ limit: 9999 });
      return res.items;
    },
    enabled: isOpen,
  });

  const categoriesList: AccessoryCategory[] = Array.isArray(categoryData)
    ? categoryData
    : (categoryData as unknown as { items?: AccessoryCategory[] })?.items || [];

  const categoryOptions = [
    { value: '', label: 'Không chọn loại' },
    ...categoriesList.map((cat) => ({
      value: String(cat.id),
      label: `${cat.name} (${cat.code})`,
    })),
  ];

  const brandOptions = [
    { value: '', label: 'Không chọn thương hiệu' },
    ...(brandData?.map((b) => ({
      value: String(b.id),
      label: `${b.name} (${b.code})`,
    })) || []),
  ];

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createAccessory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Thêm phụ kiện thành công');
      onClose();
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      showErrorToast(error, 'Thêm phụ kiện thất bại');
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        code: '',
        categoryId: null,
        brandId: null,
        color: 'black',
        specification: '',
        unit: 'pcs',
        unitPrice: 0,
        costPrice: 0,
        retailPrice: 0,
        salePrice: 0,
        isActive: true,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleConfirm = (data: AccessoryCreateFormValues) => {
    const payload: AccessoryCreate = {
      name: data.name,
      unitPrice: Number(data.unitPrice) || 0,
      costPrice: Number(data.costPrice) || 0,
      retailPrice: Number(data.retailPrice) || 0,
      salePrice: Number(data.salePrice) || 0,
      color: data.color || 'black',
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
    if (data.code && data.code.trim() !== '') {
      payload.code = data.code.trim();
    }
    if (data.specification && data.specification.trim() !== '') {
      payload.specification = data.specification.trim();
    }
    if (data.unit && data.unit.trim() !== '') {
      payload.unit = data.unit.trim();
    }
    if (data.categoryId) {
      payload.categoryId = Number(data.categoryId);
    }
    if (data.brandId) {
      payload.brandId = Number(data.brandId);
    }
    createMutation({
      data: payload,
      file: selectedFile || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-4xl w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Cột trái: Ảnh & Thuộc tính bổ trợ (4/12 columns) */}
          <div className="md:col-span-4 flex flex-col gap-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-700 select-none self-start">Ảnh minh họa</span>
              <div className="w-full aspect-4/3 max-h-36 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-white flex items-center justify-center relative group shadow-2xs">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Package className="w-8 h-8 text-slate-300" />
                    <span className="text-[11px] font-medium">Chưa có ảnh</span>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs w-full justify-center">
                <Upload size={13} />
                <span>{previewUrl ? 'Thay đổi ảnh' : 'Chọn ảnh tải lên'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </label>
              {selectedFile && (
                <span className="text-[11px] text-primary font-medium truncate max-w-full text-center">
                  {selectedFile.name}
                </span>
              )}
            </div>

            <div className="border-t border-slate-200/80 pt-3 flex flex-col gap-3">
              <Select
                label="Màu sắc phụ kiện"
                placeholder="Chọn màu sắc"
                fullWidth
                value={watch('color') || 'black'}
                {...register('color')}
                options={ACCESSORY_COLOR_OPTIONS}
              />

              <Select
                label="Đơn vị tính *"
                placeholder="Chọn ĐVT"
                fullWidth
                value={watch('unit') || 'pcs'}
                {...register('unit', { required: true })}
                options={ACCESSORY_UNIT_OPTIONS}
                error={errors.unit ? 'Vui lòng chọn đơn vị tính' : undefined}
              />

              {/* Trạng thái phân phối */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Trạng thái</span>
                  <span className={`text-[11px] font-semibold ${watch('isActive') !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {watch('isActive') !== false ? '● Đang kinh doanh' : '○ Tạm ngưng'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="create_is_active"
                  {...register('isActive')}
                  className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin định danh & Chính sách giá (8/12 columns) */}
          <div className="md:col-span-8 flex flex-col gap-3.5">
            {/* Tên phụ kiện */}
            <Input
              label="Tên phụ kiện *"
              placeholder="Nhập tên phụ kiện (VD: Bản lề chữ A 12 inch Inox 304)"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên phụ kiện không được để trống' : undefined}
            />

            {/* Mã & Thương hiệu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mã phụ kiện *"
                placeholder="VD: BL_CHU_A_12"
                fullWidth
                {...register('code', { required: true })}
                error={errors.code ? 'Mã phụ kiện không được để trống' : undefined}
              />
              <div className="flex items-end gap-1.5">
                <div className="flex-1 min-w-0">
                  <Select
                    label="Hãng sản xuất"
                    placeholder="Chọn hãng"
                    fullWidth
                    value={watch('brandId') ? String(watch('brandId')) : ''}
                    {...register('brandId')}
                    options={brandOptions}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(true)}
                  title="Thêm nhanh thương hiệu"
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer shrink-0 mb-0.5"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Loại phụ kiện & Thông số kỹ thuật */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-end gap-1.5">
                <div className="flex-1 min-w-0">
                  <Select
                    label="Loại phụ kiện"
                    placeholder="Chọn loại"
                    fullWidth
                    value={watch('categoryId') ? String(watch('categoryId')) : ''}
                    {...register('categoryId')}
                    options={categoryOptions}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  title="Thêm nhanh loại phụ kiện"
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer shrink-0 mb-0.5"
                >
                  <Plus size={18} />
                </button>
              </div>

              <Input
                label="Thông số kỹ thuật"
                placeholder="VD: Inox 304, góc mở 90°, tải 45kg..."
                fullWidth
                {...register('specification')}
                error={errors.specification ? 'Thông số không hợp lệ' : undefined}
              />
            </div>

            {/* Khối chính sách giá */}
            <div className="p-3 bg-slate-50/90 border border-slate-200/90 rounded-2xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BadgePercent size={14} className="text-primary" />
                  Chính sách giá & Chiết khấu (VNĐ)
                </span>
                <span className="text-[11px] text-slate-500 italic">Đơn giá chuẩn dùng làm cơ sở tính Combo</span>
              </div>

              <div>
                <Controller
                  name="unitPrice"
                  control={control}
                  rules={{
                    validate: (val) => {
                      const num = Number(val);
                      if (isNaN(num) || num < 0) return 'Đơn giá phải lớn hơn hoặc bằng 0';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Đơn giá niêm yết chuẩn *"
                      placeholder="Nhập đơn giá chuẩn"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.unitPrice?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/70">
                <Controller
                  name="costPrice"
                  control={control}
                  rules={{
                    validate: (val) => {
                      const num = Number(val);
                      if (isNaN(num) || num < 0) return 'Giá vốn >= 0';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Giá vốn"
                      placeholder="0"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.costPrice?.message}
                    />
                  )}
                />
                <Controller
                  name="retailPrice"
                  control={control}
                  rules={{
                    validate: (val) => {
                      const num = Number(val);
                      if (isNaN(num) || num < 0) return 'Giá bán lẻ >= 0';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Giá bán lẻ"
                      placeholder="0"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.retailPrice?.message}
                    />
                  )}
                />
                <Controller
                  name="salePrice"
                  control={control}
                  rules={{
                    validate: (val) => {
                      const num = Number(val);
                      if (isNaN(num) || num < 0) return 'Giá đại lý >= 0';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Giá đại lý"
                      placeholder="0"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.salePrice?.message}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end w-full mt-5 pt-3.5 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={16} />} type="submit" disabled={isCreating} loading={isCreating}>
            {submitText}
          </Button>
        </div>
      </form>

      {/* Modal thêm nhanh loại phụ kiện */}
      <AccessoryCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccessCreated={(newCat) => {
          setValue('categoryId', newCat.id);
          setIsAddCategoryOpen(false);
        }}
      />

      {/* Modal thêm nhanh thương hiệu */}
      <BrandModal
        isOpen={isAddBrandOpen}
        onClose={() => {
          setIsAddBrandOpen(false);
          queryClient.invalidateQueries({ queryKey: ['brands-dropdown-accessories'] });
        }}
      />
    </Modal>
  );
}

// ==========================================
// 2. MODAL CẬP NHẬT PHỤ KIỆN (AccessoryUpdate)
// ==========================================
interface AccessoryUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Pick<
    Accessory,
    | 'id'
    | 'name'
    | 'code'
    | 'categoryId'
    | 'brandId'
    | 'specification'
    | 'unit'
    | 'unitPrice'
    | 'color'
    | 'costPrice'
    | 'retailPrice'
    | 'salePrice'
    | 'imagePath'
    | 'isActive'
  >;
}

type AccessoryUpdateFormValues = Omit<AccessoryUpdate, 'imagePath'>;

export function AccessoryUpdateModal({ isOpen, onClose, title, submitText = 'Xác nhận lưu', initialData }: AccessoryUpdateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccessoryUpdateFormValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);

  const { data: categoryData } = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => {
      const res = await getAccessoryCategories({ limit: 9999 });
      return res.items;
    },
    enabled: isOpen,
  });

  const { data: brandData } = useQuery({
    queryKey: ['brands-dropdown-accessories'],
    queryFn: async () => {
      const res = await getBrands({ limit: 9999 });
      return res.items;
    },
    enabled: isOpen,
  });

  const categoriesList: AccessoryCategory[] = Array.isArray(categoryData)
    ? categoryData
    : (categoryData as unknown as { items?: AccessoryCategory[] })?.items || [];

  const categoryOptions = [
    { value: '', label: 'Không chọn loại' },
    ...categoriesList.map((cat) => ({
      value: String(cat.id),
      label: `${cat.name} (${cat.code})`,
    })),
  ];

  const brandOptions = [
    { value: '', label: 'Không chọn thương hiệu' },
    ...(brandData?.map((b) => ({
      value: String(b.id),
      label: `${b.name} (${b.code})`,
    })) || []),
  ];

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data, file }: { id: number; data: AccessoryUpdate; file?: File }) => updateAccessory(id, { data, file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast.success('Cập nhật phụ kiện thành công');
      onClose();
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      showErrorToast(error, 'Cập nhật phụ kiện thất bại');
    },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name || '',
        code: initialData.code || '',
        categoryId: initialData.categoryId !== undefined ? initialData.categoryId : null,
        brandId: initialData.brandId !== undefined ? initialData.brandId : null,
        specification: initialData.specification || '',
        unit: initialData.unit || 'pcs',
        unitPrice: initialData.unitPrice !== undefined ? initialData.unitPrice : 0,
        color: initialData.color || 'black',
        costPrice: initialData.costPrice !== undefined ? initialData.costPrice : 0,
        retailPrice: initialData.retailPrice !== undefined ? initialData.retailPrice : 0,
        salePrice: initialData.salePrice !== undefined ? initialData.salePrice : 0,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setSelectedFile(null);
      setPreviewUrl(getFileUrl(initialData.imagePath) || null);
    }
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleConfirm = (data: AccessoryUpdateFormValues) => {
    if (!initialData) return;
    const payload: AccessoryUpdate = {
      name: data.name,
      code: data.code,
      unit: data.unit,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      brandId: data.brandId ? Number(data.brandId) : null,
      color: data.color || 'black',
      specification: data.specification?.trim() || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    if (data.unitPrice !== undefined) {
      payload.unitPrice = Number(data.unitPrice);
    }
    if (data.costPrice !== undefined) {
      payload.costPrice = Number(data.costPrice);
    }
    if (data.retailPrice !== undefined) {
      payload.retailPrice = Number(data.retailPrice);
    }
    if (data.salePrice !== undefined) {
      payload.salePrice = Number(data.salePrice);
    }

    updateMutation({
      id: initialData.id,
      data: payload,
      file: selectedFile || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-4xl w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Cột trái: Ảnh & Thuộc tính bổ trợ (4/12 columns) */}
          <div className="md:col-span-4 flex flex-col gap-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-700 select-none self-start">Ảnh minh họa</span>
              <div className="w-full aspect-4/3 max-h-36 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-white flex items-center justify-center relative group shadow-2xs">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Package className="w-8 h-8 text-slate-300" />
                    <span className="text-[11px] font-medium">Chưa có ảnh</span>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs w-full justify-center">
                <Upload size={13} />
                <span>{previewUrl ? 'Thay đổi ảnh' : 'Chọn ảnh tải lên'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </label>
              <span className="text-[11px] text-gray-500 truncate max-w-full text-center">
                {selectedFile ? selectedFile.name : 'Chưa chọn ảnh mới'}
              </span>
            </div>

            <div className="border-t border-slate-200/80 pt-3 flex flex-col gap-3">
              <Select
                label="Màu sắc phụ kiện"
                placeholder="Chọn màu sắc"
                fullWidth
                value={watch('color') || 'black'}
                {...register('color')}
                options={ACCESSORY_COLOR_OPTIONS}
              />

              <Select
                label="Đơn vị tính *"
                placeholder="Chọn ĐVT"
                fullWidth
                value={watch('unit') || 'pcs'}
                {...register('unit', { required: true })}
                options={ACCESSORY_UNIT_OPTIONS}
                error={errors.unit ? 'Vui lòng chọn đơn vị tính' : undefined}
              />

              {/* Trạng thái phân phối */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Trạng thái</span>
                  <span className={`text-[11px] font-semibold ${watch('isActive') !== false ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {watch('isActive') !== false ? '● Đang kinh doanh' : '○ Tạm ngưng'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="update_is_active"
                  {...register('isActive')}
                  className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin định danh & Chính sách giá (8/12 columns) */}
          <div className="md:col-span-8 flex flex-col gap-3.5">
            {/* Tên phụ kiện */}
            <Input
              label="Tên phụ kiện *"
              placeholder="Nhập tên phụ kiện (VD: Bản lề chữ A 12 inch Inox 304)"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên phụ kiện không được để trống' : undefined}
            />

            {/* Mã & Thương hiệu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mã phụ kiện *"
                placeholder="VD: BL_CHU_A_12"
                fullWidth
                {...register('code', { required: true })}
                error={errors.code ? 'Mã phụ kiện không được để trống' : undefined}
              />
              <div className="flex items-end gap-1.5">
                <div className="flex-1 min-w-0">
                  <Select
                    label="Hãng sản xuất"
                    placeholder="Chọn hãng"
                    fullWidth
                    value={watch('brandId') ? String(watch('brandId')) : ''}
                    {...register('brandId')}
                    options={brandOptions}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(true)}
                  title="Thêm nhanh thương hiệu"
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer shrink-0 mb-0.5"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Loại phụ kiện & Thông số kỹ thuật */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-end gap-1.5">
                <div className="flex-1 min-w-0">
                  <Select
                    label="Loại phụ kiện"
                    placeholder="Chọn loại"
                    fullWidth
                    value={watch('categoryId') ? String(watch('categoryId')) : ''}
                    {...register('categoryId')}
                    options={categoryOptions}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  title="Thêm nhanh loại phụ kiện"
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer shrink-0 mb-0.5"
                >
                  <Plus size={18} />
                </button>
              </div>

              <Input
                label="Thông số kỹ thuật"
                placeholder="VD: Inox 304, góc mở 90°, tải 45kg..."
                fullWidth
                {...register('specification')}
                error={errors.specification ? 'Thông số không hợp lệ' : undefined}
              />
            </div>

            {/* Khối chính sách giá */}
            <div className="p-3 bg-slate-50/90 border border-slate-200/90 rounded-2xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BadgePercent size={14} className="text-primary" />
                  Chính sách giá & Chiết khấu (VNĐ)
                </span>
                <span className="text-[11px] text-slate-500 italic">Đơn giá chuẩn dùng làm cơ sở tính Combo</span>
              </div>

              <div>
                <Controller
                  name="unitPrice"
                  control={control}
                  rules={{
                    validate: (val) => {
                      const num = Number(val);
                      if (isNaN(num) || num < 0) return 'Đơn giá phải lớn hơn hoặc bằng 0';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Đơn giá niêm yết chuẩn *"
                      placeholder="Nhập đơn giá chuẩn"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.unitPrice?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/70">
                <Controller
                  name="costPrice"
                  control={control}
                  rules={{
                    validate: (val) => {
                      const num = Number(val);
                      if (isNaN(num) || num < 0) return 'Giá vốn >= 0';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Giá vốn"
                      placeholder="0"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.costPrice?.message}
                    />
                  )}
                />
                <Controller
                  name="retailPrice"
                  control={control}
                  rules={{
                    validate: (val) => {
                      const num = Number(val);
                      if (isNaN(num) || num < 0) return 'Giá bán lẻ >= 0';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Giá bán lẻ"
                      placeholder="0"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.retailPrice?.message}
                    />
                  )}
                />
                <Controller
                  name="salePrice"
                  control={control}
                  rules={{
                    validate: (val) => {
                      const num = Number(val);
                      if (isNaN(num) || num < 0) return 'Giá đại lý >= 0';
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Giá đại lý"
                      placeholder="0"
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.salePrice?.message}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end w-full mt-5 pt-3.5 border-t border-gray-150">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            type="submit"
            disabled={updateIsPending}
            loading={updateIsPending}
          >
            {submitText}
          </Button>
        </div>
      </form>

      {/* Modal thêm nhanh loại phụ kiện */}
      <AccessoryCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccessCreated={(newCat) => {
          setValue('categoryId', newCat.id);
          setIsAddCategoryOpen(false);
        }}
      />

      {/* Modal thêm nhanh thương hiệu */}
      <BrandModal
        isOpen={isAddBrandOpen}
        onClose={() => {
          setIsAddBrandOpen(false);
          queryClient.invalidateQueries({ queryKey: ['brands-dropdown-accessories'] });
        }}
      />
    </Modal>
  );
}

// ==========================================
// 3. MODAL XÁC NHẬN XÓA PHỤ KIỆN
// ==========================================
interface AccessoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessoryName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function AccessoryDeleteModal({ isOpen, onClose, accessoryName, onConfirm, isPending = false }: AccessoryDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa phụ kiện" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa phụ kiện <strong className="text-gray-900 font-semibold">{accessoryName}</strong>?
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end w-full mt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isPending}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
