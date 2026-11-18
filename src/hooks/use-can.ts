import { useCallback, useMemo } from 'react';
import { useMeStore } from '@/stores';

// can('quotation:approve'): true khi /me trả quyền đó. Chưa tải xong thì false (an toàn: ẩn trước, hiện sau)
export function useCan() {
  const me = useMeStore((s) => s.me);
  const status = useMeStore((s) => s.status);

  const can = useCallback((code: string) => !!me?.permissions.some((p) => p.code === code), [me]);
  const canAny = useCallback((codes: string[]) => codes.some(can), [can]);
  const scopeOf = useCallback((code: string) => me?.permissions.find((p) => p.code === code)?.scope ?? null, [me]);

  // Cấu hình menu/route cần đúng hai thứ này
  const access = useMemo(() => ({ canAny, isPlatformAdmin: !!me?.isPlatformAdmin }), [canAny, me?.isPlatformAdmin]);

  return { can, canAny, scopeOf, access, isReady: status === 'ready', isLoading: status === 'loading',
    // chưa có dữ liệu quyền và chưa lỗi: trang chưa nên tải dữ liệu
    isPending: !me && status !== 'error', isError: status === 'error', me };
}
