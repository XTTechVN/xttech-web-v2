'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XTLogo } from '@/components/logo';
import type { SidebarSectionProps } from '@/components';
import { APP_NAME } from '@/config';
import { cn } from '@/utils/cn';
import { isActive } from './nav-model';

const ROW = 'flex min-h-10 items-center gap-3 rounded-rm px-3 text-[13px] transition-colors duration-(--rm-dur-fast) active:bg-rm-primary-soft';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Từ 768px: sidebar cố định bên trái. Logo và tên thương hiệu ở đầu.
interface SidebarProps {
  sections: SidebarSectionProps[];
  orgName?: string;
  userName: string;
  roleName?: string;
}

export function Sidebar({ sections, orgName, userName: name, roleName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-rm-sidebar flex-col border-r border-rm-line bg-rm-surface md:flex">
      <Link href="/remake" className="flex h-16 flex-none items-center gap-3 border-b border-rm-line px-4">
        <XTLogo className="size-8 flex-none" />
        <span className="min-w-0">
          <span className="block truncate font-heading text-base font-semibold leading-5 text-rm-primary">{APP_NAME.toUpperCase()}</span>
          <span className="block truncate text-xs leading-4 text-rm-muted">{orgName ?? ' '}</span>
        </span>
      </Link>

      <nav aria-label="Điều hướng chính" className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            {section.title && <h3 className="mb-2 truncate px-3 text-xs font-medium text-rm-muted">{section.title}</h3>}
            <ul className="flex flex-col">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href ?? '#'}
                      aria-current={active ? 'page' : undefined}
                      className={cn(ROW, active ? 'bg-rm-primary-soft font-medium text-rm-primary' : 'text-rm-text hover:bg-rm-bg')}
                    >
                      <span className="flex-none">{item.icon}</span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </Link>
                    {active && item.subItems && item.subItems.length > 0 && (
                      <ul className="ml-6 mt-0.5 flex flex-col gap-0.5 border-l border-rm-line pl-2">
                        {item.subItems.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={sub.href ?? '#'}
                              aria-current={pathname === sub.href ? 'page' : undefined}
                              className={cn(ROW, 'text-xs', pathname === sub.href ? 'font-medium text-rm-primary' : 'text-rm-muted hover:bg-rm-bg')}
                            >
                              <span className="min-w-0 truncate">{sub.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Link
        href="/remake/me"
        aria-current={pathname === '/remake/me' ? 'page' : undefined}
        className="flex flex-none items-center gap-3 border-t border-rm-line px-4 py-3 transition-colors duration-(--rm-dur-fast) active:bg-rm-primary-soft md:hover:bg-rm-bg"
      >
        <span className="flex size-9 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-xs font-semibold text-rm-primary">
          {initials(name) || '–'}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-rm-text">{name || ' '}</span>
          <span className="block truncate text-xs text-rm-muted">{roleName ?? ' '}</span>
        </span>
      </Link>
    </aside>
  );
}
