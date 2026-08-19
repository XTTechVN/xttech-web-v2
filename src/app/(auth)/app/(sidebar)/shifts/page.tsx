'use client';

import React from 'react';
import { Heading } from '@/components';
import { ShiftActionBar, ShiftTable } from './_components';

export default function ShiftsPage() {
  return (
    <div className="flex w-full h-full flex-1 flex-col gap-5">
      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading as="h2" size="h2" className="text-xl md:text-2xl font-bold text-gray-900">
            Quản lý ca làm việc
          </Heading>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Cấu hình thời gian làm việc, bán kính GPS chấm công và ngoại lệ cho toàn bộ nhân sự
          </p>
        </div>

        <ShiftActionBar />
      </div>

      {/* Danh sách ca làm việc */}
      <ShiftTable />
    </div>
  );
}
