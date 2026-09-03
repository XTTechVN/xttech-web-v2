'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { getDepartment } from '@/actions';
import DepartmentHeader from './_components/department-header';
import { DepartmentPositionsSection } from './_components/positions/positions-section';
import { DepartmentShiftsSection } from './_components/shifts/shifts-section';
import { DepartmentMembersSection } from './_components/members/members-section';

export default function DepartmentDetailPage() {
  const params = useParams();
  const departmentId = Number(params.id);

  const [positionsCount, setPositionsCount] = useState<number>(0);
  const [shiftsCount, setShiftsCount] = useState<number>(0);
  const [membersCount, setMembersCount] = useState<number>(0);

  // Lấy thông tin chi tiết phòng ban hiện tại
  const { data: departmentDetail, isLoading: isLoadingDept } = useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => getDepartment(departmentId),
    enabled: !!departmentId,
  });

  return (
    <div className="flex flex-col gap-4 text-black w-full">
      {/* Header Banner & Stats */}
      <DepartmentHeader
        department={departmentDetail}
        positionsCount={positionsCount}
        shiftsCount={shiftsCount}
        membersCount={membersCount}
        isLoading={isLoadingDept}
      />

      {/* Div 1: Grid 5 - 7 (Vị trí & Ca làm việc) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Vị trí & Chức danh (5 cột) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <DepartmentPositionsSection
            departmentId={departmentId}
            onCountChange={setPositionsCount}
          />
        </div>

        {/* Ca làm việc (7 cột) */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <DepartmentShiftsSection
            departmentId={departmentId}
            onCountChange={setShiftsCount}
          />
        </div>
      </div>

      {/* Div 2: Nhân sự phòng ban (Dạng Bảng) */}
      <div className="w-full">
        <DepartmentMembersSection
          departmentId={departmentId}
          onCountChange={setMembersCount}
        />
      </div>
    </div>
  );
}