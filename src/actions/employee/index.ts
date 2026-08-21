import type { Employee, GetEmployeesResponse } from '@/types';
import api from '@/utils/api';

// Lấy danh sách nhân viên
export const getEmployees = async (params?: {
  offset?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  department_id?: number;
  positionId?: number;
  position_id?: number;
  [key: string]: any;
}): Promise<GetEmployeesResponse> => {
  try {
    const formattedParams: Record<string, any> = { ...params };
    if (params?.departmentId !== undefined) {
      formattedParams.department_id = params.departmentId;
    }
    if (params?.positionId !== undefined) {
      formattedParams.position_id = params.positionId;
    }
    const res = await api.get<GetEmployeesResponse>(`/api/v1/users`, { params: formattedParams });
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi lấy dữ liệu danh sách nhân viên');
  }
};

// Tạo mới nhân viên
export const createEmployee = async (
  employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'roles' | 'positions'> & { password?: string },
  file?: File,
) => {
  try {
    const formData = new FormData();
    const create_data = JSON.stringify(employee);
    formData.append('create_data', create_data);
    if (file) {
      formData.append('file', file);
    }
    const res = await api.post(`/api/v1/users`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw new Error('Lỗi hệ thống');
  }
};

// Xóa nhân viên
export const deleteEmployee = async (id: string | number) => {
  try {
    const res = await api.delete(`/api/v1/users/${id}`);
    return res.data;
  } catch (error) {
    throw new Error('Lỗi hệ thống');
  }
};

// Cập nhật thông tin nhân viên
export const updateEmployee = async (id: string | number, data: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>, file?: File) => {
  try {
    const formData = new FormData();
    const update_data = JSON.stringify(data);
    formData.append('update_data', update_data);
    if (file) {
      formData.append('file', file);
    }
    const res = await api.put(`/api/v1/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw new Error('Lỗi khi cập nhật thông tin nhân viên');
  }
};

// Kiểm tra sự tồn tại của người dùng qua email hoặc CCCD
export const checkUserExists = async (params: {
  email?: string;
  identifyCode?: string;
  uniqueQuery?: string;
}): Promise<Employee | null> => {
  try {
    const res = await api.get<Employee | null>(`/api/v1/users/exists`, {
      params: {
        email: params.email,
        identify_code: params.identifyCode,
        uniqueQuery: params.uniqueQuery,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi kiểm tra tồn tại người dùng:', error);
    return null;
  }
};
