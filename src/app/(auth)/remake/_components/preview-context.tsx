'use client';

import { createContext, useContext, useEffect } from 'react';
import type { Access } from '@/config';

// Trang xem thử theo role đẩy quyền của role đang chọn lên khung, để sidebar/thanh tab dưới đổi theo
export interface Preview {
  access: Access;
  name: string;
  roleName: string;
}

interface PreviewCtx {
  setPreview: (p: Preview | null) => void;
}

export const PreviewContext = createContext<PreviewCtx>({ setPreview: () => {} });

export function usePublishPreview(preview: Preview) {
  const { setPreview } = useContext(PreviewContext);
  const { access, name, roleName } = preview;
  useEffect(() => {
    setPreview({ access, name, roleName });
    return () => setPreview(null);
  }, [setPreview, access, name, roleName]);
}
