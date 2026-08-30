export interface AttendanceReportQueryParams {
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  from_date?: string; // fallback
  to_date?: string; // fallback
  departmentId?: number;
  department_id?: number;
  userId?: string;
  user_id?: string;
  attendancePolicy?: string;
  attendance_policy?: string;
  search?: string;
}

export interface AttendanceReportItem {
  userId: string;
  user_id?: string;
  identifyCode?: string;
  identify_code?: string;
  fullName?: string;
  full_name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  departmentId?: number | null;
  department_id?: number | null;
  departmentName?: string | null;
  department_name?: string | null;
  attendancePolicy?: 'administrative' | 'seasonal' | 'part_time' | string;
  attendance_policy?: string;

  totalAttendances: number;
  total_attendances?: number;
  workDays?: number | null; // null đối với part_time
  work_days?: number | null;
  weekdayWorkDays?: number | null;
  weekday_work_days?: number | null;
  sundayWorkDays?: number | null;
  sunday_work_days?: number | null;
  totalHours: number;
  total_hours?: number;
  lateDays: number;
  late_days?: number;
  lateMinutes: number;
  late_minutes?: number;
  earlyLeaveDays: number;
  early_leave_days?: number;
  earlyLeaveMinutes: number;
  early_leave_minutes?: number;
  overtimeDays: number;
  overtime_days?: number;
  overtimeHours: number;
  overtime_hours?: number;
  weekdayOvertimeHours?: number;
  weekday_overtime_hours?: number;
  sundayOvertimeHours?: number;
  sunday_overtime_hours?: number;
}

export interface AttendanceReportSummary {
  fromDate: string;
  from_date?: string;
  toDate: string;
  to_date?: string;
  totalEmployees: number;
  total_employees?: number;
  totalWorkDays: number;
  total_work_days?: number;
  totalWeekdayWorkDays?: number;
  total_weekday_work_days?: number;
  totalSundayWorkDays?: number;
  total_sunday_work_days?: number;
  totalHours: number;
  total_hours?: number;
  totalLateDays: number;
  total_late_days?: number;
  totalEarlyLeaveDays: number;
  total_early_leave_days?: number;
  totalOvertimeDays: number;
  total_overtime_days?: number;
  totalOvertimeHours?: number;
  total_overtime_hours?: number;
  totalWeekdayOvertimeHours?: number;
  total_weekday_overtime_hours?: number;
  totalSundayOvertimeHours?: number;
  total_sunday_overtime_hours?: number;
}

export interface AttendanceReportResponse {
  summary: AttendanceReportSummary;
  items: AttendanceReportItem[];
}
