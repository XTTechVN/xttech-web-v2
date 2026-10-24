'use client';

import React, { useMemo } from 'react';
import type { DocumentCategory, DocumentItem } from '@/types';
import type { DocumentExplorerHook } from '@/hooks/use-document-explorer';
import { FolderCard } from './folder-card';
import { FolderTable } from './folder-table';
import { FileCard } from './file-card';
import { FileTable } from './file-table';
import { ExplorerContextMenu } from './explorer-context-menu';
import { resolveExplorerContextMenu } from './explorer-menu-builder';
import { Folder } from 'lucide-react';

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
    triggerFilesUpload,
    triggerFolderUpload,
    fileInputRef,
    folderInputRef,
    handleFilesChange,
    handleFolderChange,
    handleOpenMoveSelected,
    handleOpenDeleteSelected,
    handleDropItem,
    handleRemoveFromFolder,
    modals,
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

  const commonFolderProps = {
    isSharedSection,
    cutKeys: cutKeySet,
    hasClipboard,
    onContextMenuItem: handleContextMenuFolder,
    locationName,
    onOpen: (f: DocumentCategory) => setCurrentFolderId(f.id),
    onViewDetail: modals.actions.openDetailFolder,
    onEdit: modals.actions.openEditFolder,
    onShare: modals.actions.openShareFolder,
    onMove: modals.actions.openMoveFolder,
    onCut: handleCutSingleFolder,
    onPasteIntoFolder: handlePasteIntoFolder,
    onDropItem: canEditFolder ? handleDropItem : undefined,
    onDelete: (f: DocumentCategory) => modals.actions.openDeleteFolder(f.id, f.name),
  };

  const commonDocProps = {
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
  };

  return (
    <div
      onClick={() => {
        closeContextMenu();
        if (selectedItemKeys.size > 0) clearSelection();
      }}
      onContextMenu={handleContextMenuBackground}
      className="min-h-[60vh] space-y-3"
    >
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
              onToggleSelect={() => toggleSelectItem('folder', folder.id)}
              onSelectItem={(e, f) => handleSelectItem(e, 'folder', f.id)}
              {...commonFolderProps}
            />
          ))}
          {documents.map((doc) => (
            <FileCard
              key={`doc-${doc.id}`}
              document={doc}
              isSelected={selectedItemKeys.has(`doc-${doc.id}`)}
              isCut={cutKeySet?.has(`doc-${doc.id}`)}
              onToggleSelect={() => toggleSelectItem('document', doc.id)}
              onSelectItem={(e, d) => handleSelectItem(e, 'document', d.id)}
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
              onToggleSelect={(f) => toggleSelectItem('folder', f.id)}
              onSelectItem={(e, f) => handleSelectItem(e, 'folder', f.id)}
              showHeader={true}
              {...commonFolderProps}
            />
          )}
          {documents.length > 0 && (
            <FileTable
              documents={documents}
              selectedKeys={selectedItemKeys}
              cutKeys={cutKeySet}
              onToggleSelect={(d) => toggleSelectItem('document', d.id)}
              onSelectItem={(e, d) => handleSelectItem(e, 'document', d.id)}
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
    </div>
  );
};
