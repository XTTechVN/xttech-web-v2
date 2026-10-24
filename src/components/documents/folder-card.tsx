'use client';

import React, { useState } from 'react';
import { Folder, FolderOpen, User } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { usePermission } from '@/hooks';
import { useAuthStore } from '@/stores';
import { cn } from '@/utils';
import { ExplorerActionDropdown } from './explorer-action-dropdown';
import { buildFolderDropdownItems } from './explorer-menu-builder';

interface FolderCardProps {
  folder: DocumentCategory;
  locationName?: string;
  isSharedSection?: boolean;
  isActive?: boolean;
  isSelected?: boolean;
  isCut?: boolean;
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

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  locationName,
  isSharedSection = false,
  isActive = false,
  isSelected = false,
  isCut = false,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { isAdmin, isHR } = usePermission();
  const canManage = isAdmin || isHR;

  const isActualOwner =
    Boolean(
      !isSharedSection &&
        (folder.isOwner ??
          (folder.createdById && user?.id ? String(folder.createdById) === String(user.id) : true)),
    ) || Boolean(folder.createdById && user?.id && String(folder.createdById) === String(user.id));

  const isShared = Boolean(
    isSharedSection ||
      folder.isShared ||
      (folder.sharedWithCount && folder.sharedWithCount > 0) ||
      folder.isOwner === false ||
      folder.permission !== undefined,
  );

  const isOwnerOrAdmin = isActualOwner || canManage;
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
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (!onDropItem) return;
        e.preventDefault();
        setIsDragOver(false);
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
        setIsMenuOpen(false);
        onContextMenuItem(e, folder);
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
        isCut && 'opacity-55 border-dashed border-amber-500/70',
        isMenuOpen ? 'z-40 bg-[#e4ebf5] border-slate-200/80 shadow-xs' : 'active:scale-[0.99]',
      )}
      title={`${folder.name} (Nhấp đúp để mở)`}
    >
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

      <ExplorerActionDropdown
        items={menuItems}
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen((prev) => !prev)}
        onClose={() => setIsMenuOpen(false)}
      />
    </div>
  );
};
