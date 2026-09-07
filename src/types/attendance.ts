// =======================
// COMMON TYPES
// =======================
export interface Pagination {
    next: boolean;
    total: number;
    offset: number;
    limit: number;
}


export interface DataListResponse<T> {
    items: T[];
    meta?: Pagination;
}


// =======================
// USER
// =======================

// export interface User {
//     id: string;
//     email?: string;
//     username?: string;
//     fullName?: string;
//     phoneNumber?: string;
//     avatar?: string;
// }
export interface UserCreate {
    email: string;
    username: string;
    fullName: string;
    phoneNumber?: string | null;
    avatar?: string | null;
    gender?: string;
    birthday?: string | null;
    address?: string | null;
    joinedAt?: string | null;
    identifyCode: string;
    attendancePolicy?: string | null;
    password: string;
}


export interface UserResponse {
    id: string;
    email: string;
    username: string;
    fullName: string;
    phoneNumber: string | null;
    avatar: string | null;
    gender: 'male' | 'female' | 'other';
    birthday: string | null;
    address: string | null;
    joinedAt: string | null;
    identifyCode: string;
    attendancePolicy: string | null;
    createdAt: string;
    updatedAt: string;
}


// =======================
// ATTENDANCE
// =======================


export type AttendanceStatus =
    | "normal"
    | "present"
    | "late"
    | "early_leave"
    | "early_checkout"
    | "late_and_early_leave"
    | "absent"
    | "overtime"
    | "half_day"
    | "missing_checkout";

export type AttendanceStatusVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  normal: 'Đúng giờ',
  present: 'Đúng giờ',
  late: 'Đi muộn',
  absent: 'Vắng mặt',
  half_day: 'Nghỉ nửa ngày',
  early_leave: 'Về sớm',
  early_checkout: 'Về sớm',
  late_and_early_leave: 'Đi muộn & Về sớm',
  overtime: 'Tăng ca',
  missing_checkout: 'Quên check-out',
};

export const ATTENDANCE_STATUS_VARIANTS: Record<string, AttendanceStatusVariant> = {
  normal: 'success',
  present: 'success',
  late: 'warning',
  absent: 'danger',
  half_day: 'warning',
  early_leave: 'warning',
  early_checkout: 'warning',
  late_and_early_leave: 'warning',
  overtime: 'success',
  missing_checkout: 'warning',
};

export const ADJUSTMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  check_in: 'Bổ sung check-in',
  check_out: 'Bổ sung check-out',
  forgot_attendance: 'Quên chấm công',
  forget_checkin: 'Quên check-in',
  forget_checkout: 'Quên check-out',
  overtime: 'Tăng ca',
  both: 'Cả hai',
};

export const getAttendanceStatusLabel = (status: string | null | undefined): string => {
  if (!status) return 'Không xác định';
  return ATTENDANCE_STATUS_LABELS[status.toLowerCase()] || status;
};

export const getAttendanceStatusVariant = (status: string | null | undefined): AttendanceStatusVariant => {
  if (!status) return 'danger';
  return ATTENDANCE_STATUS_VARIANTS[status.toLowerCase()] ?? 'danger';
};

export const getAttendanceStatusInfo = (status: string | null | undefined): { label: string; variant: AttendanceStatusVariant } => {
  return {
    label: getAttendanceStatusLabel(status),
    variant: getAttendanceStatusVariant(status),
  };
};

export const getAdjustmentStatusLabel = (status: string | null | undefined): string => {
  if (!status) return 'Chờ duyệt';
  return ADJUSTMENT_STATUS_LABELS[status.toLowerCase()] || status;
};

export const getRequestTypeLabel = (type: string | null | undefined): string => {
  if (!type) return '';
  return REQUEST_TYPE_LABELS[type.toLowerCase()] || type;
};



export interface Attendance {
    id: number;
    userId: string;
    workShiftId: number | null;
    workDate: string;
    checkIn: string | null;
    checkInLatitude: number | null;
    checkInLongitude: number | null;
    isLate: boolean | null;
    lateMinutes: number | null;
    imgCheckinPath: string | null;
    checkOut: string | null;
    checkOutLatitude: number | null;
    checkOutLongitude: number | null;
    isEarlyLeave: boolean | null;
    earlyLeaveMinutes: number | null;
    imgCheckoutPath: string | null;
    status: string | null;
    note: string | null;
    totalHours: number | null;
    user: UserResponse | null;
    createdAt: string;
    updatedAt: string;
}




