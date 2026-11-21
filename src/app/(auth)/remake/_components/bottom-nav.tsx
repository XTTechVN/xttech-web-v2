'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, ClipboardList, House, User } from 'lucide-react';
import { useCan } from '@/hooks';
import { cn } from '@/utils/cn';
import { isActive } from './nav-model';

const TAB =
  'relative flex min-h-rm-tap min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] transition-[color,transform] duration-(--rm-dur-fast) active:scale-95';
const ICON = { size: 20 };

// Điện thoại: luôn 4 mục cố định. Chức năng khác nằm trong "Tôi". Ẩn từ 768px (đã có sidebar).
export function BottomNav() {
  const pathname = usePathname();
  const { scopeOf } = useCan();
  // Quản lý (dept/org) vào bảng chấm công của nhóm; còn lại vào lịch sử chấm công của mình
  const attendanceHref = ['dept', 'org'].includes(scopeOf('attendance:read') ?? '') ? '/remake/attendances' : '/remake/attendance-history';
  const items = [
    { id: 'home', label: 'Trang chủ', href: '/remake/dashboard', match: ['/remake/dashboard'], icon: <House {...ICON} /> },
    {
      id: 'attendance',
      label: 'Chấm công',
      href: attendanceHref,
      match: ['/remake/attendances', '/remake/attendance-history'],
      icon: <CalendarCheck {...ICON} />,
    },
    { id: 'work', label: 'Công việc', href: '/remake/tasks', match: ['/remake/tasks'], icon: <ClipboardList {...ICON} /> },
    { id: 'me', label: 'Tôi', href: '/remake/me', match: ['/remake/me'], icon: <User {...ICON} /> },
  ];

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rm-line bg-rm-surface pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden"
    >
      <ul className="flex h-rm-nav items-stretch">
        {items.map((item) => {
          const active = item.match.some((m) => isActive(pathname, m));
          return (
            <li key={item.id} className="flex min-w-0 flex-1">
              <Link href={item.href} aria-current={active ? 'page' : undefined} className={cn(TAB, active ? 'text-rm-primary' : 'text-rm-muted')}>
                {item.icon}
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
