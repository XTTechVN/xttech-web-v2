'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';

import { Modal, Button, Input, Select, Switch } from '@/components';
import { createWorkShift, updateWorkShift, getDepartments, getEmployees } from '@/actions';
import queryClient from '@/utils/query';
import type { WorkShift, WorkShiftCreate, WorkShiftUpdate, Department } from '@/types';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';

const DAYS_OF_WEEK = [
  { value: '2', label: 'T2' },
  { value: '3', label: 'T3' },
  { value: '4', label: 'T4' },
  { value: '5', label: 'T5' },
  { value: '6', label: 'T6' },
  { value: '7', label: 'T7' },
  { value: '8', label: 'CN' },
];

const SHIFT_TYPES = [
  { value: 'morning', label: 'Ca sáng' },
  { value: 'afternoon', label: 'Ca chiều' },
  { value: 'full_day', label: 'Cả ngày (Hành chính)' },
  { value: 'night', label: 'Ca đêm' },
];

interface ShiftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitText?: string;
  initialData?: WorkShift | null;
  defaultDepartmentId?: number;
  defaultDepartmentName?: string;
}

interface FormValues {
  name: string;
  start_time: string;
  end_time: string;
  department_id: number | string;
  shift_type: string;
  work_days: string[];
  optional_work_days: string[];
  status: 'active' | 'inactive';
  work_latitude?: number | string;
  work_longitude?: number | string;
  allowed_distance?: number | string;
  exceptions: {
    user_id: string;
    check_in: string;
    check_out: string;
    start_date: string;
    end_date: string;
  }[];
}

