export interface MyAttendanceToday {
  hasAttendance: boolean;
  checkIn: string | null;
  checkOut: string | null;
  isLate: boolean | null;
  lateMinutes: number | null;
  status: string | null;
  workShiftName: string | null;
  workShiftStart: string | null;
  workShiftEnd: string | null;
}

export interface WeeklyDayStat {
  date: string;
  dayName: string;
  presentCount: number;
  lateCount: number;
}

export interface DashboardPendingLeave {
  id: number;
  userId: string;
  userFullName: string;
  userAvatar?: string | null;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
}

export interface DashboardPendingAdjustment {
  id: number;
  userId: string;
  userFullName: string;
  userAvatar?: string | null;
  requestType: string;
  workDate?: string | null;
  requestedCheckIn?: string | null;
  requestedCheckOut?: string | null;
  reason: string;
}

export interface DashboardSummary {
  totalEmployees: number;
  todayAttendancesCount: number;
  pendingLeavesCount: number;
  pendingAdjustmentsCount: number;
  activeProjectsCount: number;
  onlineStaffCount: number;
  myAttendance: MyAttendanceToday;
  weeklyStats: WeeklyDayStat[];
  recentPendingLeaves: DashboardPendingLeave[];
  recentPendingAdjustments: DashboardPendingAdjustment[];
}
