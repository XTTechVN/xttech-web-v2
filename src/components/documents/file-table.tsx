'use client';

import React, { useState, useCallback } from 'react';
import type { DocumentItem } from '@/types';
import { useAuthStore } from '@/stores';
import { usePermission } from '@/hooks';
import { FileTableRow } from './file-table-row';

interface FileTableProps {
  documents: DocumentItem[];
  currentFolderName?: string;
  isSharedSection?: boolean;
  currentFolderId?: number | null;
  currentFolderPermission?: 'view' | 'edit' | string;
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
  onStartDrag?: (
    e: React.PointerEvent,
    item: { type: 'document'; id: number; title: string; canMove: boolean },
  ) => void;
}

export const FileTable: React.FC<FileTableProps> = ({
  documents,
  currentFolderName,
  isSharedSection,
  currentFolderId,
  currentFolderPermission,
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
        <div className="flex items-center justify-between py-2.5 px-3.5 border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <div className="flex-1 min-w-[240px] pl-1">Tên & Mã tài liệu</div>
          <div className="w-36 hidden md:block pr-2">Phân loại</div>
          <div className="w-36 hidden sm:block pr-2">Phiên bản / Dung lượng</div>
          <div className="w-40 hidden lg:block pr-2">Người tạo</div>
          <div className="w-28 hidden xl:block pr-2">Cập nhật</div>
          <div className="w-40 hidden lg:block pr-2">Vị trí</div>
          <div className="w-20 text-right">Thao tác</div>
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
              currentFolderPermission={currentFolderPermission}
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
