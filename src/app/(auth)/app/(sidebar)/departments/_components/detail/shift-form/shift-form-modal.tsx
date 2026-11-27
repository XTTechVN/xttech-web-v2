'use client';

import { useCan } from '@/hooks';
import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Input, Switch } from '@/components';
import { Button, DrawerSection, Select } from '@/components-remake';
import {
  createWorkShift,
  updateWorkShift,
  getDepartments,
  getEmployees,
} from '@/actions';
import { SHIFT_TYPE_OPTIONS } from '@/config';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type {
  WorkShift,
  WorkShiftCreate,
  WorkShiftUpdate,
  Department,
  Employee,
} from '@/types';

import { ShiftDaysSelector } from './shift-days-selector';
import { ShiftGpsSection } from './shift-gps-section';
import {
  ShiftExceptionsSection,
  ShiftFormValues,
} from './shift-exceptions-section';
import {
  buildDefaultShiftFormValues,
  buildShiftSubmitPayload,
} from './shift-form-helpers';

export interface ShiftFormBodyProps {
  onClose: () => void;
  submitText: string;
  /** Có id thì form không tự vẽ hàng nút; nơi dùng đặt nút gửi ngoài form (form={formId}) */
  formId?: string;
  onPendingChange?: (pending: boolean) => void;
  initialData?: WorkShift | null;
  defaultDepartmentId?: number;
  defaultDepartmentName?: string;
}

