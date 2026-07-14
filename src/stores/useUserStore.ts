import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@/types/shared/user';

interface UserState {
  user: User | null;
  hasHydrated: boolean;

  setUser: (user: User) => void;
  setHasHydrated: (hasHydrated: boolean) => void;

  clearUser: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set: any) => ({
      user: null,
      hasHydrated: false,

      setUser: (user: User) => set({ user }),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),

      clearUser: () => {
        set({ user: null });
        set({ hasHydrated: false });
      },
    }),
    {
      name: 'cv_user',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state: UserState) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useUserStore;
