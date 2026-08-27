'use client';

import { useEffect, useState } from 'react';
import { Input, Button, Modal, Select } from '@/components';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  createFormula,
  updateFormula,
  getMaterials,
  getMaterialsByFormula,
  assignMaterialsToFormula,
  unassignMaterialsFromFormula,
} from '@/actions';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import queryClient from '@/utils/query';
import { FORMULA_TYPE_MAP, DOOR_TYPE_MAP, type Formula, type FormulaCreate, type FormulaUpdate } from '@/types';

// ==========================================
// 1. MODAL TẠO MỚI CÔNG THỨC
// ==========================================
interface FormulaCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
}

export function FormulaCreateModal({ isOpen, onClose, title, submitText = 'Xác nhận tạo' }: FormulaCreateModalProps) {
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormulaCreate>({
    defaultValues: {
      type: 'door_trim',
      unit: 'md',
      widthAdd: 0,
      heightAdd: 0,
      wastageRate: 0,
      coefficientWidth: 0,
      coefficientHeight: 0,
    },
  });

  const selectedType = watch('type');

  // Load danh sách hệ nhôm để gán vào công thức
  const { data: materials } = useQuery({
    queryKey: ['materials-all'],
    queryFn: async () => {
      const res = await getMaterials({ limit: 1000 });
      return res.items;
    },
    enabled: isOpen,
  });

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: async (payload: { formula: FormulaCreate; materialIds: number[] }) => {
      const formula = await createFormula(payload.formula);
      if (payload.materialIds.length > 0) {
        await assignMaterialsToFormula(formula.id, { material_ids: payload.materialIds });
      }
      return formula;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulas'] });
      toast.success('Thêm công thức mới thành công');
      onClose();
      reset();
      setSelectedMaterialIds([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi tạo công thức');
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        code: '',
        name: '',
        unit: 'md',
        type: 'door_trim',
        widthAdd: 0,
        heightAdd: 0,
        wastageRate: 0,
        coefficientWidth: 0,
        coefficientHeight: 0,
      });
      setSelectedMaterialIds([]);
    }
  }, [isOpen]);

  const handleConfirm = (data: FormulaCreate) => {
    const payload: FormulaCreate = {
      type: data.type,
      code: data.code || undefined,
      name: data.name || undefined,
      unit: data.unit || 'md',
    };

    if (data.doorType && data.doorType.trim() !== '') {
      payload.doorType = data.doorType;
    }

    if (data.type === 'door_trim') {
      payload.widthAdd = Number(data.widthAdd || 0);
      payload.heightAdd = Number(data.heightAdd || 0);
    } else if (data.type === 'wall_cladding') {
      payload.coefficientWidth = Number(data.coefficientWidth || 0);
      payload.coefficientHeight = Number(data.coefficientHeight || 0);
    } else {
      payload.wastageRate = Number(data.wastageRate || 0);
    }

    createMutation({ formula: payload, materialIds: selectedMaterialIds });
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-lg w-full">
      <form onSubmit={handleSubmit(handleConfirm)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã công thức *"
            placeholder="Nhập mã công thức"
            fullWidth
            {...register('code', { required: 'Mã công thức không được để trống' })}
            error={errors.code?.message}
          />
          <Input
            label="Tên công thức *"
            placeholder="Nhập tên công thức"
            fullWidth
            {...register('name', { required: 'Tên công thức không được để trống' })}
            error={errors.name?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Phân loại *"
            fullWidth
            value={watch('type') || ''}
            {...register('type', { required: true })}
            options={Object.entries(FORMULA_TYPE_MAP).map(([value, label]) => ({ value, label }))}
          />
          <Input
            label="Đơn vị tính *"
            placeholder="Ví dụ: md, cái..."
            fullWidth
            {...register('unit', { required: 'Đơn vị tính không được để trống' })}
            error={errors.unit?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Select
              label="Loại cửa áp dụng"
              placeholder="Chọn loại cửa"
              fullWidth
              value={watch('doorType') || ''}
              {...register('doorType')}
              options={[
                { value: '', label: 'Tất cả' },
                ...Object.entries(DOOR_TYPE_MAP).map(([value, label]) => ({ value, label })),
              ]}
            />
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-700">Hệ nhôm tương ứng</label>
            <div className="border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-white">
              {materials && materials.length > 0 ? (
                materials.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedMaterialIds.includes(m.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMaterialIds([...selectedMaterialIds, m.id]);
                        } else {
                          setSelectedMaterialIds(selectedMaterialIds.filter((id) => id !== m.id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                    />
                    <span>{m.name} ({m.code})</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">Đang tải danh sách hệ nhôm...</span>
              )}
            </div>
          </div>
        </div>

        {selectedType === 'door_trim' && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <Input
              label="Số mm cộng chiều rộng *"
              type="number"
              placeholder="0"
              fullWidth
              {...register('widthAdd', {
                required: 'Vui lòng nhập số mm cộng chiều rộng',
                min: { value: 0, message: 'Giá trị tối thiểu là 0' },
              })}
              error={errors.widthAdd?.message}
            />
            <Input
              label="Số mm cộng chiều cao *"
              type="number"
              placeholder="0"
              fullWidth
              {...register('heightAdd', {
                required: 'Vui lòng nhập số mm cộng chiều cao',
                min: { value: 0, message: 'Giá trị tối thiểu là 0' },
              })}
              error={errors.heightAdd?.message}
            />
          </div>
        )}

        {selectedType === 'wall_cladding' && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <Input
              label="Hệ số chiều rộng *"
              type="number"
              placeholder="0"
              fullWidth
              {...register('coefficientWidth', {
                required: 'Vui lòng nhập hệ số chiều rộng',
                min: { value: 0, message: 'Giá trị tối thiểu là 0' },
              })}
              error={errors.coefficientWidth?.message}
            />
            <Input
              label="Hệ số chiều cao *"
              type="number"
              placeholder="0"
              fullWidth
              {...register('coefficientHeight', {
                required: 'Vui lòng nhập hệ số chiều cao',
                min: { value: 0, message: 'Giá trị tối thiểu là 0' },
              })}
              error={errors.coefficientHeight?.message}
            />
          </div>
        )}

        {(selectedType === 'circle' || selectedType === 'semicircle') && (
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
            <Input
              label="Tỷ lệ hao hụt (%) *"
              type="number"
              step="0.01"
              placeholder="0.0"
              fullWidth
              {...register('wastageRate', {
                required: 'Vui lòng nhập tỷ lệ hao hụt',
                min: { value: 0.01, message: 'Tỷ lệ hao hụt phải lớn hơn 0' },
              })}
              error={errors.wastageRate?.message}
            />
          </div>
        )}

        <div className="flex gap-2 justify-end w-full mt-6 pt-4 border-t border-gray-150">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Hủy
          </Button>
          <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={16} />} type="submit" disabled={isCreating} loading={isCreating}>
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// 2. MODAL CẬP NHẬT CÔNG THỨC
// ==========================================
interface FormulaUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: Formula;
}

export function FormulaUpdateModal({ isOpen, onClose, title, submitText = 'Xác nhận lưu', initialData }: FormulaUpdateModalProps) {
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormulaUpdate>();

  const selectedType = watch('type');

  // Load danh sách hệ nhôm để gán vào công thức
  const { data: materials } = useQuery({
    queryKey: ['materials-all'],
    queryFn: async () => {
      const res = await getMaterials({ limit: 1000 });
      return res.items;
    },
    enabled: isOpen,
  });

  // Load danh sách hệ nhôm đã được gán cho công thức này
  const { data: assignedMaterials } = useQuery({
    queryKey: ['formula-materials', initialData?.id],
    queryFn: () => getMaterialsByFormula(initialData!.id, { limit: 1000 }),
    enabled: isOpen && !!initialData?.id,
  });

  const { mutate: updateMutation, isPending: updateIsPending } = useMutation({
    mutationFn: async ({
      id,
      data,
      materialIds,
      initialMaterialIds,
    }: {
      id: number;
      data: FormulaUpdate;
      materialIds: number[];
      initialMaterialIds: number[];
    }) => {
      const formula = await updateFormula(id, data);
      
      const toAssign = materialIds.filter((mId) => !initialMaterialIds.includes(mId));
      const toUnassign = initialMaterialIds.filter((mId) => !materialIds.includes(mId));

      if (toAssign.length > 0) {
        await assignMaterialsToFormula(id, { material_ids: toAssign });
      }
      if (toUnassign.length > 0) {
        await unassignMaterialsFromFormula(id, { material_ids: toUnassign });
      }

      return formula;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulas'] });
      queryClient.invalidateQueries({ queryKey: ['formula-materials'] });
      toast.success('Cập nhật công thức thành công');
      onClose();
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi cập nhật công thức');
    },
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedMaterialIds([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && assignedMaterials) {
      setSelectedMaterialIds(assignedMaterials.items.map((m) => m.id));
    }
  }, [isOpen, assignedMaterials]);

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        code: initialData.code || '',
        name: initialData.name || '',
        unit: initialData.unit || 'md',
        type: initialData.type,
        doorType: initialData.doorType || undefined,
        widthAdd: initialData.widthAdd ?? 0,
        heightAdd: initialData.heightAdd ?? 0,
        wastageRate: initialData.wastageRate ?? 0,
        coefficientWidth: initialData.coefficientWidth ?? 0,
        coefficientHeight: initialData.coefficientHeight ?? 0,
      });
    }
  }, [isOpen, initialData]);

  const handleConfirm = (data: FormulaUpdate) => {
    if (!initialData) return;

    const payload: FormulaUpdate = {
      type: data.type,
      code: data.code || undefined,
      name: data.name || undefined,
      unit: data.unit || 'md',
      doorType: data.doorType || undefined,
    };

    if (data.type === 'door_trim') {
      payload.widthAdd = Number(data.widthAdd || 0);
      payload.heightAdd = Number(data.heightAdd || 0);
      payload.wastageRate = undefined;
      payload.coefficientWidth = undefined;
      payload.coefficientHeight = undefined;
    } else if (data.type === 'wall_cladding') {
      payload.coefficientWidth = Number(data.coefficientWidth || 0);
      payload.coefficientHeight = Number(data.coefficientHeight || 0);
      payload.wastageRate = undefined;
      payload.widthAdd = undefined;
      payload.heightAdd = undefined;
    } else {
      payload.wastageRate = Number(data.wastageRate || 0);
      payload.widthAdd = undefined;
      payload.heightAdd = undefined;
      payload.coefficientWidth = undefined;
      payload.coefficientHeight = undefined;
    }

    const initialMaterialIds = assignedMaterials?.items.map((m) => m.id) || [];

    updateMutation({
      id: initialData.id,
      data: payload,
      materialIds: selectedMaterialIds,
      initialMaterialIds,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-lg w-full">
      <form onSubmit={handleSubmit(handleConfirm)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mã công thức *"
            placeholder="Nhập mã công thức"
            fullWidth
            {...register('code', { required: 'Mã công thức không được để trống' })}
            error={errors.code?.message}
          />
          <Input
            label="Tên công thức *"
            placeholder="Nhập tên công thức"
            fullWidth
            {...register('name', { required: 'Tên công thức không được để trống' })}
            error={errors.name?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Phân loại *"
            fullWidth
            value={watch('type') || ''}
            {...register('type', { required: true })}
            options={Object.entries(FORMULA_TYPE_MAP).map(([value, label]) => ({ value, label }))}
          />
          <Input
            label="Đơn vị tính *"
            placeholder="Ví dụ: md, cái..."
            fullWidth
            {...register('unit', { required: 'Đơn vị tính không được để trống' })}
            error={errors.unit?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Select
              label="Loại cửa áp dụng"
              placeholder="Chọn loại cửa"
              fullWidth
              value={watch('doorType') || ''}
              {...register('doorType')}
              options={[
                { value: '', label: 'Tất cả' },
                ...Object.entries(DOOR_TYPE_MAP).map(([value, label]) => ({ value, label })),
              ]}
            />
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-700">Hệ nhôm tương ứng</label>
            <div className="border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-white">
              {materials && materials.length > 0 ? (
                materials.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm text-gray-900 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedMaterialIds.includes(m.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMaterialIds([...selectedMaterialIds, m.id]);
                        } else {
                          setSelectedMaterialIds(selectedMaterialIds.filter((id) => id !== m.id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                    />
                    <span>{m.name} ({m.code})</span>
                  </label>
                ))
              ) : (
                <span className="text-xs text-gray-400">Đang tải danh sách hệ nhôm...</span>
              )}
            </div>
          </div>
        </div>

        {selectedType === 'door_trim' && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <Input
              label="Số mm cộng chiều rộng *"
              type="number"
              placeholder="0"
              fullWidth
              {...register('widthAdd', {
                required: 'Vui lòng nhập số mm cộng chiều rộng',
                min: { value: 0, message: 'Giá trị tối thiểu là 0' },
              })}
              error={errors.widthAdd?.message}
            />
            <Input
              label="Số mm cộng chiều cao *"
              type="number"
              placeholder="0"
              fullWidth
              {...register('heightAdd', {
                required: 'Vui lòng nhập số mm cộng chiều cao',
                min: { value: 0, message: 'Giá trị tối thiểu là 0' },
              })}
              error={errors.heightAdd?.message}
            />
          </div>
        )}

        {selectedType === 'wall_cladding' && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <Input
              label="Hệ số chiều rộng *"
              type="number"
              placeholder="0"
              fullWidth
              {...register('coefficientWidth', {
                required: 'Vui lòng nhập hệ số chiều rộng',
                min: { value: 0, message: 'Giá trị tối thiểu là 0' },
              })}
              error={errors.coefficientWidth?.message}
            />
            <Input
              label="Hệ số chiều cao *"
              type="number"
              placeholder="0"
              fullWidth
              {...register('coefficientHeight', {
                required: 'Vui lòng nhập hệ số chiều cao',
                min: { value: 0, message: 'Giá trị tối thiểu là 0' },
              })}
              error={errors.coefficientHeight?.message}
            />
          </div>
        )}

        {(selectedType === 'circle' || selectedType === 'semicircle') && (
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
            <Input
              label="Tỷ lệ hao hụt (%) *"
              type="number"
              step="0.01"
              placeholder="0.0"
              fullWidth
              {...register('wastageRate', {
                required: 'Vui lòng nhập tỷ lệ hao hụt',
                min: { value: 0.01, message: 'Tỷ lệ hao hụt phải lớn hơn 0' },
              })}
              error={errors.wastageRate?.message}
            />
          </div>
        )}

        <div className="flex gap-2 justify-end w-full mt-6 pt-4 border-t border-gray-150">
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
    </Modal>
  );
}

// ==========================================
// 3. MODAL XÁC NHẬN XÓA CÔNG THỨC
// ==========================================
interface FormulaDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  formulaName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function FormulaDeleteModal({ isOpen, onClose, formulaName, onConfirm, isPending = false }: FormulaDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa công thức" className="m-2 max-w-md w-full">
      <div className="flex gap-4 items-center py-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-gray-600 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa công thức <strong className="text-gray-900 font-semibold">{formulaName}</strong>?
          </p>
        </div>
      </div>
      <div className="flex gap-3 justify-end w-full mt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending} type="button">
          Hủy
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={isPending}>
          Xác nhận xóa
        </Button>
      </div>
    </Modal>
  );
}
