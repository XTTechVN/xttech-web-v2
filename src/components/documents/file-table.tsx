'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Download, Eye, Folder, Users } from 'lucide-react';
import type { DocumentItem } from '@/types';
import {
  DriveFileIcon,
  getDocumentPermissions,
  getFileUrl,
  getAvatarStyle,
  cn,
} from '@/utils';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks';
import dayjs from 'dayjs';
import { ExplorerActionDropdown } from './explorer-action-dropdown';
import { buildDocDropdownItems } from './explorer-menu-builder';

interface FileTableRowProps {
  doc: DocumentItem;
  user: any;
  canManage: boolean;
  currentFolderName?: string;
  isSharedSection?: boolean;
  currentFolderId?: number | null;
  myCategoryIds?: Set<number>;
  isSelected: boolean;
  isCut: boolean;
  isMenuOpen: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onToggleSelect?: (document: DocumentItem) => void;
  onSelectItem?: (e: React.MouseEvent | React.PointerEvent, document: DocumentItem) => void;
  onContextMenuItem?: (e: React.MouseEvent, document: DocumentItem) => void;
  onView: (document: DocumentItem) => void;
  onPreview?: (document: DocumentItem) => void;
  onEdit?: (document: DocumentItem) => void;
  onShare?: (document: DocumentItem) => void;
  onMove?: (document: DocumentItem) => void;
  onCopy?: (document: DocumentItem) => void;
  onCut?: (document: DocumentItem) => void;
  onDelete?: (document: DocumentItem) => void;
  onSaveToFolder?: (document: DocumentItem) => void;
  onRemoveFromFolder?: (document: DocumentItem) => void;
  onNavigateFolder?: (folderId: number | null) => void;
  onToggleMenu: (docId: number) => void;
  onCloseMenu: () => void;
  onStartDrag?: (e: React.PointerEvent, item: { type: 'document'; id: number; title: string; canMove: boolean }) => void;
}

