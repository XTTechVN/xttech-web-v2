'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, CalendarCheck, Clock, AlertTriangle, LogOut, Zap } from 'lucide-react';
import { StatsCard } from '@/components';
import { useQueryParam } from '@/hooks';
import { getAttendanceReport } from '@/actions';
import { getDefaultDateRange } from './table';

export function ReportStatsCards() {
  const defaultRange = useMemo(() => getDefaultDateRange(), []);

  const [fromDate] = useQueryParam('fromDate', defaultRange.from);
  const [toDate] = useQueryParam('toDate', defaultRange.to);
  const [departmentId] = useQueryParam('departmentId', '');
  const [attendancePolicy] = useQueryParam('attendancePolicy', '');
  const [search] = useQueryParam('search', '');

  const { data: reportData } = useQuery({
    queryKey: ['attendance-report', fromDate, toDate, departmentId, attendancePolicy, search],
    queryFn: () =>
      getAttendanceReport({
        fromDate,
        toDate,
        departmentId: departmentId ? Number(departmentId) : undefined,
        attendancePolicy: attendancePolicy || undefined,
        search: search || undefined,
      }),
    enabled: Boolean(fromDate && toDate),
  });

  const summary = reportData?.summary;

  const stats = [
    {
      title: 'Nhân sự có công',
      value: summary?.totalEmployees ?? 0,
      icon: <Users />,
    },
    {
      title: 'Tổng ngày công',
      value: `${summary?.totalWorkDays ?? 0} công`,
      icon: <CalendarCheck />,
    },
    {
      title: 'Tổng giờ làm',
      value: `${summary?.totalHours ?? 0}h`,
      icon: <Clock />,
    },
    {
      title: 'Lượt đi muộn',
      value: summary?.totalLateDays ?? 0,
      icon: <AlertTriangle />,
      trend: summary?.totalLateDays ? summary.totalLateDays : undefined,
      trendDirection: 'down' as const,
    },
    {
      title: 'Lượt về sớm',
      value: summary?.totalEarlyLeaveDays ?? 0,
      icon: <LogOut />,
      trend: summary?.totalEarlyLeaveDays ? summary.totalEarlyLeaveDays : undefined,
      trendDirection: 'down' as const,
    },
    {
      title: 'Lượt tăng ca (OT)',
      value: summary?.totalOvertimeDays ?? 0,
      icon: <Zap />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, idx) => (
        <StatsCard
          key={idx}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          trendDirection={stat.trendDirection}
        />
      ))}
    </div>
  );
}
