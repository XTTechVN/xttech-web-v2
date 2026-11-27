'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { isTopLayer, lockScroll, popLayer, pushLayer, unlockScroll } from './layers';
import { usePresence } from './use-presence';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Tên của hộp thoại cho trình đọc màn hình */
  label: string;
  /** Điện thoại: mặc định toàn màn hình; sheet = ngăn kéo từ đáy cao vừa nội dung (cho ô chọn, bộ lọc) */
  sheet?: boolean;
  /** Từ 768px: chiều rộng px (mặc định 440) hoặc 'content' = theo nội dung (320–640px) */
  width?: number | 'content';
  children: React.ReactNode;
}

const DEFAULT_WIDTH = 440;
export const EXIT_MS = 300;

// Drawer trống: chỉ có nền trắng, bo góc, hiệu ứng, scrim, Esc, khóa cuộn. Bên trong là children tùy ý
// (có thể ghép DrawerHeader / DrawerBody / DrawerFooter). Điện thoại: toàn màn hình nổi từ đáy lên.
// Từ 768px: panel bên phải, cao hết màn hình.
export function Drawer({ isOpen, onClose, label, sheet, width = DEFAULT_WIDTH, children }: DrawerProps) {
  const { mounted, closing, view } = usePresence(isOpen, children, EXIT_MS);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    lockScroll();
    panelRef.current?.focus();
    const layer = pushLayer();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && isTopLayer(layer) && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      popLayer(layer);
      unlockScroll();
      previous?.focus();
    };
  }, [isOpen]);

  // Cho drawer con biết bề rộng panel để nằm sát bên trái
  useEffect(() => {
    const panel = panelRef.current;
    if (!mounted || !panel) return;
    const root = document.documentElement.style;
    const previous = root.getPropertyValue('--rm-drawer-w');
    const sync = () => root.setProperty('--rm-drawer-w', `${panel.offsetWidth}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(panel);
    return () => {
      ro.disconnect();
      if (previous) root.setProperty('--rm-drawer-w', previous);
      else root.removeProperty('--rm-drawer-w');
    };
  }, [mounted]);

  if (!mounted) return null;

  const state = closing ? '' : undefined;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end md:p-2">
      <div className="rm-drawer-scrim absolute inset-0 bg-slate-900/40" data-closing={state} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        data-closing={state}
        style={typeof width === 'number' ? ({ '--rm-w': `${width}px` } as React.CSSProperties) : undefined}
        className={cn(
          'rm-drawer-panel relative flex w-full flex-col overflow-y-auto bg-white outline-none md:h-auto md:max-h-none md:rounded-block md:border md:border-slate-200 md:shadow-2xl',
          width === 'content' ? 'md:w-auto md:min-w-80 md:max-w-xl' : 'md:w-(--rm-w)',
          sheet ? 'max-h-[90dvh] rounded-t-block' : 'h-dvh rounded-none',
        )}
      >
        {view}
      </div>
    </div>,
    document.body,
  );
}
