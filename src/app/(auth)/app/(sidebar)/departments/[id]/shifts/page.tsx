'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ShiftActionBar, ShiftTable } from '@/app/(auth)/app/(sidebar)/shifts/_components';

export default function DepartmentShiftsPage() {
  const params = useParams();
  const departmentId = Number(params.id);

  return (
    <div className="flex flex-col gap-4">
      <ShiftActionBar defaultDepartmentId={departmentId} />
      <ShiftTable departmentId={departmentId} />
    </div>
  );
}