const FileTableRowComponent: React.FC<FileTableRowProps> = ({
  doc,
  user,
  canManage,
  currentFolderName,
  isSharedSection,
  currentFolderId,
  myCategoryIds,
  isSelected,
  isCut,
  isMenuOpen,
  canEdit = true,
  canDelete = true,
  onToggleSelect,
  onSelectItem,
  onContextMenuItem,
  onView,
  onPreview,
  onEdit,
  onShare,
  onMove,
  onCopy,
  onCut,
  onDelete,
  onSaveToFolder,
  onRemoveFromFolder,
  onNavigateFolder,
  onToggleMenu,
  onCloseMenu,
  onStartDrag,
}) => {
  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const docPerms = getDocumentPermissions(doc, user, {
    isSharedSection: isSharedSection || currentFolderName?.includes('Được chia sẻ'),
    folderPermission: (doc.category as any)?.permission,
    canManageDocuments: canManage,
    myCategoryIds,
    currentFolderId,
  });
  const isOwner = docPerms.isOwner;
  const ownerName = isOwner ? 'tôi' : doc.createdBy?.fullName || doc.createdBy?.email || 'Thành viên';
  const folderName = doc.category?.name || currentFolderName || 'Drive của tôi';
  const canMoveDoc = canEdit && docPerms.canMove;

  const downloadUrl =
    currentVersion?.downloadUrl || (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const openDocumentPrimary = () => {
    if (onPreview) onPreview(doc);
    else if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    else onView(doc);
  };

  const menuItems = useMemo(() => {
    if (!isMenuOpen) return [];
    return buildDocDropdownItems({
      doc,
      downloadUrl,
      perms: docPerms,
      canEditProp: canEdit,
      canDeleteProp: canDelete,
      onOpenPrimary: openDocumentPrimary,
      onView,
      onCopy,
      onCut,
      onSaveToFolder,
      onEdit,
      onShare,
      onMove,
      onRemoveFromFolder,
      onDelete,
    });
  }, [
    isMenuOpen,
    doc,
    downloadUrl,
    docPerms,
    canEdit,
    canDelete,
    onView,
    onCopy,
    onCut,
    onSaveToFolder,
    onEdit,
    onShare,
    onMove,
    onRemoveFromFolder,
    onDelete,
  ]);

  return (
    <div
      data-explorer-item="true"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement | null;
        if (target && target.closest('button, [role="button"], [data-no-select="true"]')) return;
        e.stopPropagation();
        if (onSelectItem) {
          onSelectItem(e, doc);
        } else if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onToggleSelect?.(doc);
        }
        onStartDrag?.(e, { type: 'document', id: doc.id, title: doc.title, canMove: canMoveDoc });
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectItem) return;
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onToggleSelect?.(doc);
          return;
        }
        openDocumentPrimary();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        openDocumentPrimary();
      }}
      onContextMenu={(e) => {
        if (!onContextMenuItem) return;
        e.preventDefault();
        e.stopPropagation();
        onCloseMenu();
        onContextMenuItem(e, doc);
      }}
      className={cn(
        'group relative flex items-center justify-between py-3 px-3.5 border-b border-gray-100 hover:bg-[#f1f3f4] cursor-pointer text-xs text-slate-800',
        isSelected && 'bg-primary/10 text-primary font-medium',
        isCut && 'opacity-55 border-dashed',
        isMenuOpen && 'z-40 bg-[#f1f3f4]',
      )}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-[260px] pr-3">
        <DriveFileIcon filename={fileName} mimeType={currentVersion?.mimeType} size={18} />
        <span className="font-normal text-slate-900 group-hover:text-primary truncate text-sm">
          {doc.title}
        </span>
        {docPerms.isShared && (
          <span title="Đã chia sẻ" className="shrink-0 flex items-center">
            <Users size={14} className="text-slate-500" />
          </span>
        )}
      </div>

      <div className="w-56 hidden sm:block text-slate-600 text-xs truncate">
        Bạn đã mở • {dayjs(doc.updatedAt || doc.createdAt).format('D [thg] M')}
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (doc.categoryId && onNavigateFolder) onNavigateFolder(doc.categoryId);
          }}
          className="truncate text-xs text-slate-700 hover:text-primary hover:underline text-left cursor-pointer"
          title={folderName}
        >
          {folderName}
        </button>
      </div>

      <div className="w-20 flex items-center justify-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onView(doc)}
          className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Xem chi tiết tài liệu"
        >
          <Eye size={15} />
        </button>
        {downloadUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              window.open(downloadUrl, '_blank', 'noopener,noreferrer');
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Tải xuống tệp tin"
          >
            <Download size={15} />
          </button>
        )}
        <div data-no-select="true" onClick={(e) => e.stopPropagation()}>
          <ExplorerActionDropdown
            items={menuItems}
            isOpen={isMenuOpen}
            onToggle={() => onToggleMenu(doc.id)}
            onClose={onCloseMenu}
          />
        </div>
      </div>
    </div>
  );
};

function areFileTableRowPropsEqual(prev: FileTableRowProps, next: FileTableRowProps): boolean {
  return (
    prev.doc.id === next.doc.id &&
    prev.isSelected === next.isSelected &&
    prev.isCut === next.isCut &&
    prev.isMenuOpen === next.isMenuOpen &&
    prev.doc.title === next.doc.title &&
    prev.doc.updatedAt === next.doc.updatedAt &&
    prev.doc.currentVersion?.id === next.doc.currentVersion?.id &&
    prev.currentFolderName === next.currentFolderName
  );
}

const FileTableRow = React.memo<FileTableRowProps>(FileTableRowComponent, areFileTableRowPropsEqual);
FileTableRow.displayName = 'FileTableRow';

