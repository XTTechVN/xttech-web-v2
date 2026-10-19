'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Folder, MoreVertical, RotateCcw, Trash2, FileText } from 'lucide-react';
import type { TrashItem } from '@/types';
import { getFileVisualInfo } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import { cn } from '@/utils';

interface TrashCardProps {
  item: TrashItem;
  onRestore: (item: TrashItem) => void;
  onPurge: (item: TrashItem) => void;
  isRestoring?: boolean;
  isPurging?: boolean;
}

export const TrashCard: React.FC<TrashCardProps> = ({
  item,
  onRestore,
  onPurge,
  isRestoring = false,
  isPurging = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleButtonPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    clearCloseTimeout();
    setIsMenuOpen(true);
  };

  const handleMenuPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    clearCloseTimeout();
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 200);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearCloseTimeout();
    setIsMenuOpen((prev) => !prev);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        clearCloseTimeout();
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  const isFolder = item.itemType === 'folder';
  const displayName = item.title || (item as any).name || (item as any).folder_name || (item as any).fileName || 'Không có tên';
  const visualInfo = !isFolder ? getFileVisualInfo(item.fileName || item.title) : null;
  const locationName = item.categoryName || 'Tài liệu của tôi';

  const menuItems = [
    {
      label: 'Khôi phục',
      icon: <RotateCcw size={15} className="text-primary" />,
      onClick: () => onRestore(item),
      disabled: isRestoring || isPurging,
    },
    {
      label: 'Xóa vĩnh viễn',
      icon: <Trash2 size={15} className="text-rose-500" />,
      danger: true,
      onClick: () => onPurge(item),
      disabled: isRestoring || isPurging,
    },
  ];

  return (
    <div
      className={cn(
        'group relative flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer select-none transition-all duration-150',
        'bg-[#f0f4f9] hover:bg-[#e4ebf5] border border-transparent hover:border-slate-200/60 shadow-2xs hover:shadow-xs',
        isMenuOpen ? 'z-40 bg-[#e4ebf5] border-slate-200/80 shadow-xs' : 'active:scale-[0.99]',
      )}
      title={`${displayName} ${item.code ? `(${item.code})` : ''}`}
    >
      {/* Icon & Nội dung bên trái */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="shrink-0 text-slate-700 flex items-center justify-center">
          {isFolder ? (
            <Folder size={22} className="fill-slate-600/90 text-slate-700" />
          ) : visualInfo ? (
            visualInfo.icon
          ) : (
            <FileText size={22} className="text-blue-500" />
          )}
        </div>

        {/* Tiêu đề & Vị trí thư mục */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate text-sm font-medium text-slate-800 group-hover:text-primary transition-colors leading-tight">
            {displayName}
          </span>
          <span className="text-[11px] text-slate-500 truncate mt-0.5">
            trong {locationName}
          </span>
        </div>
      </div>

      {/* Nút ba chấm thao tác */}
      <div
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          onPointerEnter={handleButtonPointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleButtonClick}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer',
            isMenuOpen && 'bg-slate-200/80 text-slate-800',
          )}
          title="Thao tác"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Dropdown Menu xổ xuống gồm 2 nút: Khôi phục & Xóa vĩnh viễn */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          onPointerEnter={handleMenuPointerEnter}
          onPointerLeave={handlePointerLeave}
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 rounded-lg bg-white shadow-xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden border border-slate-200/80 py-0 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']"
        >
          {menuItems.map((menuItem, idx) => (
            <button
              key={idx}
              type="button"
              disabled={menuItem.disabled}
              onClick={(e) => {
                e.stopPropagation();
                clearCloseTimeout();
                setIsMenuOpen(false);
                menuItem.onClick?.();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors duration-150 text-left cursor-pointer font-medium first:rounded-t-lg last:rounded-b-lg',
                menuItem.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                menuItem.disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {menuItem.icon && <span className="shrink-0">{menuItem.icon}</span>}
              <span className="truncate">{menuItem.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
