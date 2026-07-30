// Bộ tiện ích gọi API cấu hình sẵn Axios
import api from '@/utils/api';

// Thư viện quản lý trạng thái client-side
import { create } from 'zustand';

// Middleware lưu trữ trạng thái của Zustand vào LocalStorage
import { persist, createJSONStorage } from 'zustand/middleware';

// Kiểu dữ liệu phản hồi của Axios
import { AxiosResponse } from 'axios';

// Kiểu dữ liệu dùng chung cho thông tin tài khoản và kết quả đăng nhập
import { SignInResponse, AuthUser } from '@/types';

// Kiểu dữ liệu cho trạng thái đăng nhập
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  signin: (username: string, password: string) => Promise<boolean>;
  setAccessToken: (accessToken: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set: any) => ({
      isAuthenticated: false as boolean,
      accessToken: null as string | null,
      refreshToken: null as string | null,
      user: null as AuthUser | null,

      signin: async (username: string, password: string) => {
        try {
          const response: AxiosResponse<SignInResponse> = await api.post('/api/v1/auth/signin', {
            username,
            password,
          });

          const { accessToken, refreshToken, user } = response.data;

          set({ accessToken, refreshToken, user, isAuthenticated: true });

          return true;
        } catch (error) {
          return false;
        }
      },

      setAccessToken: (accessToken: string) => set({ accessToken }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useAuthStore;
