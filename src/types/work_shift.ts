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
}

export type ShiftType = 'morning' | 'afternoon' | 'full_day' | 'night';

export interface WorkShift {
  id: number;
  name: string;
  startTime: string; // "HH:MM:SS" or "HH:MM"
  endTime: string;
  departmentId?: number | null;
  shiftType?: ShiftType | string;
  workDays?: string; // e.g. "2,3,4,5,6,7"
  optionalWorkDays?: string; // e.g. "8"
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
}

export interface WorkShiftCreate {
  name: string;
  startTime?: string;
  endTime?: string;
  departmentId?: number | null;
  shiftType?: string;
  workDays?: string;
  optionalWorkDays?: string;
  status?: string;
  workLatitude?: number | null;
  workLongitude?: number | null;
  allowedDistance?: number;
  workShiftExceptions?: WorkShiftException[];
}

export interface WorkShiftUpdate {
  name?: string;
  startTime?: string;
  endTime?: string;
  departmentId?: number | null;
  shiftType?: string;
  workDays?: string;
  optionalWorkDays?: string;
  status?: string;
  workLatitude?: number | null;
  workLongitude?: number | null;
  allowedDistance?: number;
  workShiftExceptions?: WorkShiftException[];
}

export interface WorkShiftQueryParams {
  offset?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  shiftType?: string;
  status?: string;
}
