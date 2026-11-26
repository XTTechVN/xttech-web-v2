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
        limit: 10,
      }),
    enabled: Boolean(user?.id),
    staleTime: 2000 * 60, // 2 phút coi là fresh
  });

  const validItems = (data?.items ?? []).filter(
    (item) =>
      item.workDate === todayStr &&
      item.status !== 'absent' &&
      item.status !== 'leave' &&
      item.status !== 'overtime',
  );

  const openAttendance = validItems.find((item) => Boolean(item.checkIn) && !item.checkOut) ?? null;
  const todayAttendance: Attendance | null = openAttendance ?? validItems[0] ?? null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const checkInStr = openAttendance?.checkIn ?? '';
  const isMorningCheckIn = Boolean(checkInStr) && checkInStr.slice(0, 5) < '12:00';
  const isExpiredMorningShift =
    Boolean(openAttendance) &&
    user?.attendancePolicy !== 'part_time' &&
    isMorningCheckIn &&
    currentMinutes >= 12 * 60 + 30;

  const hasCheckedIn = isExpiredMorningShift ? false : Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = isExpiredMorningShift ? false : Boolean(todayAttendance?.checkOut);
  const isWorkingShift = Boolean(openAttendance) && !isExpiredMorningShift;

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
