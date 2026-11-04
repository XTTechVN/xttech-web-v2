'use client';

import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import toast from 'react-hot-toast';

import { Button, Input } from '@/components';
import type { ShiftFormValues } from './shift-exceptions-section';

export interface ShiftGpsSectionProps {
  register: UseFormRegister<ShiftFormValues>;
  setValue: UseFormSetValue<ShiftFormValues>;
}

export const ShiftGpsSection: React.FC<ShiftGpsSectionProps> = ({
  register,
  setValue,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ Geolocation');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('workLatitude', Number(position.coords.latitude.toFixed(6)));
        setValue('workLongitude', Number(position.coords.longitude.toFixed(6)));
        setIsGettingLocation(false);
        toast.success('Đã lấy tọa độ GPS thành công');
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error(`Không thể lấy vị trí: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-800 font-semibold text-sm">
          Tọa độ GPS & Bán kính Chấm công
        </span>
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
          {...register('workLatitude')}
        />
        <Input
          label="Kinh độ (Longitude)"
          type="number"
          step="any"
          placeholder="Ví dụ: 106.660172"
          {...register('workLongitude')}
        />
        <Input
          label="Bán kính (mét)"
          type="number"
          placeholder="200"
          {...register('allowedDistance')}
        />
      </div>
    </div>
  );
};
