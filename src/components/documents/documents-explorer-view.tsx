'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import type { DocumentCategory, DocumentItem } from '@/types';
import type { DocumentExplorerHook } from '@/hooks/use-document-explorer';
import { FolderCard } from './folder-card';
import { FolderTable } from './folder-table';
import { FileCard } from './file-card';
import { FileTable } from './file-table';
import { ExplorerContextMenu } from './explorer-context-menu';
import { resolveExplorerContextMenu } from './explorer-menu-builder';
import { ExplorerDragBadge } from './explorer-drag-badge';
import { UploadProgressDrawer } from './upload-progress-drawer';
import { Folder, UploadCloud } from 'lucide-react';
import { hasFileTransfer } from '@/utils';
import { useExplorerPointerDrag } from '@/hooks';
import toast from 'react-hot-toast';

interface DocumentsExplorerViewProps {
  explorer: DocumentExplorerHook;
  tab?: string | null;
}

export const DocumentsExplorerView: React.FC<DocumentsExplorerViewProps> = ({
  explorer,
  tab: tabOverride,
}) => {
  const {
    viewMode,
    isLoadingDocuments,
    isLoadingCategories,
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    tab: explorerTab,
    foldersToDisplay,
    displayedDocuments: documents,
    allMyCategoryIds,
    isSharedSection,
    canEditCurrentFolder: canEditFolder,
    canCreate,
    currentUser,
    canManageDocuments,
    selectedItemKeys,
    cutKeySet,
    clipboard,
    contextMenu,
    closeContextMenu,
    toggleSelectItem,
    handleSelectItem,
    clearSelection,
    selectAll,
    orderedKeys,
    handleContextMenuFolder,
    handleContextMenuDoc,
    handleContextMenuBackground,
    isFolderOwnerOrAdmin,
    handleCopySelected,
    handleCutSelected,
    handleCopySingleDoc,
    handleCutSingleDoc,
    handleCutSingleFolder,
    handlePasteToCurrentFolder,
    handlePasteIntoFolder,
    handleDownloadFolder,
    triggerFilesUpload,
    triggerFolderUpload,
    fileInputRef,
    folderInputRef,
    handleFilesChange,
    handleFolderChange,
    handleDroppedDataTransfer,
    handleOpenMoveSelected,
    handleOpenDeleteSelected,
    handleDropItem,
    handleRemoveFromFolder,
    modals,
    uploadQueue,
    isDrawerOpen,
    closeDrawer,
    retryItem,
    cancelItem,
  } = explorer;

  const tab = tabOverride ?? explorerTab;
  const hasClipboard = Boolean(clipboard && clipboard.items.length > 0);
  const isEmptyState =
    foldersToDisplay.length === 0 && documents.length === 0 && !isLoadingCategories && !isLoadingDocuments;

  const locationName = currentFolder
    ? currentFolder.name
    : isSharedSection
      ? 'Được chia sẻ với tôi'
      : tab === 'trash'
        ? 'Thùng rác'
        : 'Tài liệu của tôi';

  const { menuTitle, menuItems } = useMemo(
    () =>
      resolveExplorerContextMenu({
        contextMenu,
        locationName,
        canCreate,
        hasClipboard,
        totalItems: foldersToDisplay.length + documents.length,
        selectedCount: selectedItemKeys.size,
        currentUser,
        isSharedSection,
        canManageDocuments,
        allMyCategoryIds,
        currentFolderId,
        modals,
        isFolderOwnerOrAdmin,
        onNavigateFolder: setCurrentFolderId,
        onPasteToCurrentFolder: handlePasteToCurrentFolder,
        onPasteIntoFolder: handlePasteIntoFolder,
        onDownloadFolder: handleDownloadFolder,
        onUploadFiles: triggerFilesUpload,
        onUploadFolder: triggerFolderUpload,
        onSelectAll: () => selectAll(orderedKeys),
        onMoveSelected: handleOpenMoveSelected,
        onCutSelected: handleCutSelected,
        onCopySelected: handleCopySelected,
        onDeleteSelected: handleOpenDeleteSelected,
        onClearSelection: clearSelection,
        onCopySingleDoc: handleCopySingleDoc,
        onCutSingleDoc: handleCutSingleDoc,
        onCutSingleFolder: handleCutSingleFolder,
        onRemoveFromFolder: handleRemoveFromFolder,
      }),
    [
      contextMenu,
      locationName,
      canCreate,
      hasClipboard,
      foldersToDisplay.length,
      documents.length,
      selectedItemKeys.size,
      currentUser,
      isSharedSection,
      canManageDocuments,
      allMyCategoryIds,
      currentFolderId,
      modals,
      isFolderOwnerOrAdmin,
      setCurrentFolderId,
      handlePasteToCurrentFolder,
      handlePasteIntoFolder,
      handleDownloadFolder,
      triggerFilesUpload,
      triggerFolderUpload,
      selectAll,
      orderedKeys,
      handleOpenMoveSelected,
      handleCutSelected,
      handleCopySelected,
      handleOpenDeleteSelected,
      clearSelection,
      handleCopySingleDoc,
      handleCutSingleDoc,
      handleCutSingleFolder,
      handleRemoveFromFolder,
    ],
  );

  const { dragState, startDragTracking, badgeRef } = useExplorerPointerDrag({
    selectedItemKeys,
    onDropItem: canEditFolder ? handleDropItem : undefined,
  });

  const commonFolderProps = useMemo(
    () => ({
      isSharedSection,
      cutKeys: cutKeySet,
      hasClipboard,
      onContextMenuItem: handleContextMenuFolder,
      locationName,
      onOpen: (f: DocumentCategory) => setCurrentFolderId(f.id),
      onViewDetail: modals.actions.openDetailFolder,
      onDownload: handleDownloadFolder,
      onEdit: modals.actions.openEditFolder,
      onShare: modals.actions.openShareFolder,
      onMove: modals.actions.openMoveFolder,
      onCut: handleCutSingleFolder,
      onPasteIntoFolder: handlePasteIntoFolder,
      onDropItem: canEditFolder ? handleDropItem : undefined,
      onDelete: (f: DocumentCategory) => modals.actions.openDeleteFolder(f.id, f.name),
      onStartDrag: startDragTracking,
    }),
    [
      isSharedSection,
      cutKeySet,
      hasClipboard,
      handleContextMenuFolder,
      locationName,
      setCurrentFolderId,
      modals.actions.openDetailFolder,
      handleDownloadFolder,
      modals.actions.openEditFolder,
      modals.actions.openShareFolder,
      modals.actions.openMoveFolder,
      handleCutSingleFolder,
      handlePasteIntoFolder,
      canEditFolder,
      handleDropItem,
      modals.actions.openDeleteFolder,
      startDragTracking,
    ],
  );

  const commonDocProps = useMemo(
    () => ({
      isSharedSection,
      currentFolderId,
      myCategoryIds: allMyCategoryIds,
      onContextMenuItem: handleContextMenuDoc,
      onPreview: modals.actions.openPreviewDoc,
      onView: modals.actions.openDetailDoc,
      onEdit: modals.actions.openEditDoc,
      onShare: modals.actions.openShareDoc,
      onMove: modals.actions.openMoveDoc,
      onCopy: handleCopySingleDoc,
      onCut: handleCutSingleDoc,
      onSaveToFolder: modals.actions.openSaveToFolder,
      onRemoveFromFolder: handleRemoveFromFolder,
      onDelete: (d: DocumentItem) => modals.actions.openDeleteDoc(d.id, d.title),
      onStartDrag: startDragTracking,
    }),
    [
      isSharedSection,
      currentFolderId,
      allMyCategoryIds,
      handleContextMenuDoc,
      modals.actions.openPreviewDoc,
      modals.actions.openDetailDoc,
      modals.actions.openEditDoc,
      modals.actions.openShareDoc,
      modals.actions.openMoveDoc,
      handleCopySingleDoc,
      handleCutSingleDoc,
      modals.actions.openSaveToFolder,
      handleRemoveFromFolder,
      modals.actions.openDeleteDoc,
      startDragTracking,
    ],
  );

  const handleSelectFolder = useCallback(
    (e: React.MouseEvent | React.PointerEvent, f: DocumentCategory) => handleSelectItem(e, 'folder', f.id),
    [handleSelectItem],
  );

  const handleSelectDoc = useCallback(
    (e: React.MouseEvent | React.PointerEvent, d: DocumentItem) => handleSelectItem(e, 'document', d.id),
    [handleSelectItem],
  );

  const handleToggleFolder = useCallback(
    (f: DocumentCategory) => toggleSelectItem('folder', f.id),
    [toggleSelectItem],
  );

  const handleToggleDoc = useCallback(
    (d: DocumentItem) => toggleSelectItem('document', d.id),
    [toggleSelectItem],
  );

  const [isDragOverFiles, setIsDragOverFiles] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (!hasFileTransfer(e.dataTransfer)) return;
    e.preventDefault();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragOverFiles(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!hasFileTransfer(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!hasFileTransfer(e.dataTransfer)) return;
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOverFiles(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!hasFileTransfer(e.dataTransfer)) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOverFiles(false);

      if (!canCreate && !canEditFolder) {
        toast.error('Bạn không có quyền tải tệp vào thư mục này');
        return;
      }

      if (handleDroppedDataTransfer) {
        void handleDroppedDataTransfer(e.dataTransfer);
      }
    },
    [canCreate, canEditFolder, handleDroppedDataTransfer],
  );

  return (
    <div
      onClick={(e) => {
        const target = e.target as HTMLElement | null;
        if (target && target.closest('[data-explorer-item="true"]')) return;
        closeContextMenu();
        if (selectedItemKeys.size > 0) clearSelection();
      }}
      onContextMenu={handleContextMenuBackground}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative min-h-[60vh] space-y-3"
    >
      {isDragOverFiles && (
        <div className="absolute inset-0 z-50 pointer-events-none rounded-2xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 transition-all animate-in fade-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary mb-3">
            <UploadCloud size={32} className="animate-bounce" />
          </div>
          <h3 className="text-base font-semibold text-primary">
            Thả tệp hoặc thư mục vào đây để tải lên
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {currentFolder ? `Tải vào thư mục "${currentFolder.name}"` : 'Tải vào Drive của tôi'} • Tự động giữ nguyên cấu trúc thư mục con
          </p>
        </div>
      )}

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesChange} />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error webkitdirectory is standard in modern browsers for directory picker
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={handleFolderChange}
      />

      {isEmptyState ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl p-8 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Folder size={32} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {currentFolder ? `Thư mục "${currentFolder.name}" đang trống` : 'Chưa có thư mục hoặc tài liệu nào'}
          </h3>
        </div>
      ) : isLoadingDocuments ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-slate-200/60 animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {foldersToDisplay.map((folder) => (
            <FolderCard
              key={`folder-${folder.id}`}
              folder={folder}
              isSelected={selectedItemKeys.has(`folder-${folder.id}`)}
              isCut={cutKeySet?.has(`folder-${folder.id}`)}
              isDragTarget={dragState.hoverFolderId === folder.id}
              onToggleSelect={handleToggleFolder}
              onSelectItem={handleSelectFolder}
              {...commonFolderProps}
            />
          ))}
          {documents.map((doc) => (
            <FileCard
              key={`doc-${doc.id}`}
              document={doc}
              isSelected={selectedItemKeys.has(`doc-${doc.id}`)}
              isCut={cutKeySet?.has(`doc-${doc.id}`)}
              onToggleSelect={handleToggleDoc}
              onSelectItem={handleSelectDoc}
              locationName={currentFolder ? currentFolder.name : doc.category?.name || locationName}
              {...commonDocProps}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {foldersToDisplay.length > 0 && (
            <FolderTable
              folders={foldersToDisplay}
              selectedKeys={selectedItemKeys}
              hoverFolderId={dragState.hoverFolderId}
              onToggleSelect={handleToggleFolder}
              onSelectItem={handleSelectFolder}
              showHeader={true}
              {...commonFolderProps}
            />
          )}
          {documents.length > 0 && (
            <FileTable
              documents={documents}
              selectedKeys={selectedItemKeys}
              cutKeys={cutKeySet}
              onToggleSelect={handleToggleDoc}
              onSelectItem={handleSelectDoc}
              currentFolderName={locationName}
              showHeader={foldersToDisplay.length === 0}
              onNavigateFolder={setCurrentFolderId}
              {...commonDocProps}
            />
          )}
        </div>
      )}

      <ExplorerContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        title={menuTitle}
        items={menuItems}
        onClose={closeContextMenu}
      />

      <ExplorerDragBadge
        ref={badgeRef}
        isDragging={dragState.isDragging}
        count={dragState.count}
        title={dragState.title}
        type={dragState.sourceType}
      />

      <UploadProgressDrawer
        items={uploadQueue}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onRetryItem={retryItem}
        onCancelItem={cancelItem}
      />
    </div>
  );
};
