import api from "@/utils/api";
import {
    Attendance,
    AttendanceCreate,
    DataListResponse,
    AttendanceQueryParams,
    AttendanceAdjustmentRequest,
    AutoTimekeepingData,
    AttendanceAdjustmentRequestCreate,
    AdjustmentRequestQueryParams,
    AttendanceAdjustmentRequestUpdate,
    LocationPingPayload,
    StaffLiveLocation,
    StaffRouteResponse,
    DepartmentRosterQueryParams,
    DepartmentRosterResponse,
    MonthRosterQueryParams,
    MonthRosterResponse,
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

export const autoTimekeeping = async (data: AutoTimekeepingData, image: File): Promise<Attendance> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('image', image);

    const response = await api.post<Attendance>(
        `${baseVersion1}/users/attendance`,
        formData
    );

    return response.data;
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

export const getStaffRoute = async (userId: string, date?: string, attendanceId?: number): Promise<StaffRouteResponse> => {
  const params: Record<string, string | number> = {};
  if (date) params.date = date;
  if (attendanceId) params.attendanceId = attendanceId;

  const response = await api.get<StaffRouteResponse>(`${baseVersion1}/attendances/routes/${userId}`, {
    params,
  });
  return response.data;
};

export const getDepartmentRoster = async (
  params: DepartmentRosterQueryParams = {}
): Promise<DepartmentRosterResponse> => {
  const response = await api.get<DepartmentRosterResponse>(
    `${baseVersion1}/attendances/department-roster`,
    { params }
  );
  return response.data;
};

export const getMonthRoster = async (
  params: MonthRosterQueryParams = {}
): Promise<MonthRosterResponse> => {
  const response = await api.get<MonthRosterResponse>(
    `${baseVersion1}/attendances/department-roster/month`,
    { params }
  );
  return response.data;
};
