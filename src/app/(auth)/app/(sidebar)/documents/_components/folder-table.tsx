'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Folder, MoreVertical, Edit2, Trash2, FolderOpen, Users, Share2 } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { useAuthStore } from '@/stores';
import { cn } from '@/utils';
import dayjs from 'dayjs';

interface FolderTableProps {
  folders: DocumentCategory[];
  locationName?: string;
  showHeader?: boolean;
  activeFolderId?: number | null;
  selectedKeys?: Set<string>;
  onToggleSelect?: (folder: DocumentCategory) => void;
  onOpen: (folder: DocumentCategory) => void;
  onEdit: (folder: DocumentCategory) => void;
  onMove?: (folder: DocumentCategory) => void;
  onDropItem?: (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => void;
  onDelete: (folder: DocumentCategory) => void;
  onShare?: (folder: DocumentCategory) => void;
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

export const FolderTable: React.FC<FolderTableProps> = ({
  folders,
  locationName,
  showHeader = false,
  activeFolderId,
  selectedKeys,
  onToggleSelect,
  onOpen,
  onEdit,
  onMove,
  onDropItem,
  onDelete,
  onShare,
}) => {
  const { user } = useAuthStore();
  const [openMenuFolderId, setOpenMenuFolderId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = (e: React.MouseEvent, folderId: number) => {
    e.stopPropagation();
    setOpenMenuFolderId((prev) => (prev === folderId ? null : folderId));
  };

  // Đóng menu khi nhấp chuột ra ngoài
  useEffect(() => {
    if (!openMenuFolderId) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuFolderId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuFolderId]);

  return (
    <div className="w-full bg-white select-none">
      {/* Header nếu được yêu cầu */}
      {showHeader && (
        <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-gray-200 text-xs font-medium text-slate-600">
          <div className="flex-1 min-w-[260px] pl-1">Tên</div>
          <div className="w-56 hidden sm:block">Lần sửa đổi gần đây nhất</div>
          <div className="w-44 hidden md:block">Chủ sở hữu</div>
          <div className="w-48 hidden lg:block">Vị trí</div>
          <div className="w-20 text-right"></div>
        </div>
      )}

      {/* Danh sách hàng thư mục phẳng chuẩn Google Drive */}
      <div>
        {folders.map((folder) => {
          const isOwner = folder.isOwner ?? (folder.createdById ? folder.createdById === user?.id : true);
          const ownerName = isOwner ? 'tôi' : folder.createdByName || 'Thành viên';
          const isShared = Boolean(
            folder.isShared ||
            (folder.sharedWithCount && folder.sharedWithCount > 0) ||
            folder.isOwner === false ||
            folder.permission === 'view'
          );
          const canEdit = folder.isOwner !== false && folder.permission !== 'view';
          const canShare = Boolean(onShare && folder.isOwner !== false);
          const parentName = locationName || 'Drive của tôi';
          const isMenuOpen = openMenuFolderId === folder.id;

          const menuItems: {
            label: string;
            icon: React.ReactNode;
            onClick: () => void;
            danger?: boolean;
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
                  {
                    label: 'Đổi tên / Sửa',
                    icon: <Edit2 size={15} className="text-primary" />,
                    onClick: () => onEdit(folder),
                  },
                  ...(onMove ? [
                    {
                      label: 'Di chuyển',
                      icon: <FolderOpen size={15} className="text-primary" />,
                      onClick: () => onMove(folder),
                    }
                  ] : []),
                  {
                    label: 'Xóa thư mục',
                    icon: <Trash2 size={15} className="text-rose-500" />,
                    danger: true,
                    onClick: () => onDelete(folder),
                  },
                ]
              : []),
          ];

          const isActive = activeFolderId === folder.id;
          const isSelected = selectedKeys?.has(`folder-${folder.id}`) ?? false;

          return (
            <div
              key={folder.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'folder', id: folder.id }));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                if (!onDropItem) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverFolderId(folder.id);
              }}
              onDragLeave={() => {
                setDragOverFolderId(null);
              }}
              onDrop={(e) => {
                if (!onDropItem) return;
                e.preventDefault();
                setDragOverFolderId(null);
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
                'group relative flex items-center justify-between py-3 px-3.5 border-b border-gray-100 transition-colors cursor-pointer text-xs text-slate-800',
                isSelected
                  ? 'bg-primary/15 border-l-2 border-primary text-primary font-medium'
                  : isActive
                  ? 'bg-primary/10 border-l-2 border-primary text-primary'
                  : dragOverFolderId === folder.id
                  ? 'bg-primary/20 ring-2 ring-primary/50'
                  : 'hover:bg-[#f1f3f4]',
                isMenuOpen && 'z-40 bg-[#f1f3f4]'
              )}
            >
              {/* Cột 1: Icon Folder + Tên thư mục + Icon Shared */}
              <div className="flex items-center gap-3.5 flex-1 min-w-[260px] pr-3">
                {isActive ? (
                  <FolderOpen size={18} className="text-primary fill-primary/25 shrink-0" />
                ) : (
                  <Folder size={18} className="text-slate-700 fill-slate-700 shrink-0" />
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'transition-colors truncate text-sm',
                      isActive ? 'font-semibold text-primary' : 'font-normal text-slate-900 group-hover:text-primary'
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
                {isShared && (
                  <span title="Đã chia sẻ" className="shrink-0 flex items-center">
                    <Users size={14} className="text-slate-500" />
                  </span>
                )}
              </div>

              {/* Cột 2: Ngày tạo / Lần sửa đổi */}
              <div className="w-56 hidden sm:block text-slate-600 text-xs truncate">
                Đã tạo • {dayjs(folder.createdAt).format('D [thg] M')}
              </div>

              {/* Cột 3: Chủ sở hữu */}
              <div className="w-44 hidden md:flex items-center gap-2 text-slate-700 truncate">
                <div
                  className={`w-5 h-5 rounded-full ${
                    isOwner ? 'bg-slate-700 text-white font-bold' : getAvatarStyle(ownerName)
                  } text-[10px] flex items-center justify-center shrink-0 uppercase font-semibold`}
                >
                  {ownerName.charAt(0)}
                </div>
                <span className="truncate text-xs font-normal">{ownerName}</span>
              </div>

              {/* Cột 4: Vị trí */}
              <div className="w-48 hidden lg:flex items-center gap-2 text-slate-700 truncate">
                <Folder size={15} className="text-slate-700 fill-slate-700 shrink-0" />
                <span className="truncate text-xs text-slate-700" title={parentName}>
                  {parentName}
                </span>
              </div>

              {/* Cột 5: Nút thao tác (chỉ nút tròn 3 chấm) */}
              <div
                className="w-20 flex items-center justify-end shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nút 3 chấm tròn - click để mở menu */}
                <button
                  type="button"
                  onClick={(e) => handleButtonClick(e, folder.id)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer',
                    isMenuOpen && 'bg-slate-200 text-slate-800'
                  )}
                  title="Thao tác khác"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Menu con tách hẳn xuống dưới hàng 8px và căn lề mép phải, bo góc rounded-lg */}
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-3.5 top-[calc(100%+8px)] z-50 w-48 rounded-lg bg-white shadow-xl ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden border border-slate-200/90 py-0 animate-in fade-in zoom-in-95 duration-100"
                >
                  {menuItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuFolderId(null);
                        item.onClick?.();
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors duration-150 text-left cursor-pointer font-medium first:rounded-t-lg last:rounded-b-lg',
                        item.danger
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
        })}
      </div>
    </div>
  );
};
