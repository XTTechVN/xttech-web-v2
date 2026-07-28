// src/services/attendance.api.ts

import axios from "axios";

/**
 * Axios Client
 */
const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});


axiosClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});


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

export interface User {
    id: string;
    email?: string;
    username?: string;
    fullName?: string;
    phoneNumber?: string;
    avatar?: string;
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
    workShiftId?: number;
    workDate: string;
    checkIn?: string;
    checkOut?: string;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
    isLate: boolean;
    lateMinutes: number;
    isEarlyLeave: boolean;
    earlyLeaveMinutes: number;
    imgCheckinPath?: string;
    imgCheckoutPath?: string;
    status: AttendanceStatus;
    note?: string;
    totalHours?: number;
    user?: User;
    createdAt?: string;
    updatedAt?: string;
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
    | "rejected";


export type RequestType =
    | "check_in"
    | "check_out"
    | "both";



export interface AttendanceAdjustmentRequest {
    id: number;
    attendanceId?: number;
    requestType: RequestType;
    oldCheckIn?: string;
    oldCheckOut?: string;
    requestedCheckIn?: string;
    requestedCheckOut?: string;
    reason: string;
    status: AdjustmentStatus;
    workDate: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNote?: string;
    createdAt?: string;
    updatedAt?: string;
}



export interface AttendanceAdjustmentRequestCreate {
    attendanceId?: number;
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
    status?: AdjustmentStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNote?: string;
}



// =======================
// AUTO TIMEKEEPING
// =======================


export interface AutoTimekeepingData {
    longitude: number;
    latitude: number;
    note?: string;
}



// =================================================
// API FUNCTIONS
// =================================================


export const attendanceApi = {
    /**
     * GET /attendances
     * Danh sách chấm công
     */
    getAttendances(params?: AttendanceQueryParams) {
        return axiosClient.get<DataListResponse<Attendance>>(
            "/attendances", { params }
        );
    },
    /**
     * GET /attendances/:id
     * Chi tiết chấm công
     */
    getAttendanceById(id: number) {
        return axiosClient.get<Attendance>(`/attendances/${id}`);
    },
    /**
     * POST /attendances
     * Tạo chấm công thủ công
     */
    createAttendance(data: AttendanceCreate) {
        return axiosClient.post<Attendance>(
            "/attendances",
            data
        );
    },
    /**
     * PUT /attendances/:id
     * Update chấm công
     */
    updateAttendance(id: number, data: AttendanceUpdate) {
        return axiosClient.put<Attendance>(`/attendances/${id}`, data);
    },
    /**
     * DELETE /attendances/:id
     */
    deleteAttendance(id: number) {
        return axiosClient.delete<Attendance>(`/attendances/${id}`);
    },
    /**
     * POST /attendances/auto-timekeeping
     * Checkin checkout bằng ảnh + GPS
     */
    autoTimekeeping(data: AutoTimekeepingData, image: File) {
        const formData = new FormData();
        formData.append(
            "data",
            JSON.stringify(data)
        );
        formData.append(
            "image",
            image
        );
        return axiosClient.post<Attendance>(
            "/attendances/auto-timekeeping",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
    },
    // =================================================
    // ADJUSTMENT REQUEST
    // =================================================
    /**
     * GET /attendances/requests
     */
    getAdjustmentRequests(params?: AttendanceQueryParams) {
        return axiosClient.get<DataListResponse<AttendanceAdjustmentRequest>>(
            "/attendances/requests",
            { params }
        );
    },
    /**
     * GET /requests/:id
     */
    getAdjustmentRequestById(id: number) {
        return axiosClient.get<AttendanceAdjustmentRequest>(`/attendances/requests/${id}`);
    },
    /**
     * POST /requests
     */
    createAdjustmentRequest(data: AttendanceAdjustmentRequestCreate) {
        return axiosClient.post<AttendanceAdjustmentRequest>(
            "/attendances/requests",
            data
        );
    },
    /**
     * PUT /requests/:id
     * Approve / Reject
     */
    updateAdjustmentRequest(id: number, data: AttendanceAdjustmentRequestUpdate) {
        return axiosClient.put<AttendanceAdjustmentRequest>(
            `/attendances/requests/${id}`,
            data
        );
    },
    /**
     * DELETE /requests/:id
     */
    deleteAdjustmentRequest(id: number) {
        return axiosClient.delete<AttendanceAdjustmentRequest>(
            `/attendances/requests/${id}`
        );
    }
};



export default attendanceApi;