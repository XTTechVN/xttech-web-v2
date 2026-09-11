'use client';

import { useEffect } from 'react';
import { Input, Button, Modal, CurrencyInput, Select } from '@/components';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { createMaterial, updateMaterial, getMaterial } from '@/actions';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import type { Material, MaterialCreate, MaterialUpdate, MaterialPriceCreate } from '@/types';

// ==========================================
// 1. MODAL TẠO MỚI HỆ NHÔM (MaterialCreate)
// ==========================================
interface MaterialCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
}

type MaterialCreateFormValues = Omit<MaterialCreate, 'imagePath'>;

export function MaterialCreateModal({ isOpen, onClose, title, submitText = 'Xác nhận tạo' }: MaterialCreateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<MaterialCreateFormValues>({
    defaultValues: {
      name: '',
      code: '',
      specification: '',
      description: '',
      costPrice: 0,
      retailPrice: 0,
      salePrice: 0,
      unit: 'set',
      prices: [{ width: 1000, height: 2000, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prices' as const,
  });

  const selectedUnit = watch('unit');
  const isSetUnit = selectedUnit === 'set';

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Thêm hệ nhôm thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        code: '',
        specification: '',
        description: '',
        costPrice: 0,
        retailPrice: 0,
        salePrice: 0,
        unit: 'set',
        prices: [{ width: 1000, height: 2000, price: 0 }],
      });
    }
  }, [isOpen, reset]);

  const handleConfirm = (data: MaterialCreateFormValues) => {
    const isSet = data.unit === 'set';

    if (isSet && (!data.prices || data.prices.length === 0)) {
      toast.error('Vui lòng thêm ít nhất một mức giá kích thước cho đơn vị bộ');
      return;
    }

    const payload: any = {
      name: data.name,
      code: data.code,
      unit: data.unit,
      costPrice: isSet ? 0 : Number(data.costPrice) || 0,
      retailPrice: isSet ? 0 : Number(data.retailPrice) || 0,
      salePrice: isSet ? 0 : Number(data.salePrice) || 0,
    };

    if (isSet && data.prices && data.prices.length > 0) {
      payload.prices = data.prices.map((p) => ({
        width: Number(p.width) || 0,
        height: Number(p.height) || 0,
        price: Number(p.price) || 0,
      }));
    }

    if (data.specification && data.specification.trim() !== '') {
      payload.specification = data.specification;
    }
    if (data.description && data.description.trim() !== '') {
      payload.description = data.description;
    }
    createMutation(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={isSetUnit ? 'lg' : 'md'} className="m-2 w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tên hệ nhôm *"
              placeholder="Nhập tên hệ nhôm"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên hệ nhôm không được để trống' : undefined}
            />
            <Input
              label="Mã hệ nhôm *"
              placeholder="Nhập mã hệ nhôm"
              fullWidth
              {...register('code', { required: true })}
              error={errors.code ? 'Mã hệ nhôm không được để trống' : undefined}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Đơn vị tính *"
              placeholder="Chọn đơn vị tính"
              fullWidth
              value={watch('unit') || ''}
              {...register('unit', { required: true })}
              options={[
                { value: 'set', label: 'Bộ' },
                { value: 'area', label: 'm²' },
              ]}
              error={errors.unit ? 'Vui lòng chọn đơn vị tính' : undefined}
            />
            <Input
              label="Thông số kỹ thuật"
              placeholder="Nhập thông số kỹ thuật"
              fullWidth
              {...register('specification')}
              error={errors.specification ? 'Thông số kỹ thuật không hợp lệ' : undefined}
            />
          </div>

          <Input
            label="Mô tả chi tiết"
            placeholder="Nhập mô tả"
            fullWidth
            {...register('description')}
            error={errors.description ? 'Mô tả không hợp lệ' : undefined}
          />

          {/* Nếu đơn vị tính KHÔNG PHẢI là bộ -> Hiển thị 3 đơn giá cố định */}
          {!isSetUnit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <Controller
                name="retailPrice"
                control={control}
                rules={{
                  required: !isSetUnit ? 'Giá bán lẻ không được để trống' : false,
                  validate: (val) => {
                    if (isSetUnit) return true;
                    const num = Number(val);
                    if (isNaN(num) || num < 0) return 'Giá bán lẻ phải >= 0';
                    return true;
                  },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    label="Giá bán lẻ (VNĐ) *"
                    placeholder="Nhập giá bán lẻ"
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
                  required: !isSetUnit ? 'Giá đại lý không được để trống' : false,
                  validate: (val) => {
                    if (isSetUnit) return true;
                    const num = Number(val);
                    if (isNaN(num) || num < 0) return 'Giá đại lý phải >= 0';
                    return true;
                  },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    label="Giá đại lý (VNĐ) *"
                    placeholder="Nhập giá đại lý"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.salePrice?.message}
                  />
                )}
              />
            </div>
          )}

          {/* Nếu đơn vị tính LÀ BỘ -> Hiển thị bảng cấu hình ma trận kích thước */}
          {isSetUnit && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Bảng giá theo kích thước quy chuẩn (mm)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  leftIcon={<Plus size={14} />}
                  onClick={() => append({ width: 1000, height: 2000, price: 0 })}
                  className="font-medium text-primary hover:bg-primary/5"
                >
                  Thêm kích thước
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Cấu hình đơn giá theo từng mốc Chiều rộng tối đa (W) và Chiều cao tối đa (H).
              </p>

              <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-lg border border-gray-200/80 bg-gray-50/50"
                  >
                    <div className="flex-1">
                      <Input
                        label={index === 0 ? 'Rộng tối đa (mm) *' : undefined}
                        placeholder="VD: 1200"
                        type="number"
                        fullWidth
                        {...register(`prices.${index}.width` as const, {
                          required: true,
                          min: 1,
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label={index === 0 ? 'Cao tối đa (mm) *' : undefined}
                        placeholder="VD: 2400"
                        type="number"
                        fullWidth
                        {...register(`prices.${index}.height` as const, {
                          required: true,
                          min: 1,
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className="flex-1">
                      <Controller
                        name={`prices.${index}.price` as const}
                        control={control}
                        rules={{
                          required: true,
                          validate: (val) => Number(val) >= 0,
                        }}
                        render={({ field }) => (
                          <CurrencyInput
                            label={index === 0 ? 'Đơn giá (VNĐ) *' : undefined}
                            placeholder="Nhập đơn giá"
                            fullWidth
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className={index === 0 ? 'sm:pt-6 flex justify-end' : 'flex justify-end'}>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        title="Xóa mức giá này"
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end w-full mt-6">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={16} />}
            type="submit"
            disabled={isCreating}
            loading={isCreating}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 2. MODAL CẬP NHẬT HỆ NHÔM (MaterialUpdate)
// ==========================================
interface MaterialUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Pick<
    Material,
    'id' | 'name' | 'code' | 'specification' | 'description' | 'costPrice' | 'retailPrice' | 'salePrice' | 'unit' | 'prices'
  >;
}

type MaterialUpdateFormValues = Omit<MaterialUpdate, 'imagePath'>;

export function MaterialUpdateModal({
  isOpen,
  onClose,
  title,
  submitText = 'Xác nhận lưu',
  initialData,
}: MaterialUpdateModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<MaterialUpdateFormValues>({
    defaultValues: {
      name: '',
      code: '',
      specification: '',
      description: '',
      costPrice: 0,
      retailPrice: 0,
      salePrice: 0,
      unit: 'set',
      prices: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'prices' as const,
  });

  const selectedUnit = watch('unit');
  const isSetUnit = selectedUnit === 'set';

  // Nếu initialData chưa có prices đầy đủ, fetch chi tiết vật tư để lấy mảng prices
  const { data: detailData } = useQuery({
    queryKey: ['material-detail', initialData?.id],
    queryFn: () => (initialData?.id ? getMaterial(initialData.id) : null),
    enabled: isOpen && !!initialData?.id && initialData?.unit === 'set' && !initialData.prices,
  });

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MaterialUpdate }) => updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      if (initialData?.id) {
        queryClient.invalidateQueries({ queryKey: ['materials', initialData.id] });
        queryClient.invalidateQueries({ queryKey: ['material-detail', initialData.id] });
      }
      toast.success('Cập nhật hệ nhôm thành công');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      const activePrices: MaterialPriceCreate[] =
        initialData.prices && initialData.prices.length > 0
          ? initialData.prices.map((p) => ({ width: p.width, height: p.height, price: p.price }))
          : detailData?.prices && detailData.prices.length > 0
          ? detailData.prices.map((p) => ({ width: p.width, height: p.height, price: p.price }))
          : [{ width: 1000, height: 2000, price: 0 }];

      reset({
        name: initialData.name || '',
        code: initialData.code || '',
        specification: initialData.specification || '',
        description: initialData.description || '',
        costPrice: initialData.costPrice !== undefined ? initialData.costPrice : 0,
        retailPrice: initialData.retailPrice !== undefined ? initialData.retailPrice : 0,
        salePrice: initialData.salePrice !== undefined ? initialData.salePrice : 0,
        unit: initialData.unit || 'set',
        prices: activePrices,
      });
    }
  }, [isOpen, initialData, detailData, reset]);

  const handleConfirm = (data: MaterialUpdateFormValues) => {
    if (!initialData) return;
    const isSet = data.unit === 'set';

    if (isSet && (!data.prices || data.prices.length === 0)) {
      toast.error('Vui lòng thêm ít nhất một mức giá kích thước cho đơn vị bộ');
      return;
    }

    const payload: any = {
      name: data.name,
      code: data.code,
      unit: data.unit,
      costPrice: isSet ? 0 : Number(data.costPrice) || 0,
      retailPrice: isSet ? 0 : Number(data.retailPrice) || 0,
      salePrice: isSet ? 0 : Number(data.salePrice) || 0,
      specification: data.specification?.trim() || '',
      description: data.description?.trim() || '',
    };

    if (isSet && data.prices && data.prices.length > 0) {
      payload.prices = data.prices.map((p) => ({
        width: Number(p.width) || 0,
        height: Number(p.height) || 0,
        price: Number(p.price) || 0,
      }));
    }

    updateMutation({ id: initialData.id, data: payload });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={isSetUnit ? 'lg' : 'md'} className="m-2 w-full">
      <form onSubmit={handleSubmit(handleConfirm)}>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tên hệ nhôm *"
              placeholder="Nhập tên hệ nhôm"
              fullWidth
              {...register('name', { required: true })}
              error={errors.name ? 'Tên hệ nhôm không được để trống' : undefined}
            />
            <Input
              label="Mã hệ nhôm *"
              placeholder="Nhập mã hệ nhôm"
              fullWidth
              {...register('code', { required: true })}
              error={errors.code ? 'Mã hệ nhôm không được để trống' : undefined}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Đơn vị tính *"
              placeholder="Chọn đơn vị tính"
              fullWidth
              value={watch('unit') || ''}
              {...register('unit', { required: true })}
              options={[
                { value: 'set', label: 'Bộ' },
                { value: 'area', label: 'm²' },
              ]}
              error={errors.unit ? 'Vui lòng chọn đơn vị tính' : undefined}
            />
            <Input
              label="Thông số kỹ thuật"
              placeholder="Nhập thông số kỹ thuật"
              fullWidth
              {...register('specification')}
              error={errors.specification ? 'Thông số kỹ thuật không hợp lệ' : undefined}
            />
          </div>

          <Input
            label="Mô tả chi tiết"
            placeholder="Nhập mô tả"
            fullWidth
            {...register('description')}
            error={errors.description ? 'Mô tả không hợp lệ' : undefined}
          />

          {/* Nếu đơn vị tính KHÔNG PHẢI là bộ -> Hiển thị 3 đơn giá cố định */}
          {!isSetUnit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <Controller
                name="retailPrice"
                control={control}
                rules={{
                  required: !isSetUnit ? 'Giá bán lẻ không được để trống' : false,
                  validate: (val) => {
                    if (isSetUnit) return true;
                    const num = Number(val);
                    if (isNaN(num) || num < 0) return 'Giá bán lẻ phải >= 0';
                    return true;
                  },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    label="Giá bán lẻ (VNĐ) *"
                    placeholder="Nhập giá bán lẻ"
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
                  required: !isSetUnit ? 'Giá đại lý không được để trống' : false,
                  validate: (val) => {
                    if (isSetUnit) return true;
                    const num = Number(val);
                    if (isNaN(num) || num < 0) return 'Giá đại lý phải >= 0';
                    return true;
                  },
                }}
                render={({ field }) => (
                  <CurrencyInput
                    label="Giá đại lý (VNĐ) *"
                    placeholder="Nhập giá đại lý"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.salePrice?.message}
                  />
                )}
              />
            </div>
          )}

          {/* Nếu đơn vị tính LÀ BỘ -> Hiển thị bảng cấu hình ma trận kích thước */}
          {isSetUnit && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Bảng giá theo kích thước quy chuẩn (mm)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  leftIcon={<Plus size={14} />}
                  onClick={() => append({ width: 1000, height: 2000, price: 0 })}
                  className="font-medium text-primary hover:bg-primary/5"
                >
                  Thêm kích thước
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Cấu hình đơn giá theo từng mốc Chiều rộng tối đa (W) và Chiều cao tối đa (H).
              </p>

              <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-lg border border-gray-200/80 bg-gray-50/50"
                  >
                    <div className="flex-1">
                      <Input
                        label={index === 0 ? 'Rộng tối đa (mm) *' : undefined}
                        placeholder="VD: 1200"
                        type="number"
                        fullWidth
                        {...register(`prices.${index}.width` as const, {
                          required: true,
                          min: 1,
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label={index === 0 ? 'Cao tối đa (mm) *' : undefined}
                        placeholder="VD: 2400"
                        type="number"
                        fullWidth
                        {...register(`prices.${index}.height` as const, {
                          required: true,
                          min: 1,
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <div className="flex-1">
                      <Controller
                        name={`prices.${index}.price` as const}
                        control={control}
                        rules={{
                          required: true,
                          validate: (val) => Number(val) >= 0,
                        }}
                        render={({ field }) => (
                          <CurrencyInput
                            label={index === 0 ? 'Đơn giá (VNĐ) *' : undefined}
                            placeholder="Nhập đơn giá"
                            fullWidth
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className={index === 0 ? 'sm:pt-6 flex justify-end' : 'flex justify-end'}>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        title="Xóa mức giá này"
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end w-full mt-6">
          <Button variant="outline" size="sm" onClick={onClose}>
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
    </Modal>
  );
}

// ==========================================
// 3. MODAL XÁC NHẬN XÓA HỆ NHÔM
// ==========================================
interface MaterialDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function MaterialDeleteModal({ isOpen, onClose, materialName, onConfirm, isPending = false }: MaterialDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa hệ nhôm" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa hệ nhôm <strong className="text-gray-900 font-semibold">{materialName}</strong>?
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
