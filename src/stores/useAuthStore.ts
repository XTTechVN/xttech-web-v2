import { create } from 'zustand';
import api from '@/utils/api';

import useUserStore from './useUserStore';

interface AuthState {
  isAuthenticated: boolean;
  hasHydrated: boolean;

  signin: () => void;
  signout: () => void;

  setAuthenticated: (isAuthenticated: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasHydrated: false,

  signin: () => {
    set({ isAuthenticated: true });
  },

  signout: () => {
    api.post('/api/v1/auth/signout').finally(() => {
      set({ isAuthenticated: false });
      useUserStore.getState().clearUser();
    });
  },

  setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
}));

export default useAuthStore;
