'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Folder, MoreVertical, RotateCcw, Trash2, FileText } from 'lucide-react';
import type { TrashItem } from '@/types';
import { getFileVisualInfo } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import { cn } from '@/utils';
import dayjs from 'dayjs';

interface TrashListItemProps {
  item: TrashItem;
  onRestore: (item: TrashItem) => void;
  onPurge: (item: TrashItem) => void;
  isRestoring?: boolean;
  isPurging?: boolean;
}

const AVATAR_COLORS = [
  'bg-amber-500 text-white',
  'bg-emerald-600 text-white',
  'bg-purple-600 text-white',
  'bg-blue-600 text-white',
  'bg-rose-500 text-white',
  'bg-teal-600 text-white',
  'bg-indigo-600 text-white',
];

function getAvatarStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const TrashListItem: React.FC<TrashListItemProps> = ({
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
  const deletedByName = item.deletedByName || 'Tôi';

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
        'group relative flex items-center justify-between py-3 px-3.5 border-b border-gray-100 hover:bg-[#f1f3f4] transition-colors cursor-pointer text-xs text-slate-800 select-none',
        isMenuOpen && 'z-40 bg-[#f1f3f4]',
      )}
      title={`${displayName} ${item.code ? `(${item.code})` : ''}`}
    >
      {/* Cột 1: Icon + Tên mục */}
      <div className="flex items-center gap-3.5 flex-1 min-w-[260px] pr-3">
        <div className="shrink-0 text-slate-700 flex items-center justify-center">
          {isFolder ? (
            <Folder size={18} className="text-slate-700 fill-slate-700 shrink-0" />
          ) : visualInfo ? (
            visualInfo.icon
          ) : (
            <FileText size={18} className="text-blue-500" />
          )}
        </div>
        <span className="font-normal text-slate-900 group-hover:text-primary transition-colors truncate text-sm">
          {displayName}
        </span>
      </div>

      {/* Cột 2: Lần sửa đổi gần đây nhất / Ngày xóa */}
      <div className="w-56 hidden sm:block text-slate-600 text-xs truncate">
        {item.deletedAt ? `Đã xóa • ${dayjs(item.deletedAt).format('D [thg] M')}` : 'Đã xóa'}
      </div>

      {/* Cột 3: Chủ sở hữu / Người xóa */}
      <div className="w-44 hidden md:flex items-center gap-2 text-slate-700 truncate">
        <div
          className={`w-5 h-5 rounded-full ${getAvatarStyle(deletedByName)} text-[10px] flex items-center justify-center shrink-0 uppercase font-semibold`}
        >
          {deletedByName.charAt(0)}
        </div>
        <span className="truncate text-xs font-normal">{deletedByName}</span>
      </div>

      {/* Cột 4: Vị trí */}
      <div className="w-48 hidden lg:flex items-center gap-2 text-slate-700 truncate">
        <Folder size={15} className="text-slate-700 fill-slate-700 shrink-0" />
        <span className="truncate text-xs text-slate-700" title={locationName}>
          {locationName}
        </span>
      </div>

      {/* Cột 5: Nút 3 chấm thao tác */}
      <div
        className="w-20 flex items-center justify-end shrink-0"
        onClick={(e) => e.stopPropagation()}
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

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            onPointerEnter={handleMenuPointerEnter}
            onPointerLeave={handlePointerLeave}
            className="absolute right-3 top-[calc(100%+4px)] z-50 w-44 rounded-lg bg-white shadow-xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden border border-slate-200/80 py-0 animate-in fade-in zoom-in-95 duration-100 before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']"
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
    </div>
  );
};
