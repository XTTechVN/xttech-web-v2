'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP } from '@/types';
import {
  formatBytes,
  getFileVisualInfo,
  getDocumentPermissions,
  getFileUrl,
  cn,
} from '@/utils';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks';
import { ExplorerActionDropdown } from './explorer-action-dropdown';
import { buildDocDropdownItems } from './explorer-menu-builder';

interface FileCardProps {
  document: DocumentItem;
  locationName?: string;
  isSharedSection?: boolean;
  currentFolderId?: number | null;
  myCategoryIds?: Set<number>;
  isSelected?: boolean;
  isCut?: boolean;
  onToggleSelect?: (document: DocumentItem) => void;
  onSelectItem?: (e: React.MouseEvent, document: DocumentItem) => void;
  onContextMenuItem?: (e: React.MouseEvent, document: DocumentItem) => void;
  onPreview?: (document: DocumentItem) => void;
  onView: (document: DocumentItem) => void;
  onEdit?: (document: DocumentItem) => void;
  onShare?: (document: DocumentItem) => void;
  onMove?: (document: DocumentItem) => void;
  onCopy?: (document: DocumentItem) => void;
  onCut?: (document: DocumentItem) => void;
  onDelete?: (document: DocumentItem) => void;
  onSaveToFolder?: (document: DocumentItem) => void;
  onRemoveFromFolder?: (document: DocumentItem) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  document: doc,
  locationName,
  isSharedSection,
  currentFolderId,
  myCategoryIds,
  isSelected = false,
  isCut = false,
  onToggleSelect,
  onSelectItem,
  onContextMenuItem,
  onPreview,
  onView,
  onEdit,
  onShare,
  onMove,
  onCopy,
  onCut,
  onDelete,
  onSaveToFolder,
  onRemoveFromFolder,
  canEdit = true,
  canDelete = true,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { isAdmin, isHR } = usePermission();
  const canManage = isAdmin || isHR;

  const docPerms = getDocumentPermissions(doc, user, {
    isSharedSection: isSharedSection || locationName?.includes('Được chia sẻ'),
    folderPermission: (doc.category as any)?.permission,
    canManageDocuments: canManage,
    myCategoryIds,
    currentFolderId,
  });

  const canMoveDoc = canEdit && docPerms.canMove;
  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const visualInfo = getFileVisualInfo(fileName, currentVersion?.mimeType);
  const docTypeInfo = DOCUMENT_TYPE_MAP[doc.documentType] || { label: doc.documentType || 'Văn bản' };
  const statusInfo = DOCUMENT_STATUS_MAP[doc.status] || { label: doc.status || 'Bản nháp' };

  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const openDocumentPrimary = () => {
    if (onPreview) onPreview(doc);
    else if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    else onView(doc);
  };

  const menuItems = buildDocDropdownItems({
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

  const subText = locationName
    ? `trong ${locationName}`
    : `${docTypeInfo.label}${currentVersion?.fileSize ? ` • ${formatBytes(currentVersion.fileSize)}` : ''} • ${statusInfo.label}`;

  return (
    <div
      draggable={canMoveDoc}
      onDragStart={(e) => {
        if (!canMoveDoc) return void e.preventDefault();
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'document', id: doc.id }));
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={(e) => {
        if (onSelectItem) return void onSelectItem(e, doc);
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
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
        setIsMenuOpen(false);
        onContextMenuItem(e, doc);
      }}
      className={cn(
        'group relative flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer select-none',
        isSelected
          ? 'bg-primary/15 border-primary shadow-xs ring-2 ring-primary/60 text-primary transition-none'
          : 'bg-[#f0f4f9] hover:bg-[#e4ebf5] border border-transparent hover:border-slate-200/60 shadow-2xs hover:shadow-xs transition-colors duration-100',
        isCut && 'opacity-55 border-dashed border-amber-500/70',
        isMenuOpen ? 'z-40 bg-[#e4ebf5] border-slate-200/80 shadow-xs' : 'active:scale-[0.99]',
      )}
      title={`${doc.title} (${doc.code}) - Nhấp đúp để xem trước`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0 flex items-center justify-center">
          {visualInfo.icon}
          {docPerms.isShared && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs">
              <Users size={10} className="text-primary fill-primary" />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="truncate text-sm font-medium text-slate-800 group-hover:text-primary transition-colors leading-tight">
            {doc.title}
          </span>
          <span className="text-[11px] text-slate-500 truncate mt-0.5">{subText}</span>
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
