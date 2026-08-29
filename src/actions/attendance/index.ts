import api from "@/utils/api";
import { useAuthStore } from "@/stores";
import { BASE_API_URL } from "@/config";
import {
    Attendance,
    AttendanceCreate,
    DataListResponse,
    AttendanceQueryParams,
    AttendanceAdjustmentRequest,
    AutoTimekeepingData,AttendanceAdjustmentRequestCreate,
    AdjustmentRequestQueryParams,
    AttendanceAdjustmentRequestUpdate,
    LocationPingPayload,
    StaffLiveLocation,
    StaffRouteResponse,
} from "@/types";


const baseVersion1 = "/api/v1";


export const getAttendances = async (
    params: AttendanceQueryParams = {}
) => {
    const response = await api.get<DataListResponse<Attendance>>(
        `${baseVersion1}/attendances`,
        { params }
    );

    return response.data;
};

export const createAttendance = async (data: AttendanceCreate) => {
    return api.post<Attendance>(`${baseVersion1}/attendances`, data);
}

export const getAttendanceById = async (id: number) => {
    return api.get<Attendance>(`${baseVersion1}/attendances/${id}`);
}

export const updateAttendance = async (id: number, data: Attendance) => {
    return api.put<Attendance>(`${baseVersion1}/attendances/${id}`, data);
}
export const deleteAttendance = async (id: number) => {
    return api.delete<Attendance>(`${baseVersion1}/attendances/${id}`);
}

export const autoTimekeeping = async (data: AutoTimekeepingData, image: File) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('image', image);

    // Dùng native fetch thay axios để tránh vấn đề Content-Type của axios instance
    // fetch + FormData tự động set đúng multipart/form-data; boundary=...
    const accessToken = useAuthStore.getState().accessToken;
    const response = await fetch(`${BASE_API_URL}${baseVersion1}/users/attendance`, {
        method: 'POST',
        headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { response: { data: errorData, status: response.status } };
    }

    return response.json() as Promise<Attendance>;
};

export const getAdjustmentRequests = async (
    params?: AdjustmentRequestQueryParams
) => {
    const res = await api.get<DataListResponse<AttendanceAdjustmentRequest>>(
        `${baseVersion1}/attendance-request`,
        { params }
    );

    return res.data;
};
export const getAdjustmentRequestById = async (id: number) => {
    return api.get<AttendanceAdjustmentRequest>(`${baseVersion1}/attendances/requests/${id}`);
}
export const createAdjustmentRequest = async (
    data: AttendanceAdjustmentRequestCreate
) => {
    const res = await api.post<AttendanceAdjustmentRequest>(
        `${baseVersion1}/attendance-request`,
        data
    );
    return res.data;
};
export const updateAdjustmentRequest = async (id: number, data: AttendanceAdjustmentRequestUpdate) => {
    return api.put<AttendanceAdjustmentRequest>(
        `${baseVersion1}/attendance-request/${id}`,
        data
    );
}
export const deleteAdjustmentRequest = async (id: number) => {
    return api.delete<AttendanceAdjustmentRequest>(
        `${baseVersion1}/attendance-request/${id}`
    );
}

// Location Tracking APIs
export const sendLocationPing = async (payload: LocationPingPayload) => {
  const response = await api.post(`${baseVersion1}/attendances/location-ping`, payload);
  return response.data;
};

export const getLiveLocations = async (): Promise<StaffLiveLocation[]> => {
  const response = await api.get<StaffLiveLocation[]>(`${baseVersion1}/attendances/live-locations`);
  return response.data;
};

export const getStaffRoute = async (userId: string, date?: string): Promise<StaffRouteResponse> => {
  const response = await api.get<StaffRouteResponse>(`${baseVersion1}/attendances/routes/${userId}`, {
    params: date ? { date } : {},
  });
  return response.data;
};
