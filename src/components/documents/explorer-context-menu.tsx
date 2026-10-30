'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils';

export interface ExplorerContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  dividerAfter?: boolean;
}

interface ExplorerContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  title?: string;
  items: ExplorerContextMenuItem[];
  onClose: () => void;
}

export const ExplorerContextMenu: React.FC<ExplorerContextMenuProps> = ({
  isOpen,
  x,
  y,
  title,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScrollOrResize = () => onClose();

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, onClose]);

  if (!isOpen || items.length === 0 || typeof document === 'undefined') return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const estimatedHeight = items.length * 36 + (title ? 36 : 12);
  const left = Math.max(8, Math.min(x, vw - 236));
  const top = Math.max(8, Math.min(y, vh - estimatedHeight - 12));

  return createPortal(
    <div
      ref={menuRef}
      style={{ left, top }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-[9999] w-56 rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/10 border border-slate-200/90 py-1.5 select-none"
    >
      {title && (
        <div className="px-3.5 py-1.5 mb-1 border-b border-slate-100 text-[11px] font-semibold text-slate-500 truncate">
          {title}
        </div>
      )}
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <button
            type="button"
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              item.onClick();
            }}
            className={cn(
              'flex w-full items-center justify-between gap-3 px-3.5 py-2 text-xs transition-colors duration-100 text-left cursor-pointer font-medium disabled:opacity-40 disabled:pointer-events-none',
              item.danger
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900',
            )}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </span>
            {item.shortcut && (
              <span className="text-[10px] font-normal text-slate-400 shrink-0 ml-2">
                {item.shortcut}
              </span>
            )}
          </button>
          {item.dividerAfter && <div className="my-1 border-t border-slate-100" />}
        </React.Fragment>
      ))}
    </div>,
    document.body,
  );
};
