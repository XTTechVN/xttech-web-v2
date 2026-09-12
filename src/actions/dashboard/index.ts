import api from '@/utils/api';
import type { DashboardSummary, DashboardPendingLeave, DashboardPendingAdjustment } from '@/types';
import { getEmployees } from '../employee';
import { getAttendances, getAdjustmentRequests, getLiveLocations } from '../attendance';
import { getLeaveRequests } from '../leave-request';
import { getProjects } from '../project';
import { useAuthStore } from '@/stores';

const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  // 1. Thử gọi API chuyên dụng từ Backend nếu có
  try {
    const res = await api.get<DashboardSummary>('/api/v1/dashboard/summary');
    if (res.data && typeof res.data.totalEmployees === 'number') {
      return res.data;
    }
  } catch {
    // Nếu API tổng hợp chưa có trên backend deploy, fallback sang tổng hợp song song client-side
  }

  // 2. Fallback: Tổng hợp từ các API sẵn có trong hệ thống
  const today = new Date();
  const todayStr = formatDate(today);
  const currentUserId = useAuthStore.getState().user?.id;

  const [
    employeesRes,
    attendancesRes,
    pendingLeavesRes,
    pendingAdjustmentsRes,
    projectsRes,
    liveLocationsRes,
  ] = await Promise.allSettled([
    getEmployees({ limit: 1 }),
    getAttendances({ workDate: todayStr, limit: 100 }),
    getLeaveRequests({ status: 'pending', limit: 5 }),
    getAdjustmentRequests({ status: 'pending', limit: 5 }),
    getProjects({ limit: 1 }),
    getLiveLocations(),
  ]);

  const totalEmployees =
    employeesRes.status === 'fulfilled' ? employeesRes.value?.meta?.total ?? 0 : 0;

  const todayAttendancesList =
    attendancesRes.status === 'fulfilled' ? attendancesRes.value?.items ?? [] : [];

  const todayAttendancesCount = todayAttendancesList.filter((a) => Boolean(a.checkIn)).length;

  const pendingLeavesCount =
    pendingLeavesRes.status === 'fulfilled' ? pendingLeavesRes.value?.meta?.total ?? 0 : 0;

  const pendingAdjustmentsCount =
    pendingAdjustmentsRes.status === 'fulfilled' ? pendingAdjustmentsRes.value?.meta?.total ?? 0 : 0;

  const activeProjectsCount =
    projectsRes.status === 'fulfilled' ? projectsRes.value?.meta?.total ?? 0 : 0;

  const onlineStaffCount =
    liveLocationsRes.status === 'fulfilled' && Array.isArray(liveLocationsRes.value)
      ? liveLocationsRes.value.length
      : 0;

  // Lấy bản ghi chấm công của bản thân hôm nay
  const myAttRecord = currentUserId
    ? todayAttendancesList.find((a) => a.userId === currentUserId)
    : null;

  const myAttendance = {
    hasAttendance: Boolean(myAttRecord),
    checkIn: myAttRecord?.checkIn ?? null,
    checkOut: myAttRecord?.checkOut ?? null,
    isLate: myAttRecord?.isLate ?? false,
    lateMinutes: myAttRecord?.lateMinutes ?? 0,
    status: myAttRecord?.status ?? null,
    workShiftName: 'Ca làm việc tiêu chuẩn',
    workShiftStart: '08:00:00',
    workShiftEnd: '17:30:00',
  };

  // 7 ngày gần nhất
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const weeklyStats = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - idx));
    const dStr = formatDate(d);
    const dayLabel = dayNames[d.getDay()];

    // Với ngày hôm nay, lấy con số thực tế
    const isToday = dStr === todayStr;
    const presentCount = isToday ? todayAttendancesCount : 0;
    const lateCount = isToday
      ? todayAttendancesList.filter((a) => Boolean(a.isLate)).length
      : 0;

    return {
      date: dStr,
      dayName: dayLabel,
      presentCount,
      lateCount,
    };
  });

  // Chuyển đổi danh sách đơn nghỉ phép chờ duyệt
  const recentPendingLeaves: DashboardPendingLeave[] =
    pendingLeavesRes.status === 'fulfilled' && pendingLeavesRes.value?.items
      ? pendingLeavesRes.value.items.map((lr) => ({
          id: typeof lr.id === 'string' ? parseInt(lr.id, 10) || 0 : lr.id,
          userId: lr.userId,
          userFullName: lr.user?.fullName || lr.user?.username || 'Nhân viên',
          userAvatar: lr.user?.avatar ?? null,
          leaveType: lr.leaveType,
          startDate: lr.startDate,
          endDate: lr.endDate,
          totalDays: lr.totalDays ?? 1,
          reason: lr.reason,
        }))
      : [];


  // Chuyển đổi danh sách giải trình công chờ duyệt
  const recentPendingAdjustments: DashboardPendingAdjustment[] =
    pendingAdjustmentsRes.status === 'fulfilled' && pendingAdjustmentsRes.value?.items
      ? pendingAdjustmentsRes.value.items.map((adj) => ({
          id: adj.id,
          userId: adj.userId,
          userFullName: adj.user?.fullName || adj.user?.username || 'Nhân viên',
          userAvatar: adj.user?.avatar ?? null,
          requestType: adj.requestType,
          workDate: adj.workDate ?? null,
          requestedCheckIn: adj.requestedCheckIn ?? null,
          requestedCheckOut: adj.requestedCheckOut ?? null,
          reason: adj.reason,
        }))
      : [];

  return {
    totalEmployees,
    todayAttendancesCount,
    pendingLeavesCount,
    pendingAdjustmentsCount,
    activeProjectsCount,
    onlineStaffCount,
    myAttendance,
    weeklyStats,
    recentPendingLeaves,
    recentPendingAdjustments,
  };
};
