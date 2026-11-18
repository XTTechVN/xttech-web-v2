'use client';

import { useEffect, useRef, useState } from 'react';

// Icon thư viện lucide-react
import { EllipsisVertical } from 'lucide-react';

import { cn } from '@/utils/cn';

export interface RowActionItem {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

const MENU_WIDTH = 176; // px (w-44)

// Menu 3 chấm cuối hàng: thả xuống dưới nút, căn phải theo nút, neo bằng position: fixed để bảng không cắt
const RowActions = ({ items }: { items: RowActionItem[] }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pos]);

  const toggle = () => {
    if (pos) return setPos(null);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 4, left: Math.max(8, rect.right - MENU_WIDTH) });
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Hành động"
        onClick={toggle}
        onMouseDown={(e) => e.stopPropagation()}
        className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <EllipsisVertical size={18} />
      </button>

      {pos && (
        <div
          style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-50 rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
        >
          {items.map(({ label, icon: Icon, onClick, danger, disabled }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => {
                setPos(null);
                onClick();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default RowActions;
