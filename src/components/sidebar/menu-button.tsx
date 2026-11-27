'use client';

import { Menu } from 'lucide-react';

/** Nút mở sidebar, chỉ có ở điện thoại (không còn header) */
export function SidebarMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Mở menu"
      onClick={onClick}
      className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-control text-slate-600 transition active:scale-95 active:bg-slate-100 md:hidden"
    >
      <Menu size={22} />
    </button>
  );
}
