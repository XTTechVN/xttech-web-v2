import { create } from 'zustand';
import { getMe } from '@/actions';
import type { Me, MeRole } from '@/types';

type MeStatus = 'idle' | 'loading' | 'ready' | 'error';

// Chỉ dùng ở môi trường dev: ghi đè quyền của người đang đăng nhập để xem giao diện theo vai trò khác (xem components/dev)
export interface MeOverride {
  key: string;
  permissions: Me['permissions'];
  roles: MeRole[];
}

interface MeState {
  me: Me | null;
  realMe: Me | null;
  override: MeOverride | null;
  status: MeStatus;
  load: () => Promise<void>;
  setOverride: (override: MeOverride | null) => void;
  clear: () => void;
}

const applyOverride = (me: Me, o: MeOverride | null): Me =>
  o ? { ...me, permissions: o.permissions, roles: o.roles, isPlatformAdmin: false } : me;

// Không lưu xuống storage: quyền luôn lấy mới từ backend mỗi trang (README 2.9)
export const useMeStore = create<MeState>((set, get) => ({
  me: null,
  realMe: null,
  override: null,
  status: 'idle',
  load: async () => {
    // giữ dữ liệu cũ trong lúc tải lại để menu không nháy
    set({ status: get().me ? 'ready' : 'loading' });
    try {
      const realMe = await getMe();
      set({ realMe, me: applyOverride(realMe, get().override), status: 'ready' });
    } catch {
      set({ status: get().me ? 'ready' : 'error' });
    }
  },
  setOverride: (override) => set((s) => ({ override, me: s.realMe ? applyOverride(s.realMe, override) : s.me })),
  clear: () => set({ me: null, realMe: null, override: null, status: 'idle' }),
}));
