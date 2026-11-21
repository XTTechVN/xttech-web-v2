'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

// Điện thoại: trượt từ đáy. Từ 768px: panel bên phải. Một khung chung cho mọi sheet.
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(open);
  const [leaving, setLeaving] = useState(false);
  // Giữ onClose mới nhất mà không đưa vào deps của effect: onClose inline đổi mỗi lần render
  // sẽ chạy lại effect và giành focus khỏi ô đang gõ.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Đồng bộ cờ hiển thị với `open` ngay trong lúc render (không dùng effect)
  if (open && (!shown || leaving)) {
    setShown(true);
    setLeaving(false);
  }
  if (!open && shown && !leaving) setLeaving(true);

  useEffect(() => {
    if (!shown) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== panelRef.current) return;
      if (e.key === 'Escape') return closeRef.current();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previous?.focus();
    };
  }, [shown]);

  if (!shown || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end pt-10 md:items-stretch md:justify-end md:pt-0">
      <div
        className={cn('absolute inset-0', leaving ? 'animate-rm-scrim-out bg-transparent' : 'animate-rm-scrim-in bg-rm-scrim')}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onAnimationEnd={(e) => {
          if (leaving && e.target === e.currentTarget) {
            setShown(false);
            setLeaving(false);
          }
        }}
        className={cn(
          'relative flex max-h-dvh w-full flex-col rounded-t-rm-xl bg-rm-surface font-body text-rm-text outline-none md:w-rm-sheet md:max-h-none md:rounded-none md:border-l md:border-rm-line',
          leaving ? 'animate-rm-sheet-out rm-sheet-off' : 'animate-rm-sheet-in',
        )}
      >
        <header className="flex min-h-rm-tap flex-none items-center gap-2 border-b border-rm-line pl-rm-gutter pr-1">
          <h2 id={titleId} className="min-w-0 flex-1 truncate font-heading text-base font-semibold text-rm-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex size-rm-tap flex-none items-center justify-center rounded-rm text-rm-muted transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 active:bg-rm-bg"
          >
            <X size={20} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+var(--spacing-rm-gutter))] md:pb-0">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
