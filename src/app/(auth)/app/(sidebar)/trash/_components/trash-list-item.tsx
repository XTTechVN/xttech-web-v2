'use client';

import React from 'react';
import { Folder, FolderOpen, RotateCcw, Trash2, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import type { TrashItem } from '@/types';
import { getFileVisualInfo, getAvatarStyle, cn } from '@/utils';
import { ExplorerActionDropdown, type ExplorerDropdownItem } from '@/components/documents';
import { getTrashItemDisplayName } from '../_utils/trash-helpers';

interface TrashListItemProps {
  item: TrashItem;
  isSelected?: boolean;
  onSelectItem?: (e: React.MouseEvent, item: TrashItem) => void;
  onOpenFolder?: (folderId: number) => void;
  onContextMenuItem?: (e: React.MouseEvent, item: TrashItem) => void;
  onRestore: (item: TrashItem) => void;
  onPurge: (item: TrashItem) => void;
  isRestoring?: boolean;
  isPurging?: boolean;
}

export const TrashListItem: React.FC<TrashListItemProps> = ({
  item,
  isSelected = false,
  onSelectItem,
  onOpenFolder,
  onContextMenuItem,
  onRestore,
  onPurge,
  isRestoring = false,
  isPurging = false,
}) => {
  const isFolder = item.itemType === 'folder';
  const displayName = getTrashItemDisplayName(item);
  const visualInfo = !isFolder ? getFileVisualInfo(item.fileName || item.title) : null;
  const locationName = item.categoryName || 'Tài liệu của tôi';
  const deletedByName = item.deletedByName || 'Tôi';

  const menuItems: ExplorerDropdownItem[] = [
    ...(isFolder && onOpenFolder
      ? [
          {
            label: 'Mở thư mục',
            icon: <FolderOpen size={15} className="text-primary" />,
            danger: false,
            onClick: () => onOpenFolder(item.id),
            disabled: false,
          },
        ]
      : []),
    {
      label: 'Khôi phục',
      icon: <RotateCcw size={15} className="text-primary" />,
      danger: false,
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
      onClick={(e) => {
        if (onSelectItem) {
          onSelectItem(e, item);
          return;
        }
        if (isFolder && onOpenFolder) onOpenFolder(item.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (isFolder && onOpenFolder) onOpenFolder(item.id);
      }}
      onContextMenu={(e) => {
        if (!onContextMenuItem) return;
        onContextMenuItem(e, item);
      }}
      className={cn(
        'group relative flex items-center justify-between py-3 px-3.5 border-b border-gray-100 transition-colors cursor-pointer text-xs text-slate-800 select-none',
        isSelected
          ? 'bg-primary/15 text-primary font-medium'
          : 'hover:bg-[#f1f3f4]',
      )}
      title={
        isFolder
          ? `${displayName} (Nhấp đúp để mở thư mục)`
          : `${displayName} ${item.code ? `(${item.code})` : ''}`
      }
    >
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

      <div className="w-56 hidden sm:block text-slate-600 text-xs truncate">
        {item.deletedAt ? `Đã xóa • ${dayjs(item.deletedAt).format('D [thg] M')}` : 'Đã xóa'}
        {typeof item.daysLeft === 'number' ? ` (${item.daysLeft} ngày)` : ''}
      </div>

      <div className="w-44 hidden md:flex items-center gap-2 text-slate-700 truncate">
        <div
          className={`w-5 h-5 rounded-full ${getAvatarStyle(deletedByName)} text-[10px] flex items-center justify-center shrink-0 uppercase font-semibold`}
        >
          {deletedByName.charAt(0)}
        </div>
        <span className="truncate text-xs font-normal">{deletedByName}</span>
      </div>

      <div className="w-48 hidden lg:flex items-center gap-2 text-slate-700 truncate">
        <Folder size={15} className="text-slate-700 fill-slate-700 shrink-0" />
        <span className="truncate text-xs text-slate-700" title={locationName}>
          {locationName}
        </span>
      </div>

      <div className="w-20 flex items-center justify-end shrink-0">
        <ExplorerActionDropdown items={menuItems} menuClassName="w-44" />
      </div>
    </div>
  );
};
