'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, Sun, Building2, CheckCircle2 } from 'lucide-react';

import { getWorkShifts, getDepartments } from '@/actions';
import { ShiftActionBar, ShiftTable, ShiftStatCard } from './_components';

export default function ShiftsPage() {
  // Lấy tổng số ca làm việc
  const { data: shiftsData } = useQuery({
    queryKey: ['work_shifts', 'stats-total'],
    queryFn: () => getWorkShifts({ limit: 1000 }),
  });

  // Lấy tổng số phòng ban
  const { data: departmentData } = useQuery({
    queryKey: ['departments', 'stats-total'],
    queryFn: () => getDepartments({ limit: 1 }),
  });

  const allShifts = shiftsData?.items || [];
  const totalShifts = shiftsData?.meta?.total || allShifts.length || 0;
  const activeShifts = allShifts.filter((s: any) => s.status === 'active').length || totalShifts;
  const morningOrDayShifts =
    allShifts.filter((s: any) => (s.shiftType || s.shift_type) === 'morning' || (s.shiftType || s.shift_type) === 'full_day').length;
  const totalDepartments = departmentData?.meta?.total || 0;

  const shiftStats = [
    {
      title: 'Tổng số ca làm việc',
      value: totalShifts,
      icon: <CalendarClock />,
      trend: 8,
      trendDirection: 'up' as const,
    },
    {
      title: 'Đang hoạt động',
      value: activeShifts,
      icon: <CheckCircle2 />,
      trend: 5,
      trendDirection: 'up' as const,
    },
    {
      title: 'Ca sáng / Hành chính',
      value: morningOrDayShifts,
      icon: <Sun />,
      trend: 12,
      trendDirection: 'up' as const,
    },
    {
      title: 'Phòng ban áp dụng',
      value: totalDepartments,
      icon: <Building2 />,
      trend: 0,
      trendDirection: 'up' as const,
    },
  ];

  return (
    <div className="flex w-full h-full flex-1 flex-col gap-4">
      {/* Khối thống kê Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {shiftStats.map((stat, index) => (
          <ShiftStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendDirection={stat.trendDirection}
          />
        ))}
      </div>

      {/* Action Bar (Thêm ca làm việc) */}
      <div className="flex justify-end">
        <ShiftActionBar />
      </div>

      {/* Danh sách ca làm việc */}
      <ShiftTable />
    </div>
  );
}
