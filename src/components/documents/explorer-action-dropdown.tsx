'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/utils';
import type { ExplorerContextMenuItem } from './explorer-context-menu';

export type ExplorerDropdownItem = ExplorerContextMenuItem;

export interface ExplorerActionDropdownProps {
  items: ExplorerContextMenuItem[];
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  menuClassName?: string;
}

export const ExplorerActionDropdown: React.FC<ExplorerActionDropdownProps> = ({
  items,
  isOpen: controlledOpen,
  onToggle,
  onClose,
  menuClassName,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalOpen((prev) => !prev);
  };

  const handleClose = () => {
    if (onClose) onClose();
    else setInternalOpen(false);
  };

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (items.length === 0) return null;

  return (
    <div ref={menuRef} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer',
          isOpen && 'bg-slate-200/80 text-slate-800',
        )}
        title="Thao tác"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute right-0 top-[calc(100%+6px)] z-50 w-48 rounded-lg bg-white shadow-xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden border border-slate-200/80 py-0 animate-in fade-in zoom-in-95 duration-100',
            menuClassName,
          )}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
                item.onClick();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors duration-150 text-left cursor-pointer font-medium first:rounded-t-lg last:rounded-b-lg disabled:opacity-40',
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
