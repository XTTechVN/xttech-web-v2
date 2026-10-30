'use client';

import React from 'react';
import { Folder, FolderOpen, RotateCcw, Trash2, FileText } from 'lucide-react';
import type { TrashItem } from '@/types';
import { getFileVisualInfo, cn } from '@/utils';
import { ExplorerActionDropdown, type ExplorerDropdownItem } from '@/components/documents';
import { getTrashItemDisplayName } from '../_utils/trash-helpers';

interface TrashCardProps {
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

export const TrashCard: React.FC<TrashCardProps> = ({
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
        'group relative flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer select-none transition-all duration-150',
        isSelected
          ? 'bg-primary/15 border-primary shadow-xs ring-2 ring-primary/60 text-primary'
          : 'bg-[#f0f4f9] hover:bg-[#e4ebf5] border border-transparent hover:border-slate-200/60 shadow-2xs hover:shadow-xs active:scale-[0.99]',
      )}
      title={
        isFolder
          ? `${displayName} (Nhấp đúp để mở thư mục)`
          : `${displayName} ${item.code ? `(${item.code})` : ''}`
      }
    >
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

        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate text-sm font-medium text-slate-800 group-hover:text-primary transition-colors leading-tight">
            {displayName}
          </span>
          <span className="text-[11px] text-slate-500 truncate mt-0.5">
            trong {locationName} • Còn {item.daysLeft ?? 30} ngày
          </span>
        </div>
      </div>

      <ExplorerActionDropdown items={menuItems} menuClassName="w-44" />
    </div>
  );
};
