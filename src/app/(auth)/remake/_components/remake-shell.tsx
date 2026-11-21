'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { APP_NAME } from '@/config';
import type { SidebarSectionProps } from '@/components';
import { useCan } from '@/hooks';
import { useMeStore } from '@/stores';
import { BottomNav } from './bottom-nav';
import { isActive } from './nav-model';
import { getRemakeSections } from './remake-menu';
import { PreviewContext, type Preview } from './preview-context';
import { Sidebar } from './sidebar';

const FIXED_TITLES: Record<string, string> = { '/remake/dashboard': 'Trang chủ', '/remake/me': 'Tôi', '/remake/tasks': 'Công việc' };

// 4 trang chính của thanh tab dưới: không cần header (tên trang đã ở thanh tab, không có trang trước để quay lại)
const MAIN_PAGES = ['/remake/dashboard', '/remake/attendances', '/remake/attendance-history', '/remake/tasks', '/remake/me'];

// Tên trang ở header điện thoại: lấy theo nhãn menu có đường dẫn khớp dài nhất
function pageTitle(pathname: string, sections: SidebarSectionProps[]) {
  const entries = [...Object.entries(FIXED_TITLES), ...sections.flatMap((s) => s.items).map((i) => [i.href ?? '', i.label] as const)];
  const hit = entries.filter(([href]) => href && isActive(pathname, href)).sort((x, y) => y[0].length - x[0].length)[0];
  return hit?.[1] ?? APP_NAME;
}

// Khung chung của /remake: điện thoại = thanh tab dưới (4 mục cố định), từ 768px = sidebar.
// Menu và quyền dùng lại đúng cấu hình cũ (getSidebarSections + /me), nên không đổi luồng.
export function RemakeShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { access, isReady } = useCan();
  const [preview, setPreview] = useState<Preview | null>(null);
  const me = useMeStore((s) => s.me);

  useEffect(() => {
    useMeStore.getState().load();
  }, [pathname]);

  const sections = useMemo(
    () => (preview ? getRemakeSections(preview.access) : isReady ? getRemakeSections(access) : []),
    [access, isReady, preview],
  );

  const title = pageTitle(pathname, sections);
  const isMain = MAIN_PAGES.includes(pathname.replace(/\/$/, ''));

  return (
    <PreviewContext.Provider value={{ setPreview }}>
      <div className="min-h-dvh bg-rm-bg font-body text-rm-text">
        <Sidebar
          sections={sections}
          orgName={me?.org.name}
          userName={preview?.name ?? (me?.user.fullName || me?.user.username || '')}
          roleName={preview?.roleName ?? me?.roles[0]?.name}
        />

        <div className="md:pl-rm-sidebar">
          {!isMain && (
            <header className="sticky top-0 z-20 grid h-14 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 bg-rm-bg px-rm-gutter md:hidden">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Quay lại trang trước"
                className="flex size-11 items-center justify-center rounded-full bg-rm-surface text-rm-text transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 active:bg-rm-line"
              >
                <ChevronLeft size={22} />
              </button>
              <p className="truncate text-center font-heading text-base font-semibold text-rm-text">{title}</p>
            </header>
          )}

          <main className="mx-auto w-full max-w-6xl px-rm-gutter py-rm-gutter rm-main-pad md:px-6 md:py-6">{children}</main>
        </div>

        <BottomNav />
      </div>
    </PreviewContext.Provider>
  );
}
