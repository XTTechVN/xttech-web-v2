'use server';

import { SignInCredentials } from '@/types';

import api from '@/utils/api';

// Hàm xử lý đăng nhập
export const getSignIn = async ({ username, password }: SignInCredentials) => {
  try {
    const res = await api.post(`/auth/signin`, { username, password });
    return res.data;
  } catch (error) {
    throw new Error('Lỗi hệ thống');
  }
};