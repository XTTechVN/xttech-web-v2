'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Folder, MoreVertical, Edit2, Trash2, FolderOpen, User, Share2 } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { usePermission } from '@/hooks';
import { cn } from '@/utils';

interface FolderCardProps {
  folder: DocumentCategory;
  locationName?: string;
  isActive?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (folder: DocumentCategory) => void;
  onOpen: (folder: DocumentCategory) => void;
  onEdit?: (folder: DocumentCategory) => void;
  onMove?: (folder: DocumentCategory) => void;
  onDropItem?: (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => void;
  onDelete?: (folder: DocumentCategory) => void;
  onShare?: (folder: DocumentCategory) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  locationName,
  isActive = false,
  isSelected = false,
  onToggleSelect,
  onOpen,
  onEdit,
  onMove,
  onDropItem,
  onDelete,
  onShare,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isAdmin, isHR } = usePermission();
  const canManage = isAdmin || isHR;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const isShared = Boolean(
    folder.isShared ||
    (folder.sharedWithCount && folder.sharedWithCount > 0) ||
    folder.isOwner === false ||
    folder.permission === 'view'
  );
  const canEdit = canManage || (folder.isOwner !== false && folder.permission !== 'view');
  const canShare = Boolean(onShare && (canManage || folder.isOwner !== false));

  const menuItems: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
  }[] = [
    {
      label: 'Mở thư mục',
      icon: <FolderOpen size={15} className="text-primary" />,
      onClick: () => onOpen(folder),
    },
    ...(canShare && onShare
      ? [
          {
            label: 'Chia sẻ',
            icon: <Share2 size={15} className="text-primary" />,
            onClick: () => onShare(folder),
          },
        ]
      : []),
    ...(canEdit
      ? [
          ...(onEdit
            ? [
                {
                  label: 'Đổi tên / Sửa',
                  icon: <Edit2 size={15} className="text-primary" />,
                  onClick: () => onEdit(folder),
                },
              ]
            : []),
          ...(onMove
            ? [
                {
                  label: 'Di chuyển',
                  icon: <FolderOpen size={15} className="text-primary" />,
                  onClick: () => onMove(folder),
                },
              ]
            : []),
          ...(onDelete
            ? [
                {
                  label: 'Xóa thư mục',
                  icon: <Trash2 size={15} className="text-rose-500" />,
                  danger: true,
                  onClick: () => onDelete(folder),
                },
              ]
            : []),
        ]
      : []),
  ];

  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'folder', id: folder.id }));
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        if (!onDropItem) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      }}
      onDragLeave={() => {
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        if (!onDropItem) return;
        e.preventDefault();
        setIsDragOver(false);
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data && data.type && data.id) {
            onDropItem(data.type, data.id, folder.id);
          }
        } catch (err) {}
      }}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          onToggleSelect?.(folder);
          return;
        }
        onOpen(folder);
      }}
      className={cn(
        'group relative flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer select-none transition-all duration-150',
        isSelected
          ? 'bg-primary/15 border-primary shadow-xs ring-2 ring-primary/60 text-primary'
          : isActive
          ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30'
          : isDragOver
          ? 'bg-primary/20 border-primary ring-2 ring-primary/50'
          : 'bg-[#f0f4f9] hover:bg-[#e4ebf5] border border-transparent hover:border-slate-200/60 shadow-2xs hover:shadow-xs',
        isMenuOpen ? 'z-40 bg-[#e4ebf5] border-slate-200/80 shadow-xs' : 'active:scale-[0.99]',
      )}
      title={`${folder.name} (${folder.code})`}
    >
      {/* Icon bên trái */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0 text-slate-700">
          {isActive ? (
            <FolderOpen size={22} className="text-primary fill-primary/25" />
          ) : (
            <Folder size={22} className="fill-slate-600/90 text-slate-700" />
          )}
          {isShared && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs">
              <User size={10} className="text-primary fill-primary" />
            </div>
          )}
        </div>

        {/* Tên thư mục & Đường dẫn vị trí */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                'truncate text-sm font-medium transition-colors leading-tight',
                isActive ? 'text-primary font-semibold' : 'text-slate-800 group-hover:text-primary',
              )}
            >
              {folder.name}
            </span>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium shrink-0">
                Đang mở
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 truncate mt-0.5">
            {locationName ? `trong ${locationName}` : folder.description || 'Thư mục'}
          </span>
        </div>
      </div>

      {/* Nút 3 chấm thao tác */}
      <div
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          type="button"
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

      {/* Menu con tách hẳn xuống dưới và căn thẳng hàng với bên phải card, bo góc rounded-lg */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 rounded-lg bg-white shadow-xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden border border-slate-200/80 py-0 animate-in fade-in zoom-in-95 duration-100"
        >
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                item.onClick?.();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors duration-150 text-left cursor-pointer font-medium first:rounded-t-lg last:rounded-b-lg',
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
