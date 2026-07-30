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
  attendancePolicy: 'administrative' | string;
  createdAt: string;
  updatedAt: string;
}
