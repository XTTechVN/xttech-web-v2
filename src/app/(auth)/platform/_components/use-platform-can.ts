import { useCan } from '@/hooks';

// Quản trị nền tảng không có danh sách quyền trong /me (permissions rỗng, isPlatformAdmin = true): được làm mọi thao tác trong khu này.
// Người không phải quản trị nền tảng đã bị layout đưa về /app, nên ở đây chỉ cần xét cờ này, còn lại dùng quyền thường.
export function usePlatformCan() {
  const { can, isReady, me } = useCan();
  const isPlatformAdmin = !!me?.isPlatformAdmin;
  return { can: (code: string) => isPlatformAdmin || can(code), isReady };
}
