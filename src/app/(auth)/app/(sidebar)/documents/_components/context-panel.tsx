'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { MenuItem } from './explorer-menu';
import { cn } from '@/utils/cn';

interface Props {
  open: boolean;
  x: number;
  y: number;
  title?: string;
  items: MenuItem[];
  onClose: () => void;
}

const PANEL_W = 256;
const ROW_H = 44;

// Menu chuột phải: điện thoại là ngăn kéo từ đáy, từ 768px là menu thả tại vị trí con trỏ.
export function ContextPanel({ open, x, y, title, items, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || items.length === 0) return null;

  const left = Math.max(8, Math.min(x, window.innerWidth - PANEL_W - 8));
  const top = Math.max(8, Math.min(y, window.innerHeight - items.length * ROW_H - 56));
  const pos = { '--cm-x': `${left}px`, '--cm-y': `${top}px` } as React.CSSProperties;

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-black/30 md:bg-transparent" />
      <div
        role="menu"
        aria-label={title ?? 'Thao tác'}
        style={pos}
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-0 max-h-[70dvh] font-body text-slate-900 overflow-y-auto rounded-t-block bg-white pb-[env(safe-area-inset-bottom)] md:inset-x-auto md:bottom-auto md:left-(--cm-x) md:top-(--cm-y) md:w-64 md:rounded-block md:border md:border-slate-200 md:pb-0 md:shadow-lg"
      >
        {title && <p className="truncate border-b border-slate-200 px-4 py-3 text-sm font-semibold">{title}</p>}
        <ul className="py-1">
          {items.map((it) => (
            <li key={it.label} className={cn(it.dividerAfter && 'border-b border-slate-200')}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onClose();
                  it.onClick();
                }}
                className={cn(
                  'flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-sm transition-[background-color] duration-200 active:bg-slate-50 disabled:opacity-50 md:hover:bg-slate-50',
                  '[&_svg]:flex-none',
                  it.danger ? 'text-red-600 [&_svg]:text-red-600' : '[&_svg]:text-slate-500',
                )}
              >
                {it.icon}
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                {it.shortcut && <span className="hidden flex-none text-xs text-slate-500 md:inline">{it.shortcut}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
