import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewMode } from '@/types/shared/view';

interface LiveState {
  viewMode: ViewMode;
  portView: number | null;
  setViewMode: (viewMode: ViewMode) => void;
  setPortView: (portView: number | null) => void;
}

export const useLiveStore = create<LiveState>()(
  persist(
    (set: any) => ({
      viewMode: '2x2',
      portView: null,
      setViewMode: (viewMode: ViewMode) => set({ viewMode }),
      setPortView: (portView: number | null) => set({ portView }),
    }),
    {
      name: 'cv-live',
    },
  ),
);
