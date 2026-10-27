'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Folder, FolderOpen, Users } from 'lucide-react';
import type { DocumentCategory } from '@/types';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks';
import { cn, getAvatarStyle } from '@/utils';
import dayjs from 'dayjs';
import { ExplorerActionDropdown } from './explorer-action-dropdown';
import { buildFolderDropdownItems } from './explorer-menu-builder';

interface FolderTableRowProps {
  folder: DocumentCategory;
  user: any;
  canManage: boolean;
  locationName?: string;
  isSharedSection?: boolean;
  isActive: boolean;
  isSelected: boolean;
  isCut: boolean;
  hasClipboard?: boolean;
  isMenuOpen: boolean;
  dragOverFolderId: number | null;
  onToggleSelect?: (folder: DocumentCategory) => void;
  onSelectItem?: (e: React.MouseEvent | React.PointerEvent, folder: DocumentCategory) => void;
  onContextMenuItem?: (e: React.MouseEvent, folder: DocumentCategory) => void;
  onOpen: (folder: DocumentCategory) => void;
  onViewDetail?: (folder: DocumentCategory) => void;
  onDownload?: (folder: DocumentCategory) => void;
  onEdit?: (folder: DocumentCategory) => void;
  onMove?: (folder: DocumentCategory) => void;
  onCut?: (folder: DocumentCategory) => void;
  onPasteIntoFolder?: (folder: DocumentCategory) => void;
  onDropItem?: (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => void;
  onDelete?: (folder: DocumentCategory) => void;
  onShare?: (folder: DocumentCategory) => void;
  onDragOver: (folderId: number) => void;
  onDragLeave: () => void;
  onToggleMenu: (folderId: number) => void;
  onCloseMenu: () => void;
  onStartDrag?: (e: React.PointerEvent, item: { type: 'folder'; id: number; title: string; canMove: boolean }) => void;
}

const FolderTableRowComponent: React.FC<FolderTableRowProps> = ({
  folder,
  user,
  canManage,
  locationName,
  isSharedSection = false,
  isActive,
  isSelected,
  isCut,
  hasClipboard = false,
  isMenuOpen,
  dragOverFolderId,
  onToggleSelect,
  onSelectItem,
  onContextMenuItem,
  onOpen,
  onViewDetail,
  onDownload,
  onEdit,
  onMove,
  onCut,
  onPasteIntoFolder,
  onDropItem,
  onDelete,
  onShare,
  onDragOver,
  onDragLeave,
  onToggleMenu,
  onCloseMenu,
  onStartDrag,
}) => {
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
  const canEditFolder = isOwnerOrAdmin || folder.permission === 'edit';
  const canMoveFolder = isOwnerOrAdmin || folder.permission === 'edit';
  const parentName = locationName || 'Drive của tôi';

  const menuItems = useMemo(() => {
    if (!isMenuOpen) return [];
    return buildFolderDropdownItems({
      folder,
      canEdit: canEditFolder,
      canMove: canMoveFolder,
      canShare: Boolean(onShare && isOwnerOrAdmin),
      canDelete: isOwnerOrAdmin,
      canPaste: Boolean(hasClipboard && canEditFolder),
      onOpen,
      onViewDetail,
      onDownload,
      onPasteIntoFolder,
      onShare,
      onEdit,
      onCut,
      onMove,
      onDelete,
    });
  }, [
    isMenuOpen,
    folder,
    canEditFolder,
    canMoveFolder,
    isOwnerOrAdmin,
    hasClipboard,
    onOpen,
    onViewDetail,
    onDownload,
    onPasteIntoFolder,
    onShare,
    onEdit,
    onCut,
    onMove,
    onDelete,
  ]);

  return (
    <div
      data-explorer-item="true"
      data-folder-id={folder.id}
      onPointerDown={(e) => {
        if (e.button === 0 && !(e.target as HTMLElement).closest('[data-no-select="true"]')) {
          e.stopPropagation();
          onSelectItem?.(e, folder);
          onStartDrag?.(e, { type: 'folder', id: folder.id, title: folder.name, canMove: canMoveFolder });
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if ((e.target as HTMLElement).closest('[data-no-select="true"]')) return;
        if (!onSelectItem) {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onToggleSelect?.(folder);
            return;
          }
          onOpen(folder);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen(folder);
      }}
      onContextMenu={(e) => {
        if (!onContextMenuItem) return;
        e.preventDefault();
        e.stopPropagation();
        onCloseMenu();
        onContextMenuItem(e, folder);
      }}
      className={cn(
        'group relative flex items-center justify-between py-3 px-3.5 border-b border-gray-100 cursor-pointer text-xs text-slate-800',
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
              'truncate text-sm',
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

      <div className="w-20 flex items-center justify-end shrink-0" data-no-select="true">
        <ExplorerActionDropdown
          items={menuItems}
          isOpen={isMenuOpen}
          onToggle={() => onToggleMenu(folder.id)}
          onClose={onCloseMenu}
        />
      </div>
    </div>
  );
};

function areFolderTableRowPropsEqual(prev: FolderTableRowProps, next: FolderTableRowProps) {
  if (prev.folder.id !== next.folder.id) return false;
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.isCut !== next.isCut) return false;
  if (prev.isActive !== next.isActive) return false;
  if (prev.isMenuOpen !== next.isMenuOpen) return false;
  if (prev.dragOverFolderId === prev.folder.id || next.dragOverFolderId === next.folder.id) {
    if (prev.dragOverFolderId !== next.dragOverFolderId) return false;
  }
  if (prev.hasClipboard !== next.hasClipboard) return false;
  if (prev.folder.name !== next.folder.name) return false;
  if (prev.folder.updatedAt !== next.folder.updatedAt) return false;
  if (prev.isSharedSection !== next.isSharedSection) return false;
  if (prev.locationName !== next.locationName) return false;
  return true;
}

const FolderTableRow = React.memo<FolderTableRowProps>(FolderTableRowComponent, areFolderTableRowPropsEqual);
FolderTableRow.displayName = 'FolderTableRow';

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
  onSelectItem?: (e: React.MouseEvent | React.PointerEvent, folder: DocumentCategory) => void;
  onContextMenuItem?: (e: React.MouseEvent, folder: DocumentCategory) => void;
  onOpen: (folder: DocumentCategory) => void;
  onViewDetail?: (folder: DocumentCategory) => void;
  onDownload?: (folder: DocumentCategory) => void;
  onEdit?: (folder: DocumentCategory) => void;
  onMove?: (folder: DocumentCategory) => void;
  onCut?: (folder: DocumentCategory) => void;
  onPasteIntoFolder?: (folder: DocumentCategory) => void;
  onDropItem?: (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => void;
  onDelete?: (folder: DocumentCategory) => void;
  onShare?: (folder: DocumentCategory) => void;
  hoverFolderId?: number | null;
  onStartDrag?: (e: React.PointerEvent, item: { type: 'folder'; id: number; title: string; canMove: boolean }) => void;
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
  hoverFolderId,
  onToggleSelect,
  onSelectItem,
  onContextMenuItem,
  onOpen,
  onViewDetail,
  onDownload,
  onEdit,
  onMove,
  onCut,
  onPasteIntoFolder,
  onDropItem,
  onDelete,
  onShare,
  onStartDrag,
}) => {
  const { user } = useAuthStore();
  const { isAdmin, isHR } = usePermission();
  const canManage = isAdmin || isHR;

  const [openMenuFolderId, setOpenMenuFolderId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);

  const handleDragOver = useCallback((folderId: number) => {
    setDragOverFolderId(folderId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverFolderId(null);
  }, []);

  const handleToggleMenu = useCallback((folderId: number) => {
    setOpenMenuFolderId((prev) => (prev === folderId ? null : folderId));
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMenuFolderId(null);
  }, []);

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
          const key = `folder-${folder.id}`;
          return (
            <FolderTableRow
              key={folder.id}
              folder={folder}
              user={user}
              canManage={canManage}
              locationName={locationName}
              isSharedSection={isSharedSection}
              isActive={activeFolderId === folder.id}
              isSelected={selectedKeys?.has(key) ?? false}
              isCut={cutKeys?.has(key) ?? false}
              hasClipboard={hasClipboard}
              isMenuOpen={openMenuFolderId === folder.id}
              dragOverFolderId={hoverFolderId !== undefined ? hoverFolderId : dragOverFolderId}
              onToggleSelect={onToggleSelect}
              onSelectItem={onSelectItem}
              onContextMenuItem={onContextMenuItem}
              onOpen={onOpen}
              onViewDetail={onViewDetail}
              onDownload={onDownload}
              onEdit={onEdit}
              onMove={onMove}
              onCut={onCut}
              onPasteIntoFolder={onPasteIntoFolder}
              onDropItem={onDropItem}
              onDelete={onDelete}
              onShare={onShare}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onToggleMenu={handleToggleMenu}
              onCloseMenu={handleCloseMenu}
              onStartDrag={onStartDrag}
            />
          );
        })}
      </div>
    </div>
  );
};
