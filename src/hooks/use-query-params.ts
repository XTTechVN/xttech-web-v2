/**
 * Hook cho phép cập nhật đồng thời nhiều query param cùng 1 lúc (Atomic update)
 * Tránh race condition khi set nhiều param liên tiếp (vd: fromDate và toDate)
 */

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setQueryParams = (updates: Record<string, string | undefined | null>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    let hasChanged = false;

    Object.entries(updates).forEach(([key, val]) => {
      const normalizedNew = val ? val.trim() : undefined;
      const normalizedCurrent = searchParams.get(key)
        ? searchParams.get(key)!.replace(/\+/g, ' ')
        : undefined;

      if (normalizedNew !== normalizedCurrent) {
        hasChanged = true;
        if (!normalizedNew) {
          params.delete(key);
        } else {
          params.set(key, normalizedNew);
        }
      }
    });

    if (!hasChanged) return;

    // Reset offset về 0 nếu trong updates không chỉ định offset
    if (!('offset' in updates)) {
      params.set('offset', '0');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return { setQueryParams };
}
