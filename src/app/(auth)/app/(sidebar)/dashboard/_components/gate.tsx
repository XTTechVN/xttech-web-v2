'use client';

import type { ReactNode } from 'react';
import { useCan } from '@/hooks';

// Chỉ dựng khối (và gọi API của khối) khi người dùng có MỘT trong các quyền
export const Gate = ({ any, children }: { any: string[]; children: ReactNode }) => {
  const { canAny } = useCan();
  return canAny(any) ? <>{children}</> : null;
};

export default Gate;
