import api from "@/utils/api";
import { useAuthStore } from "@/stores";
import { BASE_API_URL } from "@/config";
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

// export const getUsers = async (params?: any) => {
//     const res = await api.get<DataListResponse<UserResponse>>(
//         `${baseVersion1}/users`,
//         {
//             params,
//         }
//     );

//     return res.data;
// };

// export const createUser = async (data: UserCreate, file?: File) => {
//     const formData = new FormData();
//     // BE yêu cầu data wrap trong field 'create_data' dạng FormData
//     formData.append('create_data', JSON.stringify(data));
//     // Thêm avatar file nếu có upload
//     if (file) {
//         formData.append('file', file);
//     }

//     const accessToken = useAuthStore.getState().accessToken;
//     const response = await fetch(`${BASE_API_URL}${baseVersion1}/users`, {
//         method: 'POST',
//         headers: {
//             ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
//         },
//         credentials: 'include',
//         body: formData,
//     });

//     if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw { response: { data: errorData, status: response.status } };
//     }

//     return response.json() as Promise<UserResponse>;
// };

// export const getDepartments = async (params?: any) => {
//     const res = await api.get<DataListResponse<Department>>(
//         `${baseVersion1}/departments`,
//         { params }
//     );
//     return res.data;
// }