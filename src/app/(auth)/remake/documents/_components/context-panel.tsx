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
        className="absolute inset-x-0 bottom-0 max-h-[70dvh] font-body text-rm-text overflow-y-auto rounded-t-rm-xl bg-rm-surface pb-[env(safe-area-inset-bottom)] md:inset-x-auto md:bottom-auto md:left-(--cm-x) md:top-(--cm-y) md:w-64 md:rounded-rm-xl md:border md:border-rm-line md:pb-0 md:shadow-rm-pop"
      >
        {title && <p className="truncate border-b border-rm-line px-rm-gutter py-3 text-sm font-semibold">{title}</p>}
        <ul className="py-1">
          {items.map((it) => (
            <li key={it.label} className={cn(it.dividerAfter && 'border-b border-rm-line')}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onClose();
                  it.onClick();
                }}
                className={cn(
                  'flex min-h-rm-tap w-full items-center gap-3 px-rm-gutter py-2 text-left text-sm transition-[background-color] duration-(--rm-dur-fast) active:bg-rm-bg disabled:opacity-50 md:hover:bg-rm-bg',
                  '[&_svg]:flex-none',
                  it.danger ? 'text-rm-danger [&_svg]:text-rm-danger' : '[&_svg]:text-rm-muted',
                )}
              >
                {it.icon}
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                {it.shortcut && <span className="hidden flex-none text-xs text-rm-muted md:inline">{it.shortcut}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
