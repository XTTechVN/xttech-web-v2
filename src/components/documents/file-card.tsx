'use client';

import React, { useState, useMemo } from 'react';
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
  currentFolderPermission?: 'view' | 'edit' | string;
  myCategoryIds?: Set<number>;
  isSelected?: boolean;
  isCut?: boolean;
  onToggleSelect?: (document: DocumentItem) => void;
  onSelectItem?: (e: React.MouseEvent | React.PointerEvent, document: DocumentItem) => void;
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
  onStartDrag?: (e: React.PointerEvent, item: { type: 'document'; id: number; title: string; canMove: boolean }) => void;
}

const FileCardComponent: React.FC<FileCardProps> = ({
  document: doc,
  locationName,
  isSharedSection,
  currentFolderId,
  currentFolderPermission,
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
  onStartDrag,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { isAdmin, isHR } = usePermission();
  const canManage = isAdmin || isHR;

  const docPerms = getDocumentPermissions(doc, user, {
    isSharedSection: isSharedSection || locationName?.includes('Được chia sẻ'),
    folderPermission: (doc.category as any)?.permission || currentFolderPermission,
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

  const subText = locationName
    ? `trong ${locationName}`
    : `${docTypeInfo.label}${currentVersion?.fileSize ? ` • ${formatBytes(currentVersion.fileSize)}` : ''} • ${statusInfo.label}`;

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
        setIsMenuOpen(false);
        onContextMenuItem(e, doc);
      }}
      className={cn(
        'group relative flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer select-none',
        isSelected
          ? 'bg-primary/15 border-primary shadow-xs ring-2 ring-primary/60 text-primary'
          : 'bg-[#f0f4f9] hover:bg-[#e4ebf5] border border-transparent hover:border-slate-200/60 shadow-2xs hover:shadow-xs',
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
          <span className="truncate text-sm font-medium text-slate-800 group-hover:text-primary leading-tight">
            {doc.title}
          </span>
          <span className="text-[11px] text-slate-500 truncate mt-0.5">{subText}</span>
        </div>
      </div>

      <div data-no-select="true" onClick={(e) => e.stopPropagation()}>
        <ExplorerActionDropdown
          items={menuItems}
          isOpen={isMenuOpen}
          onToggle={() => setIsMenuOpen((prev) => !prev)}
          onClose={() => setIsMenuOpen(false)}
        />
      </div>
    </div>
  );
};

function areFileCardPropsEqual(prev: FileCardProps, next: FileCardProps): boolean {
  return (
    prev.document.id === next.document.id &&
    prev.isSelected === next.isSelected &&
    prev.isCut === next.isCut &&
    prev.locationName === next.locationName &&
    prev.document.title === next.document.title &&
    prev.document.updatedAt === next.document.updatedAt &&
    prev.document.currentVersion?.id === next.document.currentVersion?.id &&
    prev.isSharedSection === next.isSharedSection
  );
}

export const FileCard = React.memo<FileCardProps>(FileCardComponent, areFileCardPropsEqual);
FileCard.displayName = 'FileCard';
