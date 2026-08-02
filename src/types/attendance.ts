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
    pagination: Pagination;
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
    | "present"
    | "late"
    | "early_leave"
    | "absent"
    | "half_day";



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
    status?: AttendanceStatus;
}



// =======================
// CREATE / UPDATE
// =======================


export interface AttendanceCreate {
    userId: string;
    workShiftId?: number;
    workDate: string;
    checkIn?: string;
    checkOut?: string;
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


export interface AutoTimekeepingData {
    longitude: number;
    latitude: number;
    note?: string;
}
