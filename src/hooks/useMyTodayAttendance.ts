'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { getAttendances } from '@/actions';
import { Attendance } from '@/types';

// Helper lấy ngày hiện tại theo giờ địa phương định dạng YYYY-MM-DD
const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useMyTodayAttendance() {
  const user = useAuthStore((state) => state.user);
  const todayStr = useMemo(() => getLocalDateString(), []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-today-attendance', user?.id, todayStr],
    queryFn: () =>
      getAttendances({
        userId: user?.id,
        startDate: todayStr,
        endDate: todayStr,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 1,
      }),
    enabled: Boolean(user?.id),
    staleTime: 2000 * 60, // 2 phút coi là fresh
  });

  const todayAttendance: Attendance | null = data?.items?.[0] ?? null;
  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);
  const isWorkingShift = hasCheckedIn && !hasCheckedOut;

  return {
    attendance: todayAttendance,
    hasCheckedIn,
    hasCheckedOut,
    isWorkingShift,
    isLoading,
    refetch,
  };
}
