'use server';

import { SignInCredentials } from '@/types';

import api from '@/utils/api';

// Hàm xử lý đăng nhập
export const signIn = async ({ username, password }: SignInCredentials) => {
  try {
    const res = await api.post(`/api/v1/auth/signin`, { username, password });
    return res.data;
  } catch (error) {
    throw new Error('Lỗi hệ thống');
  }
};

export const forgetPassword = async (email: string) => {
  try {
    const res = await api.post(`/api/v1/auth/forget`, { email });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Không tồn tại người dùng');
    }
    throw new Error(error.response?.data?.message || 'Không tồn tại người dùng');
  }
};

export const resetPasswordWithOtp = async (data: { email: string; otp: string; newPassword: string }) => {
  try {
    const res = await api.post(`/api/v1/auth/reset`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
  }
};
