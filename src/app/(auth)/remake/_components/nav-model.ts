import type { SidebarItemProps, SidebarSectionProps } from '@/components';

// 4 chức năng chính ở thanh tab dưới (nếu người dùng có quyền); thiếu thì lấy tiếp theo thứ tự menu
const PRIMARY_IDS = ['dashboard', 'projects', 'customers-root', 'attendances-root'];
const PRIMARY_COUNT = 4;

export interface RemakeNav {
  primary: SidebarItemProps[];
  more: SidebarSectionProps[];
}

export function splitNav(sections: SidebarSectionProps[]): RemakeNav {
  const flat = sections.flatMap((s) => s.items).filter((i) => i.href);
  const picked = PRIMARY_IDS.map((id) => flat.find((i) => i.id === id)).filter((i): i is SidebarItemProps => !!i);
  const primary = [...picked, ...flat.filter((i) => !picked.includes(i))].slice(0, PRIMARY_COUNT);
  const more = sections.map((s) => ({ ...s, items: s.items.filter((i) => i.href && !primary.includes(i)) })).filter((s) => s.items.length > 0);
  return { primary, more };
}

export function isActive(pathname: string, href?: string) {
  return !!href && (pathname === href || pathname.startsWith(href + '/'));
}
