import { Role } from './auth';

// Kiểu dữ liệu thông tin người dùng
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  avatar: string | null;
  gender: 'male' | 'female' | 'other' | string;
  birthday: string;
  address: string;
  joinedAt: string;
  identifyCode: string;
  attendancePolicy: string;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  positions: string[];
}
