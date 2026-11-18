'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, KeyRound, LogOut, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore, useMeStore } from '@/stores';

const NAV = [
  { href: '/platform', label: 'Doanh nghiệp', icon: Building2 },
  { href: '/platform/users', label: 'Người dùng', icon: Users },
  { href: '/platform/permissions', label: 'Danh mục quyền', icon: KeyRound },
] as const;

// Khu vực riêng của quản trị nền tảng. Người không phải quản trị nền tảng bị đưa về /app.
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const me = useMeStore((s) => s.me);
  const status = useMeStore((s) => s.status);
  const fullName = useAuthStore((s) => s.user?.fullName);

  useEffect(() => {
    useMeStore.getState().load();
  }, []);

  const denied = status === 'ready' && !me?.isPlatformAdmin;
  useEffect(() => {
    if (denied) router.replace('/app/dashboard');
  }, [denied, router]);

  const logout = async () => {
    await useAuthStore.getState().signout();
    useMeStore.getState().clear();
    window.location.replace('/signin');
  };

  if (status !== 'ready' || denied) {
    return (
      <div className="flex h-dvh items-center justify-center bg-gray-50" aria-busy="true">
        {status === 'error' ? (
          <p className="text-sm text-gray-500">Không tải được dữ liệu. Tải lại trang để thử lại.</p>
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4">
        <ShieldCheck size={20} className="flex-none text-primary" aria-hidden="true" />
        <span className="font-lexend text-base font-semibold text-gray-900">XTTech</span>
        <span className="flex-none text-sm text-gray-500">Quản trị</span>
        <span className="min-w-0 flex-1 truncate text-right text-sm text-gray-500 max-sm:invisible">{fullName || me?.user.username}</span>
        <button
          type="button"
          onClick={logout}
          aria-label="Đăng xuất"
          className="inline-flex h-11 flex-none items-center gap-1.5 rounded-md px-3 text-sm font-medium text-gray-700 active:scale-95 active:bg-gray-100"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </header>
      <div className="flex w-full">
        <nav
          aria-label="Điều hướng"
          className="fixed inset-x-0 bottom-0 z-20 flex border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:sticky md:top-14 md:h-[calc(100dvh-3.5rem)] md:w-56 md:flex-none md:flex-col md:gap-1 md:self-start md:border-r md:border-t-0 md:p-3"
        >
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/platform' ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-2 text-xs font-medium active:bg-gray-50 md:min-h-11 md:flex-none md:flex-row md:justify-start md:gap-2 md:rounded-md md:px-3 md:text-sm',
                  active ? 'text-primary md:bg-gray-100' : 'text-gray-600',
                )}
              >
                <Icon size={20} className="flex-none" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
        <main className="mx-auto min-w-0 w-full max-w-6xl flex-1 pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