export const ShiftFormBody: React.FC<ShiftFormBodyProps> = ({
  onClose,
  submitText,
  formId,
  onPendingChange,
  initialData,
  defaultDepartmentId,
  defaultDepartmentName,
}) => {
  const { can } = useCan();
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: (!defaultDepartmentName) && can('department:read'),
  });

  const currentDepartmentName = useMemo(() => {
    if (defaultDepartmentName) return defaultDepartmentName;
    if (!defaultDepartmentId) return '';
    const found = departmentsData?.items?.find(
      (dept: Department) => String(dept.id) === String(defaultDepartmentId)
    );
    return found?.name || `Phòng ban ID: ${defaultDepartmentId}`;
  }, [defaultDepartmentId, defaultDepartmentName, departmentsData]);

  const departmentOptions = useMemo(
    () =>
      (departmentsData?.items || []).map((dept: Department) => ({
        value: String(dept.id),
        label: dept.name,
      })),
    [departmentsData]
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    defaultValues: buildDefaultShiftFormValues(initialData, defaultDepartmentId),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exceptions',
  });

  const watchedDepartmentId = watch('departmentId');
  const activeDepartmentId =
    defaultDepartmentId ||
    (watchedDepartmentId ? Number(watchedDepartmentId) : undefined);

  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'by-department', activeDepartmentId],
    queryFn: () => getEmployees({ departmentId: activeDepartmentId, limit: 200 }),
  });

  const userOptions = useMemo(
    () =>
      (employeesData?.items || []).map((emp: Employee) => ({
        value: String(emp.id),
        label: `${emp.fullName || emp.email} (${emp.identifyCode || emp.username || 'NV'})`,
      })),
    [employeesData]
  );

  const selectedDays = watch('workDays') || [];
  const selectedOptionalDays = watch('optionalWorkDays') || [];

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: (payload: WorkShiftCreate) => createWorkShift(payload),
    onSuccess: () => {
      toast.success('Tạo ca làm việc thành công');
      queryClient.invalidateQueries({ queryKey: ['work_shifts'] });
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi tạo ca làm việc'),
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: (params: { id: number; payload: WorkShiftUpdate }) =>
      updateWorkShift(params.id, params.payload),
    onSuccess: () => {
      toast.success('Cập nhật ca làm việc thành công');
      queryClient.invalidateQueries({ queryKey: ['work_shifts'] });
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi khi cập nhật ca làm việc'),
  });

  const isPending = isCreating || isUpdating;
  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const toggleDayInSets = (day: string, isMandatory: boolean) => {
    const mandatorySet = new Set(selectedDays);
    const optionalSet = new Set(selectedOptionalDays);
    const targetSet = isMandatory ? mandatorySet : optionalSet;
    const otherSet = isMandatory ? optionalSet : mandatorySet;

    if (targetSet.has(day)) {
      targetSet.delete(day);
    } else {
      targetSet.add(day);
      otherSet.delete(day);
    }
    setValue('workDays', Array.from(mandatorySet), { shouldValidate: true });
    setValue('optionalWorkDays', Array.from(optionalSet), { shouldValidate: true });
  };

  const onSubmit = (formData: ShiftFormValues) => {
    if (formData.workDays.length === 0 && formData.optionalWorkDays.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ngày làm việc (bắt buộc hoặc tùy chọn)');
      return;
    }
    if (!formData.departmentId) {
      toast.error('Vui lòng chọn phòng ban áp dụng');
      return;
    }

    const payload = buildShiftSubmitPayload(formData);
    if (initialData?.id) {
      updateMutation({ id: initialData.id, payload });
    } else {
      createMutation(payload);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="pt-4">
      <DrawerSection>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Tên ca làm việc *"
            placeholder="Ví dụ: Ca Hành Chính, Ca Sáng..."
            {...register('name', { required: 'Tên ca làm việc là bắt buộc' })}
            error={errors.name?.message}
          />
          <Controller
            control={control}
            name="shiftType"
            rules={{ required: 'Loại ca là bắt buộc' }}
            render={({ field }) => (
              <div>
                <Select label="Loại ca *" options={SHIFT_TYPE_OPTIONS} value={field.value ?? ''} onChange={field.onChange} />
                {errors.shiftType && <span className="mt-1.5 block text-xs text-red-500">{errors.shiftType.message}</span>}
              </div>
            )}
          />
          <div className="grid grid-cols-2 gap-3 md:contents">
            <Input label="Giờ bắt đầu *" type="time" {...register('startTime', { required: 'Giờ bắt đầu là bắt buộc' })} error={errors.startTime?.message} />
          <Input label="Giờ kết thúc *" type="time" {...register('endTime', { required: 'Giờ kết thúc là bắt buộc' })} error={errors.endTime?.message} />
          </div>
          {!defaultDepartmentId ? (
            <Controller
              control={control}
              name="departmentId"
              rules={{ required: 'Vui lòng chọn phòng ban áp dụng' }}
              render={({ field }) => (
                <div>
                  <Select
                    label="Áp dụng cho phòng ban *"
                    placeholder="Chọn phòng ban"
                    options={departmentOptions}
                    value={field.value ? String(field.value) : ''}
                    onChange={field.onChange}
                  />
                  {errors.departmentId && <span className="mt-1.5 block text-xs text-red-500">{errors.departmentId.message}</span>}
                </div>
              )}
            />
          ) : (
            <Input label="Phòng ban *" value={currentDepartmentName} disabled readOnly />
          )}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">Trạng thái</span>
            <div className="flex h-10 items-center">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Switch
                    checked={field.value === 'active'}
                    onChange={(e) => field.onChange(e.target.checked ? 'active' : 'inactive')}
                    label={field.value === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </DrawerSection>

      <ShiftDaysSelector
        selectedDays={selectedDays}
        selectedOptionalDays={selectedOptionalDays}
        onToggleMandatoryDay={(day) => toggleDayInSets(day, true)}
        onToggleOptionalDay={(day) => toggleDayInSets(day, false)}
      />

      <ShiftGpsSection register={register} setValue={setValue} />

      <ShiftExceptionsSection control={control} register={register} fields={fields} append={append} remove={remove} userOptions={userOptions} />

      {!formId && (
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button type="submit" loading={isPending}>
            {submitText}
          </Button>
        </div>
      )}
    </form>
  );
};
