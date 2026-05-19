import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '@/utils/api';
import toast from 'react-hot-toast';

interface Preset {
  token: string;
  name: string;
}

interface PtzState {
  isMoving: boolean;
  newPresetName: string;
  presets: Preset[];
  isLoadingPresets: boolean;
  
  speed: number;
  duration: number;
  setSpeed: (speed: number) => void;
  setDuration: (duration: number) => void;

  setNewPresetName: (name: string) => void;
  fetchPresets: (cameraId: string, hasPtz: boolean) => Promise<void>;
  movePtz: (cameraId: string, command: string) => Promise<void>;
  createPreset: (cameraId: string, name: string) => Promise<void>;
  gotoPreset: (cameraId: string, token: string) => Promise<void>;
  deletePreset: (cameraId: string, token: string) => Promise<void>;
  gotoHome: (cameraId: string) => Promise<void>;
  setHome: (cameraId: string) => Promise<void>;
}

export const usePtzStore = create<PtzState>()(
  persist(
    (set, get) => ({
      isMoving: false,
      newPresetName: '',
      presets: [],
      isLoadingPresets: false,

      speed: 0.05,
      duration: 0.1,

      setSpeed: (speed) => set({ speed }),
      setDuration: (duration) => set({ duration }),

      setNewPresetName: (name) => set({ newPresetName: name }),

      fetchPresets: async (cameraId, hasPtz) => {
        if (!hasPtz) {
          set({ presets: [] });
          return;
        }
        set({ isLoadingPresets: true });
        try {
          const res = await api.get(`/api/v1/cameras/${cameraId}/ptz/presets`);
          set({ presets: res.data?.data || [] });
        } catch (error) {
          console.error('Error fetching presets:', error);
        } finally {
          set({ isLoadingPresets: false });
        }
      },

      movePtz: async (cameraId, command) => {
        try {
          set({ isMoving: true });
          const speed = get().speed;
          const duration = get().duration;
          await api.post(`/api/v1/cameras/${cameraId}/ptz/move`, { 
            command,
            speed,
            duration
          });
        } catch (error: any) {
          toast.error(error.response?.data?.detail || 'Có lỗi xảy ra khi gọi lệnh PTZ');
        } finally {
          set({ isMoving: false });
        }
      },

      createPreset: async (cameraId, name) => {
        try {
          await api.post(`/api/v1/cameras/${cameraId}/ptz/presets`, { name });
          set({ newPresetName: '' });
          toast.success('Đã lưu preset thành công');
          await get().fetchPresets(cameraId, true);
        } catch (error: any) {
          toast.error(error.response?.data?.detail || 'Lỗi khi lưu preset');
        }
      },

      gotoPreset: async (cameraId, token) => {
        try {
          toast.success('Đang di chuyển tới preset');
          await api.post(`/api/v1/cameras/${cameraId}/ptz/presets/${token}/goto`);
        } catch (error: any) {
          toast.error(error.response?.data?.detail || 'Lỗi khi gọi preset');
        }
      },

      deletePreset: async (cameraId, token) => {
        try {
          await api.delete(`/api/v1/cameras/${cameraId}/ptz/presets/${token}`);
          toast.success('Đã xóa preset');
          await get().fetchPresets(cameraId, true);
        } catch (error: any) {
          toast.error(error.response?.data?.detail || 'Lỗi khi xóa preset');
        }
      },

      gotoHome: async (cameraId) => {
        try {
          toast.success('Đang di chuyển về Home');
          await api.post(`/api/v1/cameras/${cameraId}/ptz/home`);
        } catch (error: any) {
          toast.error(error.response?.data?.detail || 'Lỗi khi di chuyển về Home');
        }
      },

      setHome: async (cameraId) => {
        try {
          await api.post(`/api/v1/cameras/${cameraId}/ptz/home/set`);
          toast.success('Đã đặt Home thành công');
        } catch (error: any) {
          toast.error(error.response?.data?.detail || 'Lỗi khi đặt Home');
        }
      }
    }),
    {
      name: 'cv_ptz_settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        speed: state.speed,
        duration: state.duration
      })
    }
  )
);
