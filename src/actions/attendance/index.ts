import api from "@/utils/api";
import {
    Attendance,
    AttendanceCreate,
    DataListResponse,
    AttendanceQueryParams,
    AttendanceAdjustmentRequest,
    AutoTimekeepingData,
    UserResponse,
    UserCreate, AttendanceAdjustmentRequestCreate,
    AdjustmentRequestQueryParams,
    AttendanceAdjustmentRequestUpdate,
    Department,
    DepartmentQueryParams
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
    formData.append(
        "data",
        JSON.stringify(data)
    );
    formData.append(
        "image",
        image
    );
    return api.post<Attendance>(
        `${baseVersion1}/attendances/auto-timekeeping`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
}

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

export const getUsers = async (params?: any) => {
    const res = await api.get<DataListResponse<UserResponse>>(
        `${baseVersion1}/users`,
        {
            params,
        }
    );

    return res.data;
};

export const createUser = async (
    data: UserCreate
) => {
    const res = await api.post<UserResponse>(
        `${baseVersion1}/users`,
        data
    );

    return res.data;
};

export const getDepartments = async (params?: DepartmentQueryParams) => {
    const res = await api.get<DataListResponse<Department>>(
        `${baseVersion1}/departments`,
        { params }
    );
    return res.data;
}
