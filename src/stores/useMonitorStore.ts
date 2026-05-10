import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GridCell, Monitor } from '@/types/shared/monitor';
import queryClient from '@/utils/query';
import api from '@/utils/api';

interface MonitorState {
  // Data States
  monitor: Monitor | null;
  gridKey: string | null;

  // Modal States
  isAdding: boolean;
  isRemoving: boolean;
  isLoading: boolean;

  // UI Sidebar States
  isShowSetting: boolean;
  isShowList: boolean;

  hasHydrated: boolean;

  // Actions
  setMonitor: (monitor: Monitor | null) => void;
  setGridKey: (gridKey: string | null) => void;

  setIsAdding: (isAdding: boolean) => void;
  setIsRemoving: (isRemoving: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  setIsShowSetting: (isShow: boolean) => void;
  setIsShowList: (isShow: boolean) => void;

  setHasHydrated: (hasHydrated: boolean) => void;

  createNewMonitor: (gridSize: number, userId: string) => Promise<void>;

  updateMonitorGrid: (monitor: Monitor, gridKey: string, gridValue: GridCell) => Promise<void>;
}

const useMonitorStore = create<MonitorState>()(
  persist(
    (set) => ({
      monitor: null,
      gridKey: null,

      isAdding: false,
      isRemoving: false,
      isLoading: false,

      isShowSetting: false,
      isShowList: true,

      hasHydrated: false,

      setMonitor: (monitor) => set({ monitor }),
      setGridKey: (gridKey) => set({ gridKey }),

      setIsAdding: (isAdding) => set({ isAdding }),
      setIsRemoving: (isRemoving) => set({ isRemoving }),
      setIsLoading: (isLoading) => set({ isLoading }),

      setIsShowSetting: (isShowSetting) => set({ isShowSetting }),
      setIsShowList: (isShowList) => set({ isShowList }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      createNewMonitor: async (gridSize: number, userId: string) => {
        try {
          set({ isLoading: true });

          const grid: Record<string, GridCell> = {};

          for (let i = 1; i <= gridSize; i++) {
            grid[i.toString()] = {
              cameraId: null,
              workerIp: null,
              workerPort: null,
            };
          }

          const res = await api.post('/api/v1/monitors', {
            name: 'Monitor Example',
            userId: userId,
            grid,
          });

          set({ monitor: res.data });
        } catch (error) {
          console.error(error);
        } finally {
          set({ isLoading: false });
          queryClient.invalidateQueries({ queryKey: ['monitors'] });
        }
      },
      updateMonitorGrid: async (monitor: Monitor, gridKey: string, gridValue: GridCell) => {
        try {
          const res = await api.patch(`/api/v1/monitors/${monitor.id}`, {
            grid: {
              ...monitor.grid,
              [gridKey]: gridValue,
            },
          });

          set({ monitor: res.data });
        } catch (error) {
          console.error(error);
        } finally {
          set({ isAdding: false });
          queryClient.invalidateQueries({ queryKey: ['monitors'] });
        }
      },
    }),
    {
      name: 'cv_monitor',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        monitor: state.monitor,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useMonitorStore;
