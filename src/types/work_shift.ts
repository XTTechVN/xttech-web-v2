export type ShiftType = 'morning' | 'afternoon' | 'full_day' | 'night';
export type WorkShiftStatus = 'active' | 'inactive';

export interface WorkShiftExceptionInput {
  userId: string;
  workShiftId?: number | null;
  checkIn: string; // "HH:MM:SS" or "HH:MM"
  checkOut: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
}

export interface WorkShiftException extends WorkShiftExceptionInput {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkShift {
  id: number;
  name: string;
  startTime: string; // "HH:MM:SS" or "HH:MM"
  endTime: string;
  departmentId?: number | null;
  shiftType?: ShiftType | string | null;
  workDays?: string | null; // e.g. "2,3,4,5,6"
  optionalWorkDays?: string | null; // e.g. "7,8"
  status: WorkShiftStatus | string;
  workLatitude?: number | null;
  workLongitude?: number | null;
  allowedDistance?: number | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  exceptions?: WorkShiftException[];
  workShiftExceptions?: WorkShiftException[];
  department?: {
    id: number;
    name: string;
    code?: string;
  } | null;
}

export interface WorkShiftCreate {
  name: string;
  startTime?: string;
  endTime?: string;
  departmentId?: number | null;
  shiftType?: ShiftType | string | null;
  workDays?: string | null;
  optionalWorkDays?: string | null;
  status?: WorkShiftStatus | string;
  workLatitude?: number | null;
  workLongitude?: number | null;
  allowedDistance?: number;
  workShiftExceptions?: WorkShiftExceptionInput[];
}

export type WorkShiftUpdate = Partial<WorkShiftCreate>;

export interface WorkShiftQueryParams {
  offset?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  shiftType?: string;
  status?: string;
}
