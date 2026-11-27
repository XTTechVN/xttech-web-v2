'use client';

import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components';
import { usePageTransition } from '@/contexts';
import { useAuthStore } from '@/stores';
import { cn } from '@/utils/cn';
import { getFileUrl } from '@/utils';

const PROFILE_PATH = '/app/profile';

// Chân sidebar: ảnh, tên, vai trò của người dùng; bấm vào mở trang thông tin cá nhân
export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuthStore();
  const path = usePathname();
  const { navigateTo } = usePageTransition();

  const displayName = user?.fullName || user?.username || 'Thành viên';
  const roleName = user?.roles?.[0]?.name || 'Thành viên';
  const avatarUrl = user?.avatar ? `${getFileUrl(user.avatar)}${user.updatedAt ? `?v=${encodeURIComponent(user.updatedAt)}` : ''}` : undefined;
  const active = path === PROFILE_PATH;

  return (
    <button
      type="button"
      onClick={() => {
        navigateTo(PROFILE_PATH);
        onNavigate?.();
      }}
      aria-label="Mở thông tin cá nhân"
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-11 w-full min-w-0 cursor-pointer items-center gap-3 rounded-control p-2 text-left transition-colors active:bg-slate-100 md:hover:bg-slate-50',
        active && 'bg-slate-100',
      )}
    >
      <Avatar src={avatarUrl} name={displayName} size="md" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-slate-900">{displayName}</span>
        <span className="truncate text-xs text-slate-500">{roleName}</span>
      </span>
      <ChevronRight size={16} className="flex-none text-slate-400" aria-hidden="true" />
    </button>
  );
}