export const ShiftFormModal: React.FC<ShiftFormModalProps> = ({
  isOpen,
  onClose,
  title,
  submitText = 'Lưu thông tin',
  initialData,
  defaultDepartmentId,
  defaultDepartmentName,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Lấy danh sách phòng ban
  const { data: departmentsData } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: () => getDepartments({ limit: 100 }),
    enabled: isOpen && !defaultDepartmentName,
  });

  // Tên phòng ban hiện tại
  const currentDepartmentName = useMemo(() => {
    if (defaultDepartmentName) return defaultDepartmentName;
    if (!defaultDepartmentId) return '';
    const found = departmentsData?.items?.find(
      (d: Department) => String(d.id) === String(defaultDepartmentId)
    );
    return found?.name || `Phòng ban ID: ${defaultDepartmentId}`;
  }, [defaultDepartmentId, defaultDepartmentName, departmentsData]);

  const departmentOptions = (departmentsData?.items || []).map((d: Department) => ({
    value: d.id,
    label: d.name,
  }));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      start_time: '08:00',
      end_time: '17:30',
      department_id: defaultDepartmentId || '',
      shift_type: 'full_day',
      work_days: ['2', '3', '4', '5', '6'],
      optional_work_days: [],
      status: 'active',
      allowed_distance: 200,
      work_latitude: '',
      work_longitude: '',
      exceptions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exceptions',
  });

  const watchedDepartmentId = watch('department_id');
  const activeDepartmentId = defaultDepartmentId || (watchedDepartmentId ? Number(watchedDepartmentId) : undefined);

  // Lấy danh sách nhân viên theo phòng ban (để gán ngoại lệ)
  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'by-department', activeDepartmentId],
    queryFn: () =>
      getEmployees({
        departmentId: activeDepartmentId,
        limit: 200,
      }),
    enabled: isOpen,
  });

  const userOptions = useMemo(() => {
    return (employeesData?.items || []).map((u: any) => ({
      value: u.id,
      label: `${u.fullName || u.email} (${u.identifyCode || u.code || u.username || 'NV'})`,
    }));
  }, [employeesData]);

  const selectedDays = watch('work_days') || [];
  const selectedOptionalDays = watch('optional_work_days') || [];

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const rawDays = initialData.workDays;
        const days = rawDays ? rawDays.split(',').map((d: string) => d.trim()).filter(Boolean) : ['2', '3', '4', '5', '6'];

        const rawOptDays = initialData.optionalWorkDays;
        const optDays = rawOptDays ? rawOptDays.split(',').map((d: string) => d.trim()).filter(Boolean) : [];

        const formatTime = (t?: string) => (t ? t.slice(0, 5) : '');

        const startTime = initialData.startTime ;
        const endTime = initialData.endTime ;
        const sType = initialData.shiftType || 'full_day';
        const deptId = initialData.departmentId ?? '';
        const lat = initialData.workLatitude ?? '';
        const lng = initialData.workLongitude ?? '';
        const dist = initialData.allowedDistance ?? 200;
        const rawExceptions =
          initialData.exceptions ||
          initialData.workShiftExceptions ||
          initialData.workShiftException ||
          [];

        reset({
          name: initialData.name || '',
          start_time: formatTime(startTime) || '08:00',
          end_time: formatTime(endTime) || '17:30',
          department_id: deptId,
          shift_type: sType,
          work_days: days,
          optional_work_days: optDays,
          status: (initialData.status as 'active' | 'inactive') || 'active',
          work_latitude: lat,
          work_longitude: lng,
          allowed_distance: dist,
          exceptions: rawExceptions.map((ex: any) => ({
            user_id: ex.userId || '',
            check_in: formatTime(ex.checkIn),
            check_out: formatTime(ex.checkOut),
            start_date: ex.startDate || '',
            end_date: ex.endDate || '',
          })),
        });
      } else {
        reset({
          name: '',
          start_time: '08:00',
          end_time: '17:30',
          department_id: defaultDepartmentId || '',
          shift_type: 'full_day',
          work_days: ['2', '3', '4', '5', '6'],
          optional_work_days: [],
          status: 'active',
          allowed_distance: 200,
          work_latitude: '',
          work_longitude: '',
          exceptions: [],
        });
      }
    }
  }, [isOpen, initialData, defaultDepartmentId, reset]);

  // Mutation tạo ca làm việc
  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: WorkShiftCreate) => createWorkShift(data),
    onSuccess: () => {
      toast.success('Tạo ca làm việc thành công');
      queryClient.invalidateQueries({ queryKey: ['work_shifts'] });
      onClose();
    },
    onError: (err) => {
      showErrorToast(err, 'Lỗi khi tạo ca làm việc');
    },
  });

  // Mutation sửa ca làm việc
  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: (data: { id: number; payload: WorkShiftUpdate }) =>
      updateWorkShift(data.id, data.payload),
    onSuccess: () => {
      toast.success('Cập nhật ca làm việc thành công');
      queryClient.invalidateQueries({ queryKey: ['work_shifts'] });
      onClose();
    },
    onError: (err) => {
      showErrorToast(err, 'Lỗi khi cập nhật ca làm việc');
    },
  });

  const isPending = isCreating || isUpdating;

  // Xử lý toggle chọn ngày làm việc bắt buộc
  const toggleMandatoryDay = (day: string) => {
    const currentMandatory = new Set(selectedDays);
    const currentOptional = new Set(selectedOptionalDays);

    if (currentMandatory.has(day)) {
      currentMandatory.delete(day);
    } else {
      currentMandatory.add(day);
      currentOptional.delete(day);
    }
    setValue('work_days', Array.from(currentMandatory), { shouldValidate: true });
    setValue('optional_work_days', Array.from(currentOptional), { shouldValidate: true });
  };

  // Xử lý toggle chọn ngày làm việc tùy chọn
  const toggleOptionalDay = (day: string) => {
    const currentMandatory = new Set(selectedDays);
    const currentOptional = new Set(selectedOptionalDays);

    if (currentOptional.has(day)) {
      currentOptional.delete(day);
    } else {
      currentOptional.add(day);
      currentMandatory.delete(day);
    }
    setValue('work_days', Array.from(currentMandatory), { shouldValidate: true });
    setValue('optional_work_days', Array.from(currentOptional), { shouldValidate: true });
  };

  // Lấy vị trí GPS hiện tại
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ Geolocation');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('work_latitude', Number(position.coords.latitude.toFixed(6)));
        setValue('work_longitude', Number(position.coords.longitude.toFixed(6)));
        setIsGettingLocation(false);
        toast.success('Đã lấy tọa độ GPS thành công');
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error(`Không thể lấy vị trí: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const onSubmit = (data: FormValues) => {
    if (data.work_days.length === 0 && data.optional_work_days.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ngày làm việc (bắt buộc hoặc tùy chọn)');
      return;
    }

    if (!data.department_id) {
      toast.error('Vui lòng chọn phòng ban áp dụng');
      return;
    }

    const payload: WorkShiftCreate = {
      name: data.name.trim(),
      startTime: data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time,
      endTime: data.end_time.length === 5 ? `${data.end_time}:00` : data.end_time,
      departmentId: Number(data.department_id),
      shiftType: data.shift_type,
      workDays: data.work_days.length > 0 ? data.work_days.sort().join(',') : '',
      optionalWorkDays: data.optional_work_days && data.optional_work_days.length > 0 ? data.optional_work_days.sort().join(',') : undefined,
      status: data.status,
      workLatitude: data.work_latitude ? Number(data.work_latitude) : null,
      workLongitude: data.work_longitude ? Number(data.work_longitude) : null,
      allowedDistance: data.allowed_distance ? Number(data.allowed_distance) : 200,
      workShiftExceptions: data.exceptions.map((ex) => ({
        userId: ex.user_id,
        checkIn: ex.check_in.length === 5 ? `${ex.check_in}:00` : ex.check_in,
        checkOut: ex.check_out.length === 5 ? `${ex.check_out}:00` : ex.check_out,
        startDate: ex.start_date,
        endDate: ex.end_date,
      })),
    };

    if (initialData?.id) {
      updateMutation({ id: initialData.id, payload });
    } else {
      createMutation(payload);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      className="m-2 md:max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
        {/* Tên ca & Loại ca */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên ca làm việc *"
            placeholder="Ví dụ: Ca Hành Chính, Ca Sáng..."
            {...register('name', { required: 'Tên ca làm việc là bắt buộc' })}
            error={errors.name?.message}
          />

          <Controller
            control={control}
            name="shift_type"
            rules={{ required: 'Loại ca là bắt buộc' }}
            render={({ field }) => (
              <Select
                label="Loại ca *"
                options={SHIFT_TYPES}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.shift_type?.message}
              />
            )}
          />
        </div>

        {/* Giờ bắt đầu & Giờ kết thúc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Giờ bắt đầu *"
            type="time"
            {...register('start_time', { required: 'Giờ bắt đầu là bắt buộc' })}
            error={errors.start_time?.message}
          />
          <Input
            label="Giờ kết thúc *"
            type="time"
            {...register('end_time', { required: 'Giờ kết thúc là bắt buộc' })}
            error={errors.end_time?.message}
          />
        </div>

        {/* Phòng ban & Trạng thái */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!defaultDepartmentId ? (
            <Controller
              control={control}
              name="department_id"
              rules={{ required: 'Vui lòng chọn phòng ban áp dụng' }}
              render={({ field }) => (
                <Select
                  label="Áp dụng cho Phòng ban *"
                  placeholder="-- Chọn phòng ban áp dụng --"
                  options={departmentOptions}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={errors.department_id?.message}
                />
              )}
            />
          ) : (
            <Input
              label="Phòng ban *"
              value={currentDepartmentName}
              disabled
              className="bg-gray-100 cursor-not-allowed font-medium text-slate-700"
            />
          )}

          <div className="flex flex-col gap-1.5 justify-center">
            <span className="text-xs font-semibold text-gray-700 select-none">Trạng thái hoạt động</span>
            <div className="flex items-center gap-3 h-10">
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

        {/* Cấu hình ngày làm việc: Chia làm 2 cột Bắt buộc & Tùy chọn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cột 1: Ngày làm việc bắt buộc */}
          <div className="flex flex-col justify-between gap-2.5 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-slate-800 select-none flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  Ngày làm việc bắt buộc *
                </label>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhân viên vắng mặt không phép nếu không đi làm
              </p>
            </div>
            <div className="grid grid-cols-7 gap-2 pt-1">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDays.includes(d.value);
                return (
                  <button
                    type="button"
                    key={d.value}
                    onClick={() => toggleMandatoryDay(d.value)}
                    className={`py-2 text-center rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 border cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {selectedDays.length === 0 && selectedOptionalDays.length === 0 && (
              <span className="text-xs text-red-500">Vui lòng chọn ít nhất 1 ngày làm việc</span>
            )}
          </div>

          {/* Cột 2: Ngày làm việc tùy chọn */}
          <div className="flex flex-col justify-between gap-2.5 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-slate-800 select-none flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  Ngày làm việc tùy chọn
                </label>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đi làm vẫn tính công, không đi làm không bị phạt
              </p>
            </div>
            <div className="grid grid-cols-7 gap-2 pt-1">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedOptionalDays.includes(d.value);
                return (
                  <button
                    type="button"
                    key={d.value}
                    onClick={() => toggleOptionalDay(d.value)}
                    className={`py-2 text-center rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 border cursor-pointer select-none ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cấu hình GPS Chấm công */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-800 font-semibold text-sm">Tọa độ GPS & Bán kính Chấm công</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={handleGetCurrentLocation}
              loading={isGettingLocation}
            >
              Lấy vị trí hiện tại
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <Input
              label="Vĩ độ (Latitude)"
              type="number"
              step="any"
              placeholder="Ví dụ: 10.762622"
              {...register('work_latitude')}
            />
            <Input
              label="Kinh độ (Longitude)"
              type="number"
              step="any"
              placeholder="Ví dụ: 106.660172"
              {...register('work_longitude')}
            />
            <Input
              label="Bán kính (mét)"
              type="number"
              placeholder="200"
              {...register('allowed_distance')}
            />
          </div>
        </div>

        {/* Ngoại lệ ca làm việc (WorkShiftException) */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-800 font-semibold text-sm">Ngoại lệ nhân viên (Giờ làm riêng biệt)</span>
              <p className="text-xs text-gray-500">Áp dụng khung giờ check-in/out riêng cho từng cá nhân</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() =>
                append({
                  user_id: '',
                  check_in: '08:30',
                  check_out: '17:30',
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: new Date().toISOString().split('T')[0],
                })
              }
            >
              Thêm ngoại lệ
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Chưa có ngoại lệ nào được thiết lập cho ca này.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50/60 flex flex-col gap-2.5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Ngoại lệ #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Xóa ngoại lệ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                    <div className="md:col-span-4">
                      <Controller
                        control={control}
                        name={`exceptions.${idx}.user_id`}
                        rules={{ required: 'Vui lòng chọn nhân viên' }}
                        render={({ field: uField }) => (
                          <Select
                            label="Nhân viên *"
                            placeholder="-- Chọn nhân viên --"
                            options={userOptions}
                            value={uField.value}
                            onChange={(e) => uField.onChange(e.target.value)}
                          />
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Giờ vào"
                        type="time"
                        {...register(`exceptions.${idx}.check_in`, { required: true })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Giờ ra"
                        type="time"
                        {...register(`exceptions.${idx}.check_out`, { required: true })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Từ ngày"
                        type="date"
                        {...register(`exceptions.${idx}.start_date`, { required: true })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Đến ngày"
                        type="date"
                        {...register(`exceptions.${idx}.end_date`, { required: true })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isPending}>
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ShiftFormModal;
