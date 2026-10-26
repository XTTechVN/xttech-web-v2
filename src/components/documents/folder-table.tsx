'use client';

import React, { useState } from 'react';
import { Folder, FolderOpen, Users } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks';
import { cn, getAvatarStyle } from '@/utils';
import dayjs from 'dayjs';
import { ExplorerActionDropdown } from './explorer-action-dropdown';
import { buildFolderDropdownItems } from './explorer-menu-builder';

interface FolderTableProps {
  folders: DocumentCategory[];
  locationName?: string;
  isSharedSection?: boolean;
  showHeader?: boolean;
  activeFolderId?: number | null;
  selectedKeys?: Set<string>;
  cutKeys?: Set<string>;
  hasClipboard?: boolean;
  onToggleSelect?: (folder: DocumentCategory) => void;
  onSelectItem?: (e: React.MouseEvent, folder: DocumentCategory) => void;
  onContextMenuItem?: (e: React.MouseEvent, folder: DocumentCategory) => void;
  onOpen: (folder: DocumentCategory) => void;
  onViewDetail?: (folder: DocumentCategory) => void;
  onEdit?: (folder: DocumentCategory) => void;
  onMove?: (folder: DocumentCategory) => void;
  onCut?: (folder: DocumentCategory) => void;
  onPasteIntoFolder?: (folder: DocumentCategory) => void;
  onDropItem?: (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => void;
  onDelete?: (folder: DocumentCategory) => void;
  onShare?: (folder: DocumentCategory) => void;
}

export const FolderTable: React.FC<FolderTableProps> = ({
  folders,
  locationName,
  isSharedSection = false,
  showHeader = false,
  activeFolderId,
  selectedKeys,
  cutKeys,
  hasClipboard = false,
  onToggleSelect,
  onSelectItem,
  onContextMenuItem,
  onOpen,
  onViewDetail,
  onEdit,
  onMove,
  onCut,
  onPasteIntoFolder,
  onDropItem,
  onDelete,
  onShare,
}) => {
  const { user } = useAuthStore();
  const { isAdmin, isHR } = usePermission();
  const canManage = isAdmin || isHR;

  const [openMenuFolderId, setOpenMenuFolderId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);

  return (
    <div className="w-full bg-white select-none">
      {showHeader && (
        <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-gray-200 text-xs font-medium text-slate-600">
          <div className="flex-1 min-w-[260px] pl-1">Tên</div>
          <div className="w-56 hidden sm:block">Lần sửa đổi gần đây nhất</div>
          <div className="w-44 hidden md:block">Chủ sở hữu</div>
          <div className="w-48 hidden lg:block">Vị trí</div>
          <div className="w-20 text-right"></div>
        </div>
      )}

      <div>
        {folders.map((folder) => {
          const byCreator = Boolean(folder.createdById && user?.id && String(folder.createdById) === String(user.id));
          const isOwner = Boolean(!isSharedSection && (folder.isOwner ?? (byCreator || !folder.createdById))) || byCreator;
          const ownerName = isOwner ? 'tôi' : folder.createdByName || 'Thành viên';
          const isShared = Boolean(
            isSharedSection ||
              folder.isShared ||
              (folder.sharedWithCount && folder.sharedWithCount > 0) ||
              folder.isOwner === false ||
              folder.permission !== undefined,
          );
          const isOwnerOrAdmin = isOwner || canManage;
          const parentName = locationName || 'Drive của tôi';
          const isMenuOpen = openMenuFolderId === folder.id;
          const isActive = activeFolderId === folder.id;
          const key = `folder-${folder.id}`;
          const isSelected = selectedKeys?.has(key) ?? false;
          const isCut = cutKeys?.has(key) ?? false;

          const menuItems = buildFolderDropdownItems({
            folder,
            canEdit: isOwnerOrAdmin,
            canMove: isOwnerOrAdmin,
            canShare: Boolean(onShare && isOwnerOrAdmin),
            canDelete: isOwnerOrAdmin,
            canPaste: Boolean(hasClipboard && (isOwnerOrAdmin || folder.permission === 'edit')),
            onOpen,
            onViewDetail,
            onPasteIntoFolder,
            onShare,
            onEdit,
            onCut,
            onMove,
            onDelete,
          });

          return (
            <div
              key={folder.id}
              draggable={isOwnerOrAdmin}
              onDragStart={(e) => {
                if (!isOwnerOrAdmin) return void e.preventDefault();
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'folder', id: folder.id }));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                if (!onDropItem) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverFolderId(folder.id);
              }}
              onDragLeave={() => setDragOverFolderId(null)}
              onDrop={(e) => {
                if (!onDropItem) return;
                e.preventDefault();
                setDragOverFolderId(null);
                try {
                  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                  if (data?.type && data?.id) onDropItem(data.type, data.id, folder.id);
                } catch {}
              }}
              onClick={(e) => {
                if (onSelectItem) return void onSelectItem(e, folder);
                if (e.ctrlKey || e.metaKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSelect?.(folder);
                  return;
                }
                onOpen(folder);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onOpen(folder);
              }}
              onContextMenu={(e) => {
                if (!onContextMenuItem) return;
                e.preventDefault();
                e.stopPropagation();
                setOpenMenuFolderId(null);
                onContextMenuItem(e, folder);
              }}
              className={cn(
                'group relative flex items-center justify-between py-3 px-3.5 border-b border-gray-100 transition-colors cursor-pointer text-xs text-slate-800',
                isSelected
                  ? 'bg-primary/10 text-primary font-medium'
                  : isActive
                    ? 'bg-primary/10 border-l-2 border-primary text-primary'
                    : dragOverFolderId === folder.id
                      ? 'bg-primary/20 ring-2 ring-primary/50'
                      : 'hover:bg-[#f1f3f4]',
                isCut && 'opacity-55 border-dashed',
                isMenuOpen && 'z-40 bg-[#f1f3f4]',
              )}
            >
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
                      isActive ? 'font-semibold text-primary' : 'font-normal text-slate-900 group-hover:text-primary',
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

              <div className="w-56 hidden sm:block text-slate-600 text-xs truncate">
                Đã tạo • {dayjs(folder.createdAt).format('D [thg] M')}
              </div>

              <div className="w-44 hidden md:flex items-center gap-2 text-slate-700 truncate">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border text-[10px] flex items-center justify-center shrink-0 uppercase font-semibold',
                    isOwner ? 'bg-slate-700 text-white border-slate-700 font-bold' : getAvatarStyle(ownerName),
                  )}
                >
                  {ownerName.charAt(0)}
                </div>
                <span className="truncate text-xs font-normal">{ownerName}</span>
              </div>

              <div className="w-48 hidden lg:flex items-center gap-2 text-slate-700 truncate">
                <Folder size={15} className="text-slate-700 fill-slate-700 shrink-0" />
                <span className="truncate text-xs text-slate-700" title={parentName}>
                  {parentName}
                </span>
              </div>

              <div className="w-20 flex items-center justify-end shrink-0">
                <ExplorerActionDropdown
                  items={menuItems}
                  isOpen={isMenuOpen}
                  onToggle={() => setOpenMenuFolderId((prev) => (prev === folder.id ? null : folder.id))}
                  onClose={() => setOpenMenuFolderId(null)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
