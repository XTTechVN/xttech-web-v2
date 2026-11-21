'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCan } from '@/hooks';
import { BTN_LINE } from '../../_components/form';
import { getRemakeSections } from '../../_components/remake-menu';
import { Sheet } from '../../_components/sheet';

const KEY = 'rm-quick-actions';
// Lối tắt mặc định (lấy những mục người dùng có quyền, tối đa 5)
const DEFAULT_IDS = ['attendance-history', 'leave', 'adjustments', 'projects', 'employees', 'customers-root', 'documents'];
const DEFAULT_COUNT = 5;

function load(): string[] | null {
  try {
    const raw = typeof window === 'undefined' ? null : window.localStorage.getItem(KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(ids) ? ids.filter((i): i is string => typeof i === 'string') : null;
  } catch {
    return null;
  }
}

function save(ids: string[] | null) {
  try {
    if (ids) window.localStorage.setItem(KEY, JSON.stringify(ids));
    else window.localStorage.removeItem(KEY);
  } catch {
    // lưu không được (chế độ riêng tư…) thì chỉ giữ trong phiên
  }
}

// Điện thoại: ô tìm kiếm (làm sau) + nút tuỳ chỉnh; bên dưới là các lối tắt người dùng tự chọn.
export function QuickActions() {
  const { access, isReady } = useCan();
  const [picked, setPicked] = useState<string[] | null>(load);
  const [open, setOpen] = useState(false);

  const sections = useMemo(
    () =>
      isReady
        ? getRemakeSections(access)
            .map((s) => ({ ...s, items: s.items.filter((i) => i.id !== 'dashboard') }))
            .filter((s) => s.items.length > 0)
        : [],
    [access, isReady],
  );
  const flat = sections.flatMap((s) => s.items);
  const ids = picked ?? DEFAULT_IDS.filter((id) => flat.some((i) => i.id === id)).slice(0, DEFAULT_COUNT);
  const shown = ids.map((id) => flat.find((i) => i.id === id)).filter((i): i is (typeof flat)[number] => !!i);

  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
    setPicked(next);
    save(next);
  };
  const reset = () => {
    setPicked(null);
    save(null);
  };

  return (
    <div className="mb-6 flex flex-col gap-5 md:hidden">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rm-muted" aria-hidden="true" />
          <input
            type="search"
            disabled
            aria-label="Tìm kiếm (sắp có)"
            placeholder="Tìm kiếm"
            className="h-11 w-full rounded-rm bg-rm-line/60 pl-10 pr-3 text-base text-rm-text placeholder:text-rm-muted disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chọn lối tắt"
          className="flex size-11 flex-none items-center justify-center rounded-rm bg-rm-primary text-rm-on-primary transition-transform active:scale-95"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {shown.length > 0 && (
        <ul className="-mx-rm-gutter flex gap-3 overflow-x-auto px-rm-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {shown.map((i) => (
            <li key={i.id} className="w-16 flex-none">
              <Link href={i.href ?? '#'} className="flex flex-col items-center gap-1.5 active:opacity-70">
                <span className="flex size-12 items-center justify-center rounded-full bg-rm-surface text-rm-primary [&_svg]:size-5">{i.icon}</span>
                <span className="line-clamp-2 w-full text-center text-[11px] leading-3.5 text-rm-muted [overflow-wrap:anywhere]">{i.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Chọn lối tắt">
        <div className="flex flex-col gap-4 p-rm-gutter">
          <p className="text-sm text-rm-muted">Chọn chức năng muốn hiện ở Trang chủ. Chỉ gồm các chức năng bạn có quyền.</p>
          {sections.map((s) => (
            <fieldset key={s.title}>
              <legend className="mb-1 px-1 text-xs font-medium text-rm-muted">{s.title}</legend>
              <ul className="divide-y divide-rm-line overflow-hidden rounded-rm-xl border border-rm-edge bg-rm-surface">
                {s.items.map((i) => (
                  <li key={i.id}>
                    <label className="flex min-h-rm-tap cursor-pointer items-center gap-3 px-rm-gutter py-2 text-sm active:bg-rm-bg">
                      <span className="flex size-8 flex-none items-center justify-center rounded-rm bg-rm-primary-soft text-rm-primary">
                        {i.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{i.label}</span>
                      <input
                        type="checkbox"
                        checked={ids.includes(i.id)}
                        onChange={() => toggle(i.id)}
                        className="size-5 flex-none accent-rm-primary"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
          <button type="button" onClick={reset} className={BTN_LINE}>
            Về mặc định
          </button>
        </div>
      </Sheet>
    </div>
  );
}
