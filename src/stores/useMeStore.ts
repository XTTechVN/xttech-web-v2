import { create } from 'zustand';
import { getMe } from '@/actions';
import type { Me } from '@/types';

type MeStatus = 'idle' | 'loading' | 'ready' | 'error';

interface MeState {
  me: Me | null;
  status: MeStatus;
  load: () => Promise<void>;
  clear: () => void;
}

// Không lưu xuống storage: quyền luôn lấy mới từ backend mỗi trang (README 2.9)
export const useMeStore = create<MeState>((set, get) => ({
  me: null,
  status: 'idle',
  load: async () => {
    // giữ dữ liệu cũ trong lúc tải lại để menu không nháy
    set({ status: get().me ? 'ready' : 'loading' });
    try {
      set({ me: await getMe(), status: 'ready' });
    } catch {
      set({ status: get().me ? 'ready' : 'error' });
    }
  },
  clear: () => set({ me: null, status: 'idle' }),
}));
