import type { Position } from './position';

export interface EmployeeRole {
  id: string;
  name: string;
  description?: string | null;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  gender?: string | null;
  birthday?: string | null;
  address?: string | null;
  joinedAt?: string | null;
  identifyCode?: string | null;
  attendancePolicy?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: EmployeeRole[];
  positions: Position[];
}

export interface EmployeePagination {
  next: boolean;
  total: number;
  offset: number;
  limit: number;
}

export interface GetEmployeesResponse {
  items: Employee[];
  meta: EmployeePagination;
}
