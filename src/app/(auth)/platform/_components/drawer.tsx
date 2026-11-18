'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

const CLOSE_MS = 250;
const stack: symbol[] = [];
let locks = 0;

const lockScroll = () => {
  if (locks++ === 0) {
    const bar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = bar ? `${bar}px` : '';
  }
};
const unlockScroll = () => {
  if (--locks === 0) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
};

interface DrawerProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

// Mobile: bottom sheet; từ 768px: panel bên phải. Esc / bấm nền / nút X để đóng.
export const Drawer = ({ title, subtitle, onClose, children }: DrawerProps) => {
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    window.setTimeout(() => onCloseRef.current(), CLOSE_MS);
  }, []);

  useEffect(() => {
    const id = Symbol('drawer');
    stack.push(id);
    const prev = document.activeElement as HTMLElement | null;
    lockScroll();
    const raf = requestAnimationFrame(() => {
      setShown(true);
      panel.current?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === id) close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(id), 1);
      unlockScroll();
      prev?.focus?.();
    };
  }, [close]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-end md:items-stretch" role="presentation">
      <div
        className={cn('absolute inset-0 bg-gray-900/40 transition-opacity duration-200', shown ? 'opacity-100' : 'opacity-0')}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col rounded-t-xl bg-white outline-none transition duration-300 ease-out',
          'md:h-full md:max-h-none md:w-[32rem] md:rounded-none md:border-l md:border-gray-200',
          shown ? 'translate-y-0 opacity-100 md:translate-x-0' : 'translate-y-8 opacity-0 md:translate-x-8 md:translate-y-0',
        )}
      >
        <header className="flex flex-none items-start gap-3 border-b border-gray-200 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-lexend text-lg font-semibold text-gray-900 [overflow-wrap:anywhere]">{title}</h2>
            {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="-mr-2 inline-flex h-11 w-11 flex-none items-center justify-center rounded-md text-gray-600 active:scale-95 active:bg-gray-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