interface FileTableProps {
  documents: DocumentItem[];
  currentFolderName?: string;
  isSharedSection?: boolean;
  currentFolderId?: number | null;
  myCategoryIds?: Set<number>;
  selectedKeys?: Set<string>;
  cutKeys?: Set<string>;
  onToggleSelect?: (document: DocumentItem) => void;
  onSelectItem?: (e: React.MouseEvent | React.PointerEvent, document: DocumentItem) => void;
  onContextMenuItem?: (e: React.MouseEvent, document: DocumentItem) => void;
  onView: (document: DocumentItem) => void;
  onPreview?: (document: DocumentItem) => void;
  onEdit?: (document: DocumentItem) => void;
  onShare?: (document: DocumentItem) => void;
  onMove?: (document: DocumentItem) => void;
  onCopy?: (document: DocumentItem) => void;
  onCut?: (document: DocumentItem) => void;
  onDelete?: (document: DocumentItem) => void;
  onSaveToFolder?: (document: DocumentItem) => void;
  onRemoveFromFolder?: (document: DocumentItem) => void;
  onNavigateFolder?: (folderId: number | null) => void;
  showHeader?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onStartDrag?: (e: React.PointerEvent, item: { type: 'document'; id: number; title: string; canMove: boolean }) => void;
}

export const FileTable: React.FC<FileTableProps> = ({
  documents,
  currentFolderName,
  isSharedSection,
  currentFolderId,
  myCategoryIds,
  showHeader = true,
  selectedKeys,
  cutKeys,
  onToggleSelect,
  onSelectItem,
  onContextMenuItem,
  onView,
  onPreview,
  onEdit,
  onShare,
  onMove,
  onCopy,
  onCut,
  onDelete,
  onSaveToFolder,
  onRemoveFromFolder,
  onNavigateFolder,
  canEdit = true,
  canDelete = true,
  onStartDrag,
}) => {
  const { user } = useAuthStore();
  const { isAdmin, isHR } = usePermission();
  const canManage = isAdmin || isHR;
  const [openMenuDocId, setOpenMenuDocId] = useState<number | null>(null);

  const handleToggleMenu = useCallback((docId: number) => {
    setOpenMenuDocId((prev) => (prev === docId ? null : docId));
  }, []);

  const handleCloseMenu = useCallback(() => {
    setOpenMenuDocId(null);
  }, []);

  return (
    <div className="w-full bg-[#fafbfc] select-none">
      {showHeader && (
        <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-gray-200 text-xs font-medium text-slate-600">
          <div className="flex-1 min-w-[260px] pl-1">Tên</div>
          <div className="w-56 hidden sm:block">Lý do tài liệu được đề xuất</div>
          <div className="w-44 hidden md:block">Chủ sở hữu</div>
          <div className="w-48 hidden lg:block">Vị trí</div>
          <div className="w-20 text-right"></div>
        </div>
      )}

      <div>
        {documents.map((doc) => {
          const key = `doc-${doc.id}`;
          return (
            <FileTableRow
              key={doc.id}
              doc={doc}
              user={user}
              canManage={canManage}
              currentFolderName={currentFolderName}
              isSharedSection={isSharedSection}
              currentFolderId={currentFolderId}
              myCategoryIds={myCategoryIds}
              isSelected={selectedKeys?.has(key) ?? false}
              isCut={cutKeys?.has(key) ?? false}
              isMenuOpen={openMenuDocId === doc.id}
              canEdit={canEdit}
              canDelete={canDelete}
              onToggleSelect={onToggleSelect}
              onSelectItem={onSelectItem}
              onContextMenuItem={onContextMenuItem}
              onView={onView}
              onPreview={onPreview}
              onEdit={onEdit}
              onShare={onShare}
              onMove={onMove}
              onCopy={onCopy}
              onCut={onCut}
              onDelete={onDelete}
              onSaveToFolder={onSaveToFolder}
              onRemoveFromFolder={onRemoveFromFolder}
              onNavigateFolder={onNavigateFolder}
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
