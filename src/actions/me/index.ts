import api from '@/utils/api';
import type { AuthUser, Me } from '@/types';

export const getMe = async (): Promise<Me> => {
  const response = await api.get('/api/v1/me');
  return response.data;
};

export interface MyProfileUpdate {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
}

// Hồ sơ chi tiết của chính mình (kèm vai trò, chức vụ, phòng ban)
export const getMyProfile = async (): Promise<AuthUser> => {
  const response = await api.get('/api/v1/me/profile');
  return response.data;
};

// Tự sửa hồ sơ, kèm ảnh đại diện (multipart). Chỉ gửi trường đã đổi.
export const updateMyProfile = async (data: MyProfileUpdate, avatar?: File | null): Promise<AuthUser> => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (avatar) formData.append('file', avatar);
  const response = await api.put('/api/v1/me/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};

export const changeMyPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.post('/api/v1/me/password', { currentPassword, newPassword });
};
