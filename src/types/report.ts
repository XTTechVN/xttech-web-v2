export interface AttendanceReportQueryParams {
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  departmentId?: number;
  userId?: string;
  attendancePolicy?: string;
  search?: string;
}

export interface AttendanceReportItem {
  userId: string;
  identifyCode?: string;
  fullName?: string;
  username?: string;
  email?: string;
  avatar?: string;
  departmentId?: number | null;
  departmentName?: string | null;
  attendancePolicy?: 'administrative' | 'seasonal' | 'part_time' | string;

  totalAttendances: number;
  workDays?: number | null; // null đối với part_time
  weekdayWorkDays?: number | null;
  sundayWorkDays?: number | null;
  totalHours: number;
  lateDays: number;
  lateMinutes: number;
  earlyLeaveDays: number;
  earlyLeaveMinutes: number;
  overtimeDays: number;
  overtimeHours: number;
  weekdayOvertimeHours?: number;
  sundayOvertimeHours?: number;
}

export interface AttendanceReportSummary {
  fromDate: string;
  toDate: string;
  totalEmployees: number;
  totalWorkDays: number;
  totalWeekdayWorkDays?: number;
  totalSundayWorkDays?: number;
  totalHours: number;
  totalLateDays: number;
  totalEarlyLeaveDays: number;
  totalOvertimeDays: number;
  totalOvertimeHours?: number;
  totalWeekdayOvertimeHours?: number;
  totalSundayOvertimeHours?: number;
}

export interface AttendanceReportResponse {
  summary: AttendanceReportSummary;
  items: AttendanceReportItem[];
}
