'use client';

import React from 'react';
import {
  Control,
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from 'react-hook-form';
import { Trash2 } from 'lucide-react';

import { Input } from '@/components';
import { DrawerSection, IconAction, SectionAdd, Select } from '@/components-remake';

export interface ShiftExceptionFormItem {
  userId: string;
  checkIn: string;
  checkOut: string;
  startDate: string;
  endDate: string;
}

export interface ShiftFormValues {
  name: string;
  startTime: string;
  endTime: string;
  departmentId: number | string;
  shiftType: string;
  workDays: string[];
  optionalWorkDays: string[];
  status: 'active' | 'inactive';
  workLatitude?: number | string;
  workLongitude?: number | string;
  allowedDistance?: number | string;
  exceptions: ShiftExceptionFormItem[];
}

export interface ShiftExceptionsSectionProps {
  control: Control<ShiftFormValues>;
  register: UseFormRegister<ShiftFormValues>;
  fields: FieldArrayWithId<ShiftFormValues, 'exceptions', 'id'>[];
  append: UseFieldArrayAppend<ShiftFormValues, 'exceptions'>;
  remove: UseFieldArrayRemove;
  userOptions: { value: string; label: string }[];
}

export const ShiftExceptionsSection: React.FC<ShiftExceptionsSectionProps> = ({
  control,
  register,
  fields,
  append,
  remove,
  userOptions,
}) => {
  const handleAddException = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    append({
      userId: '',
      checkIn: '08:30',
      checkOut: '17:30',
      startDate: todayStr,
      endDate: todayStr,
    });
  };

  return (
    <DrawerSection title="Giờ làm riêng theo nhân viên" action={<SectionAdd label="Thêm ngoại lệ" onClick={handleAddException} />}>
      {fields.length === 0 ? (
        <p className="text-sm text-slate-500">Chưa có ngoại lệ nào.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {fields.map((field, idx) => (
            <li key={field.id} className="flex flex-col gap-3 border-t border-slate-100 pt-3 first:border-0 first:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Ngoại lệ {idx + 1}</span>
                <IconAction label={`Xóa ngoại lệ ${idx + 1}`} danger onClick={() => remove(idx)} className="-my-2">
                  <Trash2 size={15} />
                </IconAction>
              </div>
              <Controller
                control={control}
                name={`exceptions.${idx}.userId`}
                rules={{ required: 'Vui lòng chọn nhân viên' }}
                render={({ field: userField }) => (
                  <Select label="Nhân viên *" placeholder="Chọn nhân viên" options={userOptions} value={userField.value ?? ''} onChange={userField.onChange} />
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Giờ vào" type="time" {...register(`exceptions.${idx}.checkIn`, { required: true })} />
                <Input label="Giờ ra" type="time" {...register(`exceptions.${idx}.checkOut`, { required: true })} />
                <Input label="Từ ngày" type="date" {...register(`exceptions.${idx}.startDate`, { required: true })} />
                <Input label="Đến ngày" type="date" {...register(`exceptions.${idx}.endDate`, { required: true })} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </DrawerSection>
  );
};
