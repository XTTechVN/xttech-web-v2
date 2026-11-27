'use client';

import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import toast from 'react-hot-toast';

import { Input } from '@/components';
import { Button, DrawerSection } from '@/components-remake';
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
    <DrawerSection
      title="Vị trí chấm công (GPS)"
      action={
        <Button variant="ghost" className="text-primary" onClick={handleGetCurrentLocation} loading={isGettingLocation}>
          Lấy vị trí hiện tại
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Input label="Vĩ độ" type="number" step="any" placeholder="10.762622" {...register('workLatitude')} />
        <Input label="Kinh độ" type="number" step="any" placeholder="106.660172" {...register('workLongitude')} />
        <div className="col-span-2 md:col-span-1">
          <Input label="Bán kính (mét)" type="number" placeholder="200" {...register('allowedDistance')} />
        </div>
      </div>
    </DrawerSection>
  );
};
