import { useMemo } from 'react';
import { useMeStore } from '@/stores';
import type { MePermission } from '@/types';

// Hàm thuần: cùng một logic cho người đang đăng nhập (useCan) và cho trang xem thử theo role
export function createCan(permissions: MePermission[], isPlatformAdmin = false) {
  const can = (code: string) => permissions.some((p) => p.code === code);
  const canAny = (codes: string[]) => codes.some(can);
  const scopeOf = (code: string) => permissions.find((p) => p.code === code)?.scope ?? null;
  // Cấu hình menu/route cần đúng hai thứ này
  const access = { canAny, isPlatformAdmin, scopeOf };
  return { can, canAny, scopeOf, access };
}

const NO_PERMISSIONS: MePermission[] = [];

// can('quotation:approve'): true khi /me trả quyền đó. Chưa tải xong thì false (an toàn: ẩn trước, hiện sau)
export function useCan() {
  const me = useMeStore((s) => s.me);
  const status = useMeStore((s) => s.status);

  const api = useMemo(() => createCan(me?.permissions ?? NO_PERMISSIONS, !!me?.isPlatformAdmin), [me?.permissions, me?.isPlatformAdmin]);

  return {
    ...api,
    isReady: status === 'ready',
    isLoading: status === 'loading',
    // chưa có dữ liệu quyền và chưa lỗi: trang chưa nên tải dữ liệu
    isPending: !me && status !== 'error',
    isError: status === 'error',
    me,
  };
}
