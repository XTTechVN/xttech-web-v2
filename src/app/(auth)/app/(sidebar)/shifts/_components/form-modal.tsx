'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MapPin, Plus, Trash2, Clock } from 'lucide-react';

import { Modal, Button, Input, Select, Switch } from '@/components';
import { createWorkShift, updateWorkShift, getDepartments, getEmployees } from '@/actions';
import queryClient from '@/utils/query';
import type { WorkShift, WorkShiftCreate, WorkShiftUpdate, Department } from '@/types';

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
  const shiftStatus = watch('status');

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const rawDays = initialData.workDays || initialData.work_days;
        const days = rawDays ? rawDays.split(',').map((d) => d.trim()) : ['2', '3', '4', '5', '6'];

        const formatTime = (t?: string) => (t ? t.slice(0, 5) : '');

        const startTime = initialData.startTime || initialData.start_time;
        const endTime = initialData.endTime || initialData.end_time;
        const sType = initialData.shiftType || initialData.shift_type || 'full_day';
        const deptId = initialData.departmentId ?? initialData.department_id ?? defaultDepartmentId ?? '';
        const lat = initialData.workLatitude ?? initialData.work_latitude ?? '';
        const lng = initialData.workLongitude ?? initialData.work_longitude ?? '';
        const dist = initialData.allowedDistance ?? initialData.allowed_distance ?? 200;
        const rawExceptions =
          initialData.exceptions ||
          initialData.workShiftExceptions ||
          initialData.workShiftException ||
          initialData.work_shift_exceptions ||
          initialData.work_shift_exception ||
          [];

        reset({
          name: initialData.name || '',
          start_time: formatTime(startTime) || '08:00',
          end_time: formatTime(endTime) || '17:30',
          department_id: deptId,
          shift_type: sType,
          work_days: days,
          status: (initialData.status as 'active' | 'inactive') || 'active',
          work_latitude: lat,
          work_longitude: lng,
          allowed_distance: dist,
          exceptions: rawExceptions.map((ex: any) => ({
            user_id: ex.userId || ex.user_id || '',
            check_in: formatTime(ex.checkIn || ex.check_in),
            check_out: formatTime(ex.checkOut || ex.check_out),
            start_date: ex.startDate || ex.start_date || '',
            end_date: ex.endDate || ex.end_date || '',
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
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi tạo ca làm việc');
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
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi cập nhật ca làm việc');
    },
  });

  const isPending = isCreating || isUpdating;

  // Xử lý toggle chọn ngày
  const toggleDay = (day: string) => {
    const current = new Set(selectedDays);
    if (current.has(day)) {
      current.delete(day);
    } else {
      current.add(day);
    }
    setValue('work_days', Array.from(current), { shouldValidate: true });
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
    if (data.work_days.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ngày làm việc');
      return;
    }

    const payload: any = {
      name: data.name.trim(),
      start_time: data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time,
      end_time: data.end_time.length === 5 ? `${data.end_time}:00` : data.end_time,
      department_id: data.department_id ? Number(data.department_id) : null,
      shift_type: data.shift_type,
      work_days: data.work_days.sort().join(','),
      status: data.status,
      work_latitude: data.work_latitude ? Number(data.work_latitude) : null,
      work_longitude: data.work_longitude ? Number(data.work_longitude) : null,
      allowed_distance: data.allowed_distance ? Number(data.allowed_distance) : 200,
      work_shift_exceptions: data.exceptions.map((ex) => ({
        user_id: ex.user_id,
        check_in: ex.check_in.length === 5 ? `${ex.check_in}:00` : ex.check_in,
        check_out: ex.check_out.length === 5 ? `${ex.check_out}:00` : ex.check_out,
        start_date: ex.start_date,
        end_date: ex.end_date,
      })),
    };

    if (initialData?.id) {
      updateMutation({ id: initialData.id, payload });
    } else {
      createMutation(payload);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="m-2 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              render={({ field }) => (
                <Select
                  label="Áp dụng cho Phòng ban"
                  placeholder="-- Toàn công ty / Chưa chỉ định --"
                  options={departmentOptions}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          ) : (
            <Input
              label="Phòng ban"
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

        {/* Ngày làm việc trong tuần */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-700 select-none">
            Ngày làm việc trong tuần *
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = selectedDays.includes(d.value);
              return (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => toggleDay(d.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border cursor-pointer select-none ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          {selectedDays.length === 0 && (
            <span className="text-xs text-red-500">Vui lòng chọn ít nhất 1 ngày</span>
          )}
        </div>

        {/* Cấu hình GPS Chấm công */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Tọa độ GPS & Bán kính Chấm công</span>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              label="Bán kính cho phép (mét)"
              type="number"
              placeholder="200"
              {...register('allowed_distance')}
            />
          </div>
        </div>

        {/* Ngoại lệ ca làm việc (WorkShiftException) */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Ngoại lệ nhân viên (Giờ làm riêng biệt)</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Giờ vào"
                        type="time"
                        {...register(`exceptions.${idx}.check_in`, { required: true })}
                      />
                      <Input
                        label="Giờ ra"
                        type="time"
                        {...register(`exceptions.${idx}.check_out`, { required: true })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Từ ngày"
                      type="date"
                      {...register(`exceptions.${idx}.start_date`, { required: true })}
                    />
                    <Input
                      label="Đến ngày"
                      type="date"
                      {...register(`exceptions.${idx}.end_date`, { required: true })}
                    />
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
