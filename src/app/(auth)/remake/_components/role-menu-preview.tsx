import { LayoutGrid } from 'lucide-react';
import type { RemakeNav } from './nav-model';

// Hình dung menu của role: 4 mục trên thanh tab dưới + nút Thêm, và các mục nằm trong Thêm
export function RoleMenuPreview({ nav }: { nav: RemakeNav }) {
  const more = nav.more.flatMap((s) => s.items);
  return (
    <div className="rounded-rm-xl border border-rm-edge bg-rm-surface">
      <p className="border-b border-rm-line px-3 py-2 text-xs font-medium text-rm-muted">Thanh tab dưới</p>
      <ul className="grid grid-cols-[repeat(5,minmax(0,1fr))] px-1 py-2">
        {nav.primary.map((item) => (
          <li key={item.id} className="flex min-w-0 flex-col items-center gap-0.5 px-1 text-xs text-rm-primary">
            <span className="[&_svg]:size-6">{item.icon}</span>
            <span className="line-clamp-2 w-full text-center leading-3.5">{item.label}</span>
          </li>
        ))}
        <li className="flex min-w-0 flex-col items-center gap-0.5 px-1 text-xs text-rm-muted">
          <LayoutGrid size={24} />
          <span>Thêm</span>
        </li>
      </ul>
      <p className="border-y border-rm-line px-3 py-2 text-xs font-medium text-rm-muted">Trong nút Thêm ({more.length})</p>
      {more.length === 0 ? (
        <p className="px-3 py-4 text-sm text-rm-muted">Không có chức năng nào khác.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-2 px-3 py-2 md:grid-cols-[repeat(3,minmax(0,1fr))]">
          {more.map((item) => (
            <li key={item.id} className="flex min-h-9 min-w-0 items-center gap-2 text-sm text-rm-text">
              <span className="flex-none text-rm-primary [&_svg]:size-4">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
