// Kiểu dữ liệu đăng nhập
export interface SignInCredentials {
  username: string;
  password: string;
}

// Kiểu dữ liệu thông tin người dùng
export interface AuthUser {
  email: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  avatar: string;
  gender: string;
  birthday: string;
  address: string;
  joinedAt: string;
  identifyCode: string;
  attendancePolicy: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  positions: string[];
}

// Kiểu dữ liệu trả về sau khi đăng nhập
export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