// =======================
// QUERY PARAMS
// =======================


export interface AttendanceQueryParams {
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    allowDeleted?: boolean;
    userId?: string;
    workDate?: string;
    startDate?: string;
    endDate?: string;
    departmentId?: number;
    status?: AttendanceStatus;
}



// =======================
// CREATE / UPDATE
// =======================


export interface AttendanceCreate {
    userId: string;
    workShiftId?: number;
    workDate: string;
    checkIn?: string | null;
    checkOut?: string | null;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
    isLate?: boolean;
    lateMinutes?: number;
    isEarlyLeave?: boolean;
    earlyLeaveMinutes?: number;
    imgCheckinPath?: string;
    imgCheckoutPath?: string;
    status?: AttendanceStatus;
    note?: string;
}



export interface AttendanceUpdate {
    checkIn?: string;
    checkOut?: string;
    status?: AttendanceStatus;
    note?: string;
}




// =================================================
// ATTENDANCE ADJUSTMENT REQUEST
// =================================================


export type AdjustmentStatus =
    | "pending"
    | "approved"
    | "rejected"


export type RequestType =
    | "check_in"
    | "check_out"
    | "forgot_attendance"
    | "overtime"
    | "both";

export interface AdjustmentRequestQueryParams {
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    allowDeleted?: boolean;
    userId?: string;
    workDate?: string;
    startDate?: string;
    endDate?: string;
    status?: AdjustmentStatus;
}

export interface AttendanceAdjustmentRequest {
    id: number;
    attendanceId: number | null;
    userId: string;
    user: UserResponse | null;
    requestType: RequestType;
    oldCheckIn?: string | null;
    oldCheckOut?: string | null;
    requestedCheckIn?: string | null;
    requestedCheckOut?: string | null;
    reason: string;
    status: AdjustmentStatus;
    workDate: string;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    reviewNote?: string | null;
    createdAt: string;
    updatedAt: string;
}



export interface AttendanceAdjustmentRequestCreate {
    attendanceId?: number | null;
    userId: string;
    requestType: RequestType;
    oldCheckIn?: string;
    oldCheckOut?: string;
    requestedCheckIn?: string;
    requestedCheckOut?: string;
    reason: string;
    status?: AdjustmentStatus;
    workDate: string;
}



export interface AttendanceAdjustmentRequestUpdate {
    requestType?: RequestType;
    requestedCheckIn?: string | null;
    requestedCheckOut?: string | null;
    reason?: string | null;
    status?: string | null;
    workDate?: string | null;

    reviewedBy?: string | null;
    reviewedAt?: string | null;
    reviewNote?: string | null;
}

export interface AdjustmentForm {
    userId: string;
    attendanceId: string;
    requestType: RequestType;
    workDate: string;
    oldCheckIn: string;
    oldCheckOut: string;
    requestedCheckIn: string;
    requestedCheckOut: string;
    reason: string;
}

// =======================
// AUTO TIMEKEEPING
// =======================

// Phân biệt loại điểm danh: check-in hoặc check-out
export type TimekeepingType = 'check_in' | 'check_out';

export interface AutoTimekeepingData {
    longitude: number;
    latitude: number;
    note?: string;
    type?: TimekeepingType;
}

// =======================
// DEPARTMENT
// =======================

// export interface Department {
//     id: number;
//     name: string;
//     code: string | null;
//     mainColor: string | null;
//     mainIcon: string | null;
//     createdAt: string;
//     updatedAt: string;
//     deletedAt: string | null;
// }

// export interface DepartmentQueryParams {
//     search?: string;
//     limit?: number;
//     offset?: number;
//     sortBy?: string;
//     sortOrder?: "asc" | "desc";
//     allowDeleted?: boolean;
// }

// export type DepartmentListResponse = DataListResponse<Department>;
