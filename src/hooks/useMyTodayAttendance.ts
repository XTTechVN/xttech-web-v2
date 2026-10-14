'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { getAttendances } from '@/actions';
import { Attendance } from '@/types';
import { useLocalToday } from './use-local-today';

export function useMyTodayAttendance() {
  const user = useAuthStore((state) => state.user);
  // Không dùng useMemo([]): app native giữ JS state qua đêm -> ngày bị đóng băng ở hôm qua,
  // khiến ca hôm nay bị hiểu nhầm là "đã check-out" và Native Tracking bị dừng.
  const todayStr = useLocalToday();

  const { data, isLoading, isSuccess, refetch } = useQuery({
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
    isSuccess,
    refetch,
  };
}
