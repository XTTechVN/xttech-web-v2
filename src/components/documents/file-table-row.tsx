'use client';

import React, { useMemo } from 'react';
import { Download, Eye, Folder, Users } from 'lucide-react';
import { DOCUMENT_TYPE_MAP, type AuthUser, type DocumentItem, type User } from '@/types';
import {
  DriveFileIcon, formatBytes, getDocumentPermissions,
  getFileUrl, getAvatarStyle, cn,
} from '@/utils';
import dayjs from 'dayjs';
import { ExplorerActionDropdown } from './explorer-action-dropdown';
import { buildDocDropdownItems } from './explorer-menu-builder';

export interface FileTableRowProps {
  doc: DocumentItem;
  user: AuthUser | User | null | undefined;
  canManage: boolean;
  currentFolderName?: string;
  isSharedSection?: boolean;
  currentFolderId?: number | null;
  currentFolderPermission?: 'view' | 'edit' | string;
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
  doc, user, canManage, currentFolderName, isSharedSection, currentFolderId,
  currentFolderPermission, myCategoryIds, isSelected, isCut, isMenuOpen,
  canEdit = true, canDelete = true, onToggleSelect, onSelectItem, onContextMenuItem,
  onView, onPreview, onEdit, onShare, onMove, onCopy, onCut, onDelete,
  onSaveToFolder, onRemoveFromFolder, onNavigateFolder, onToggleMenu, onCloseMenu, onStartDrag,
}) => {
  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const docPerms = getDocumentPermissions(doc, user, {
    isSharedSection: isSharedSection || currentFolderName?.includes('Được chia sẻ'),
    folderPermission: doc.category?.permission || currentFolderPermission,
    canManageDocuments: canManage,
    myCategoryIds,
    currentFolderId,
  });
  const isOwner = docPerms.isOwner;
  const ownerName = isOwner ? 'Tôi' : doc.createdBy?.fullName || doc.createdBy?.email || 'Thành viên';
  const folderName = doc.category?.name || currentFolderName || 'Drive của tôi';
  const canMoveDoc = canEdit && docPerms.canMove;
  const typeMeta = DOCUMENT_TYPE_MAP[doc.documentType] || { label: doc.documentType || 'Tài liệu', color: 'default' };
  const versionText = currentVersion?.versionNumber ? `v${currentVersion.versionNumber}` : 'v1.0';
  const sizeText = currentVersion?.fileSize ? formatBytes(currentVersion.fileSize) : '—';
  const downloadUrl = currentVersion?.downloadUrl || (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const openDocumentPrimary = () => {
    if (onPreview) onPreview(doc);
    else if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    else onView(doc);
  };

  const menuItems = useMemo(() => {
    if (!isMenuOpen) return [];
    return buildDocDropdownItems({
      doc, downloadUrl, perms: docPerms, canEditProp: canEdit, canDeleteProp: canDelete,
      onOpenPrimary: openDocumentPrimary, onView, onCopy, onCut, onSaveToFolder,
      onEdit, onShare, onMove, onRemoveFromFolder, onDelete,
    });
  }, [
    isMenuOpen, doc, downloadUrl, docPerms, canEdit, canDelete,
    onView, onCopy, onCut, onSaveToFolder, onEdit, onShare, onMove, onRemoveFromFolder, onDelete,
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
        'group relative flex items-center justify-between py-2.5 px-3.5 border-b border-slate-100 hover:bg-slate-50/90 cursor-pointer text-xs text-slate-800 transition-colors',
        isSelected && 'bg-primary/10 text-primary font-medium',
        isCut && 'opacity-55 border-dashed',
        isMenuOpen && 'z-40 bg-slate-50',
      )}
    >
      {/* 1. Tên & Mã tài liệu */}
      <div className="flex items-center gap-3 flex-1 min-w-[240px] pr-3">
        <DriveFileIcon filename={fileName} mimeType={currentVersion?.mimeType} size={18} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-slate-900 group-hover:text-primary truncate text-sm">
              {doc.title}
            </span>
            {doc.isRead === false && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 shrink-0">
                Mới
              </span>
            )}
            {docPerms.isShared && (
              <span title="Đã chia sẻ" className="shrink-0 flex items-center">
                <Users size={13} className="text-slate-400" />
              </span>
            )}
          </div>
          {doc.code && (
            <span className="font-mono text-[11px] text-slate-500 tabular-nums">{doc.code}</span>
          )}
        </div>
      </div>

      {/* 2. Phân loại */}
      <div className="w-36 hidden md:flex items-center pr-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70 truncate">
          {typeMeta.label}
        </span>
      </div>

      {/* 3. Phiên bản & Dung lượng */}
      <div className="w-36 hidden sm:flex items-center font-mono tabular-nums text-xs text-slate-600 pr-2">
        <span className="font-semibold text-slate-700">{versionText}</span>
        <span className="mx-1.5 text-slate-300">•</span>
        <span>{sizeText}</span>
      </div>

      {/* 4. Người tạo */}
      <div className="w-40 hidden lg:flex items-center gap-2 text-slate-700 truncate pr-2">
        <div
          className={cn(
            'w-5 h-5 rounded-full border text-[10px] flex items-center justify-center shrink-0 uppercase font-semibold',
            isOwner ? 'bg-slate-700 text-white border-slate-700 font-bold' : getAvatarStyle(ownerName),
          )}
        >
          {ownerName.charAt(0)}
        </div>
        <span className="truncate text-xs">{ownerName}</span>
      </div>

      {/* 5. Cập nhật */}
      <div className="w-28 hidden xl:block font-mono tabular-nums text-xs text-slate-600 pr-2">
        {dayjs(doc.updatedAt || doc.createdAt).format('DD/MM/YYYY')}
      </div>

      {/* 6. Vị trí */}
      <div className="w-40 hidden lg:flex items-center gap-1.5 text-slate-700 truncate pr-2">
        <Folder size={14} className="text-slate-500 shrink-0" />
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

      {/* 7. Thao tác */}
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
    prev.doc.code === next.doc.code &&
    prev.doc.documentType === next.doc.documentType &&
    prev.doc.isRead === next.doc.isRead &&
    prev.doc.updatedAt === next.doc.updatedAt &&
    prev.doc.currentVersion?.id === next.doc.currentVersion?.id &&
    prev.currentFolderName === next.currentFolderName
  );
}

export const FileTableRow = React.memo<FileTableRowProps>(
  FileTableRowComponent,
  areFileTableRowPropsEqual,
);
FileTableRow.displayName = 'FileTableRow';
