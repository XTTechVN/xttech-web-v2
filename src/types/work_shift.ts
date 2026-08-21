export interface WorkShiftException {
  id?: number;
  workShiftId?: number;
  userId: string;
  checkIn: string; // "HH:MM:SS" or "HH:MM"
  checkOut: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  createdAt?: string;
  updatedAt?: string;

  // Fallback aliases for snake_case
  work_shift_id?: number;
  user_id?: string;
  check_in?: string;
  check_out?: string;
  start_date?: string;
  end_date?: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'full_day' | 'night';

export interface WorkShift {
  id: number;
  name: string;
  startTime: string; // "HH:MM:SS" or "HH:MM"
  endTime: string;
  departmentId?: number | null;
  shiftType?: ShiftType | string;
  workDays?: string; // e.g. "2,3,4,5,6,7,8"
  status: 'active' | 'inactive' | string;
  workLatitude?: number | null;
  workLongitude?: number | null;
  allowedDistance?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  workShiftException?: WorkShiftException[];
  workShiftExceptions?: WorkShiftException[];
  exceptions?: WorkShiftException[];
  department?: {
    id: number;
    name: string;
    code?: string;
  };

  // Fallback aliases for snake_case
  start_time?: string;
  end_time?: string;
  department_id?: number | null;
  shift_type?: string;
  work_days?: string;
  work_latitude?: number | null;
  work_longitude?: number | null;
  allowed_distance?: number;
  work_shift_exception?: WorkShiftException[];
  work_shift_exceptions?: WorkShiftException[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkShiftCreate {
  name: string;
  startTime?: string;
  endTime?: string;
  departmentId?: number | null;
  shiftType?: string;
  workDays?: string;
  status?: string;
  workLatitude?: number | null;
  workLongitude?: number | null;
  allowedDistance?: number;
  workShiftExceptions?: WorkShiftException[];

  // Fallback snake_case
  start_time?: string;
  end_time?: string;
  department_id?: number | null;
  shift_type?: string;
  work_days?: string;
  work_latitude?: number | null;
  work_longitude?: number | null;
  allowed_distance?: number;
  work_shift_exceptions?: WorkShiftException[];
}

export interface WorkShiftUpdate {
  name?: string;
  startTime?: string;
  endTime?: string;
  departmentId?: number | null;
  shiftType?: string;
  workDays?: string;
  status?: string;
  workLatitude?: number | null;
  workLongitude?: number | null;
  allowedDistance?: number;
  workShiftExceptions?: WorkShiftException[];

  // Fallback snake_case
  start_time?: string;
  end_time?: string;
  department_id?: number | null;
  shift_type?: string;
  work_days?: string;
  work_latitude?: number | null;
  work_longitude?: number | null;
  allowed_distance?: number;
  work_shift_exceptions?: WorkShiftException[];
}

export interface WorkShiftQueryParams {
  offset?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  shiftType?: string;
  status?: string;

  // Fallback snake_case
  department_id?: number;
  shift_type?: string;
}
