import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GridCell, Monitor } from '@/types/shared/monitor';
import queryClient from '@/utils/query';
import api from '@/utils/api';
import toast from 'react-hot-toast';

interface MonitorState {
  // Data States
  monitor: Monitor | null; // Lưu trữ monitor được chọn hiện tại
  gridKey: string | null; // Lưu trữ key của grid được chọn hiện tại (cho phép lấy thông tin chi tiết của grid)

  // Modal States
  isAdding: boolean; // Lưu trữ trạng thái của modal thêm camera vào grid
  isRemoving: boolean; // Lưu trữ trạng thái của modal xóa camera khỏi grid
  isUpdating: boolean; // Lưu trữ trạng thái của modal update tên monitor
  isLoading: boolean; // Lưu trữ trạng thái loading của monitor

  // UI Sidebar States
  isShowSetting: boolean; // Lưu trữ trạng thái của sidebar setting
  isShowList: boolean; // Lưu trữ trạng thái của sidebar list

  hasHydrated: boolean; // Lưu trữ trạng thái đã hydrate của monitor

  // Actions
  setMonitor: (monitor: Monitor | null) => void; // Hàm set monitor
  setGridKey: (gridKey: string | null) => void; // Hàm set gridKey

  setIsAdding: (isAdding: boolean) => void; // Hàm set isAdding
  setIsRemoving: (isRemoving: boolean) => void; // Hàm set isRemoving
  setIsLoading: (isLoading: boolean) => void; // Hàm set isLoading

  setIsShowSetting: (isShow: boolean) => void; // Hàm set isShowSetting
  setIsShowList: (isShow: boolean) => void; // Hàm set isShowList

  setHasHydrated: (hasHydrated: boolean) => void; // Hàm set hasHydrated

  // Monitor actions
  getMonitorGridSize: () => number; // Hàm get kích thước monitor grid
  createNewMonitor: (gridSize: number, userId: string) => Promise<void>; // Hàm tạo một monitor mới với kích thước gridSize
  updateMonitor: (monitor: Monitor) => Promise<void>; // Hàm update một monitor

  // Grid actions
  updateMonitorGrid: (monitor: Monitor, gridKey: string, gridValue: GridCell) => Promise<void>; // Hàm set một ô trong monitor grid thành một ô chứa thông tin camera (live stream)
  removeMonitorGrid: (monitor: Monitor, gridKey: string) => Promise<void>; // Hàm set một ô trống trong monitor grid thành ô trống
  increaseMonitorGridSize: (monitor: Monitor) => Promise<void>; // Hàm này cho phép tăng kích thước monitor grid (+1)
  decreaseMonitorGridSize: (monitor: Monitor) => Promise<void>; // Hàm này cho phép giảm kích thước monitor grid (-1)
}

const useMonitorStore = create<MonitorState>()(
  persist(
    (set, get) => ({
      monitor: null,
      gridKey: null,

      isAdding: false,
      isRemoving: false,
      isUpdating: false,
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

      getMonitorGridSize: () => {
        const monitor = get().monitor;

        if (!monitor) return 0;

        const values = Object.values(monitor.grid);

        return values.length;
      },
      createNewMonitor: async (gridSize: number, userId: string) => {
        // Hàm tạo một monitor mới với kích thước gridSize
        // Tất cả các ô trong grid đều trống (null)
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
      updateMonitor: async (monitor: Monitor) => {
        // Hàm update một monitor
        try {
          set({ isUpdating: true });

          const res = await api.patch(`/api/v1/monitors/${monitor.id}`, monitor);

          set({ monitor: res.data });
          toast.success('Cập nhật tên monitor thành công');
        } catch (error) {
          toast.error('Cập nhật tên monitor thất bại');
        } finally {
          set({ isUpdating: false });
          queryClient.invalidateQueries({ queryKey: ['monitors'] });
        }
      },

      updateMonitorGrid: async (monitor: Monitor, gridKey: string, gridValue: GridCell) => {
        // Hàm set một ô trong monitor grid thành một ô chứa thông tin camera (live stream)
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
      removeMonitorGrid: async (monitor: Monitor, gridKey: string) => {
        // Hàm set một ô trống trong monitor grid thành ô trống
        try {
          const res = await api.patch(`/api/v1/monitors/${monitor.id}`, {
            grid: {
              ...monitor.grid,
              [gridKey]: {
                cameraId: null,
                workerIp: null,
                workerPort: null,
              },
            },
          });

          set({ monitor: res.data });
        } catch (error) {
          console.error(error);
        } finally {
          set({ isRemoving: false });
          queryClient.invalidateQueries({ queryKey: ['monitors'] });
        }
      },
      increaseMonitorGridSize: async (monitor: Monitor) => {
        // Hàm này cho phép tăng kích thước monitor grid
        // Nó sẽ thêm một grid mới vào cuối
        try {
          const gridSize = Object.keys(monitor.grid).length;
          const newKey = (gridSize + 1).toString();

          const res = await api.patch(`/api/v1/monitors/${monitor.id}`, {
            grid: {
              ...monitor.grid,
              [newKey]: {
                cameraId: null,
                workerIp: null,
                workerPort: null,
              },
            },
          });

          set({ monitor: res.data });
          toast.success('Thêm thành công');
        } catch (error) {
          console.error(error);
          toast.error('Thêm thất bại');
        } finally {
          set({ isAdding: false });
          queryClient.invalidateQueries({ queryKey: ['monitors'] });
        }
      },
      decreaseMonitorGridSize: async (monitor: Monitor) => {
        // Hàm này cho phép giảm kích thước monitor grid
        // Nó sẽ xóa grid cuối cùng
        try {
          const gridSize = Object.keys(monitor.grid).length;

          if (gridSize <= 1) {
            toast.error('Không thể giảm kích thước monitor grid nhỏ hơn 1');
            return;
          }

          const res = await api.patch(`/api/v1/monitors/${monitor.id}`, {
            grid: {
              ...Object.fromEntries(Object.entries(monitor.grid).slice(0, gridSize - 1)),
            },
          });

          set({ monitor: res.data });
          toast.success('Xóa thành công');
        } catch (error) {
          console.error(error);
          toast.error('Xóa thất bại');
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
