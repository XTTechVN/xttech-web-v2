// Thư viện quản lý trạng thái client-side
import { create } from 'zustand';

// Middleware lưu trữ trạng thái của Zustand vào LocalStorage
import { persist } from 'zustand/middleware';

// Hàm xử lý đăng nhập và đăng xuất
import { signIn, signOut } from '@/actions';

// Kiểu dữ liệu dùng chung cho thông tin tài khoản và kết quả đăng nhập
import { AuthUser } from '@/types';

// Kiểu dữ liệu cho trạng thái đăng nhập
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
  isLoading: boolean;
  signin: (username: string, password: string) => Promise<boolean>;
  signout: () => Promise<void>;
  setAccessToken: (accessToken: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: AuthUser | null) => void;
  updateUser: (userData: Partial<AuthUser>) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: '',
      refreshToken: '',
      user: null,
      isLoading: false,
      signin: async (username: string, password: string) => {
        try {
          set({ isLoading: true });
          const res = await signIn({ username, password });
          const { accessToken, refreshToken, user } = res;
          
          if (user && user.roles) {
            document.cookie = `xt-auth=${encodeURIComponent(JSON.stringify({ roles: user.roles }))}; path=/; max-age=604800; SameSite=Lax`;
          }

          set({ accessToken, refreshToken, user, isAuthenticated: true });

          return true;
        } catch (error) {
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signout: async () => {
        const currentRefreshToken = get().refreshToken;
        if (currentRefreshToken) {
          await signOut(currentRefreshToken);
        }
        set({
          isAuthenticated: false,
          accessToken: '',
          refreshToken: '',
          user: null,
        });
        if (typeof document !== 'undefined') {
          document.cookie = 'xt-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('xt-auth');
          window.location.replace('/signin');
        }
      },

      setAccessToken: (accessToken: string) => set({ accessToken }),

      setTokens: (accessToken: string, refreshToken?: string) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
        })),

      setUser: (user: AuthUser | null) => {
        if (user && user.roles && typeof document !== 'undefined') {
          document.cookie = `xt-auth=${encodeURIComponent(JSON.stringify({ roles: user.roles }))}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({ user });
      },

      updateUser: (userData: Partial<AuthUser>) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...userData };
          if (updatedUser.roles && typeof document !== 'undefined') {
            document.cookie = `xt-auth=${encodeURIComponent(JSON.stringify({ roles: updatedUser.roles }))}; path=/; max-age=604800; SameSite=Lax`;
          }
          return { user: updatedUser };
        });
      },
    }),
    {
      name: 'xt-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user && state.user.roles && typeof document !== 'undefined') {
          document.cookie = `xt-auth=${encodeURIComponent(JSON.stringify({ roles: state.user.roles }))}; path=/; max-age=604800; SameSite=Lax`;
        }
      },
    },
  ),
);

export default useAuthStore;
