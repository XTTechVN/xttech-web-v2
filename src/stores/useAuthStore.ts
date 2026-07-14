import api from '@/utils/api';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import useUserStore from './useUserStore';

import { AxiosResponse } from 'axios';
import { AuthResponse } from '@/types/shared';

interface AuthState {
  isAuthenticated: boolean;
  hasHydrated: boolean;

  accessToken: string | null;
  refreshToken: string | null;

  signin: (username: string, password: string) => Promise<boolean>;
  signout: () => void;

  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;

  setAuthenticated: (isAuthenticated: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set: any) => ({
      isAuthenticated: false,
      hasHydrated: false,

      accessToken: null,
      refreshToken: null,

      signin: async (username: string, password: string) => {
        try {
          const response: AxiosResponse<AuthResponse> = await api.post('/api/v1/auth/signin', {
            username,
            password,
          });

          const { accessToken, refreshToken, user } = response.data;

          set({ accessToken, refreshToken, isAuthenticated: true });
          useUserStore.getState().setUser(user);

          return true;
        } catch (error) {
          return false;
        }
      },

      signout: () => {
        api.post('/api/v1/auth/signout').finally(() => {
          set({ isAuthenticated: false });
          useUserStore.getState().clearUser();
        });
      },

      setAccessToken: (accessToken: string) => set({ accessToken }),
      setRefreshToken: (refreshToken: string) => set({ refreshToken }),

      setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: 'cv_auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useAuthStore;
