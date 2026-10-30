export type RosterMemberStatus = 'working' | 'flexible' | 'on_leave' | 'partial_leave' | 'day_off';

export interface DepartmentRosterItem {
  userId: string;
  fullName: string;
  avatar?: string | null;
  phoneNumber?: string | null;
  positionName?: string | null;
  attendancePolicy?: string | null;
  status: RosterMemberStatus;
  shiftId?: number | null;
  shiftName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  leaveDurationType?: 'full_day' | 'morning' | 'afternoon' | 'custom_shift' | null;
  actualStatus?: 'present' | 'late' | 'absent' | 'forgot_checkout' | 'leave' | null;
  actualCheckIn?: string | null;
  actualCheckOut?: string | null;
}

export interface DepartmentRosterSummary {
  totalMembers: number;
  workingCount: number;
  onLeaveCount: number;
  dayOffCount: number;
  flexibleCount?: number;
  actualPresentCount?: number | null;
  actualAbsentCount?: number | null;
}

export interface DepartmentRosterResponse {
  targetDate: string;
  departmentId: number;
  departmentName: string;
  summary: DepartmentRosterSummary;
  members: DepartmentRosterItem[];
}

export interface DepartmentRosterQueryParams {
  targetDate?: string;
  departmentId?: number;
}

export interface DaySampleMember {
  userId: string;
  fullName: string;
  avatar?: string | null;
  status: string;
}

export interface DayRosterSummaryItem {
  date: string;
  workingCount: number;
  flexibleCount: number;
  onLeaveCount: number;
  dayOffCount: number;
  actualPresentCount?: number | null;
  actualAbsentCount?: number | null;
  sampleMembers: DaySampleMember[];
}

export interface MonthRosterResponse {
  month: string;
  departmentId: number;
  departmentName: string;
  days: DayRosterSummaryItem[];
}

export interface MonthRosterQueryParams {
  month?: string;
  departmentId?: number;
}
