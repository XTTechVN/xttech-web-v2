'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { EXIT_MS } from './drawer';
import { isTopLayer, popLayer, pushLayer } from './layers';
import { usePresence } from './use-presence';

// Chỉ một drawer con mở tại một thời điểm: mở cái mới thì đóng cái đang mở
let closeActive: (() => void) | null = null;

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}

// Drawer con, mở từ trong một Drawer: từ 1024px nằm sát bên trái drawer chính (cùng góc dưới, cao theo nội dung);
// nhỏ hơn thì phủ kín drawer chính (điện thoại: toàn màn hình), trượt từ phải sang trái.
// Không có scrim và không khóa cuộn riêng (drawer chính đã lo); Esc chỉ đóng lớp trên cùng.
export function SideDrawer({ isOpen, onClose, label, children }: SideDrawerProps) {
  const { mounted, closing, view } = usePresence(isOpen, children, EXIT_MS);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    closeActive?.();
    const mine = () => onCloseRef.current();
    closeActive = mine;
    const layer = pushLayer();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && isTopLayer(layer) && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      popLayer(layer);
      if (closeActive === mine) closeActive = null;
      previous?.focus();
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      data-closing={closing ? '' : undefined}
      className="rm-side-panel fixed inset-0 z-[51] flex flex-col overflow-y-auto bg-white outline-none md:inset-auto md:bottom-2 md:right-2 md:h-auto md:max-h-[calc(100dvh-1rem)] md:w-fit md:min-w-72 md:max-w-110 md:rounded-block md:border md:border-slate-200 md:shadow-2xl lg:right-[calc(var(--rm-drawer-w,440px)+1rem)]"
    >
      {view}
    </div>,
    document.body,
  );
}
