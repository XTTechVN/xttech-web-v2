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
import { Plus, Trash2 } from 'lucide-react';

import { Button, Input, Select } from '@/components';

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
    <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-slate-800 font-semibold text-sm">
            Ngoại lệ nhân viên (Giờ làm riêng biệt)
          </span>
          <p className="text-xs text-gray-500">
            Áp dụng khung giờ check-in/out riêng cho từng cá nhân
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-7 px-2.5"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddException}
        >
          Thêm ngoại lệ
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          Chưa có ngoại lệ nào được thiết lập cho ca này.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="p-3 border border-gray-200 rounded-lg bg-gray-50/60 flex flex-col gap-2.5 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">
                  Ngoại lệ #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                  title="Xóa ngoại lệ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                <div className="md:col-span-4">
                  <Controller
                    control={control}
                    name={`exceptions.${idx}.userId`}
                    rules={{ required: 'Vui lòng chọn nhân viên' }}
                    render={({ field: userField }) => (
                      <Select
                        label="Nhân viên *"
                        placeholder="-- Chọn nhân viên --"
                        options={userOptions}
                        value={userField.value}
                        onChange={(e) => userField.onChange(e.target.value)}
                      />
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Giờ vào"
                    type="time"
                    {...register(`exceptions.${idx}.checkIn`, {
                      required: true,
                    })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Giờ ra"
                    type="time"
                    {...register(`exceptions.${idx}.checkOut`, {
                      required: true,
                    })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Từ ngày"
                    type="date"
                    {...register(`exceptions.${idx}.startDate`, {
                      required: true,
                    })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Đến ngày"
                    type="date"
                    {...register(`exceptions.${idx}.endDate`, {
                      required: true,
                    })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
