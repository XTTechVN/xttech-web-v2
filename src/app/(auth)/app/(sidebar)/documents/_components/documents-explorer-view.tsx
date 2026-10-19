'use client';

import React from 'react';
import type { DocumentCategory, DocumentItem } from '@/types';
import type { DocumentModalsHook } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-document-modals';
import { FolderCard } from './folder-card';
import { FolderTable } from './folder-table';
import { FileCard } from './file-card';
import { FileTable } from './file-table';
import { Folder } from 'lucide-react';

interface DocumentsExplorerViewProps {
  viewMode: 'grid' | 'table';
  isLoadingDocuments: boolean;
  isLoadingCategories: boolean;
  currentFolderId: number | null;
  currentFolder: DocumentCategory | null;
  tab: string | null;
  foldersToDisplay: DocumentCategory[];
  documents: DocumentItem[];
  allMyCategoryIds: Set<number>;
  isSharedSection: boolean;
  canEditFolder: boolean;
  canDeleteFolder: boolean;
  selectedItemKeys: Set<string>;
  toggleSelectItem: (type: 'folder' | 'document', id: number) => void;
  onNavigateFolder: (id: number | null) => void;
  onDropItem: (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => void;
  onRemoveFromFolder: (doc: DocumentItem) => void;
  modals: DocumentModalsHook;
}

export const DocumentsExplorerView: React.FC<DocumentsExplorerViewProps> = ({
  viewMode,
  isLoadingDocuments,
  isLoadingCategories,
  currentFolderId,
  currentFolder,
  tab,
  foldersToDisplay,
  documents,
  allMyCategoryIds,
  isSharedSection,
  canEditFolder,
  canDeleteFolder,
  selectedItemKeys,
  toggleSelectItem,
  onNavigateFolder,
  onDropItem,
  onRemoveFromFolder,
  modals,
}) => {
  const hasSubFolders = foldersToDisplay.length > 0;
  const hasDocuments = documents.length > 0;
  const isEmptyState = !hasSubFolders && !hasDocuments && !isLoadingCategories && !isLoadingDocuments;

  const locationName = currentFolder
    ? currentFolder.name
    : isSharedSection
      ? 'Được chia sẻ với tôi'
      : tab === 'trash'
        ? 'Thùng rác'
        : 'Tài liệu của tôi';

  if (isEmptyState) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl p-8 max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <Folder size={32} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          {currentFolder ? `Thư mục "${currentFolder.name}" đang trống` : 'Chưa có thư mục hoặc tài liệu nào'}
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLoadingDocuments ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-slate-200/60 animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Folders in Grid */}
          {foldersToDisplay.map((folder) => (
            <FolderCard
              key={`folder-${folder.id}`}
              folder={folder}
              isSharedSection={isSharedSection}
              isSelected={selectedItemKeys.has(`folder-${folder.id}`)}
              onToggleSelect={() => toggleSelectItem('folder', folder.id)}
              locationName={locationName}
              onOpen={(f) => onNavigateFolder(f.id)}
              onViewDetail={(f) => modals.actions.openDetailFolder(f)}
              onEdit={(f) => modals.actions.openEditFolder(f)}
              onShare={(f) => modals.actions.openShareFolder(f)}
              onMove={(f) => modals.actions.openMoveFolder(f)}
              onDropItem={canEditFolder ? onDropItem : undefined}
              onDelete={(f) => modals.actions.openDeleteFolder(f.id, f.name)}
            />
          ))}

          {/* Documents in Grid */}
          {documents.map((doc) => (
            <FileCard
              key={`doc-${doc.id}`}
              document={doc}
              isSharedSection={isSharedSection}
              currentFolderId={currentFolderId}
              myCategoryIds={allMyCategoryIds}
              isSelected={selectedItemKeys.has(`doc-${doc.id}`)}
              onToggleSelect={() => toggleSelectItem('document', doc.id)}
              locationName={
                currentFolder
                  ? currentFolder.name
                  : doc.category?.name || locationName
              }
              onPreview={(d) => modals.actions.openPreviewDoc(d)}
              onView={(d) => modals.actions.openDetailDoc(d)}
              onEdit={(d) => modals.actions.openEditDoc(d)}
              onShare={(d) => modals.actions.openShareDoc(d)}
              onMove={(d) => modals.actions.openMoveDoc(d)}
              onSaveToFolder={(d) => modals.actions.openSaveToFolder(d)}
              onRemoveFromFolder={onRemoveFromFolder}
              onDelete={(d) => modals.actions.openDeleteDoc(d.id, d.title)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {/* Folders in Table */}
          {foldersToDisplay.length > 0 && (
            <FolderTable
              folders={foldersToDisplay}
              isSharedSection={isSharedSection}
              selectedKeys={selectedItemKeys}
              onToggleSelect={(f) => toggleSelectItem('folder', f.id)}
              locationName={locationName}
              showHeader={true}
              onOpen={(f) => onNavigateFolder(f.id)}
              onViewDetail={(f) => modals.actions.openDetailFolder(f)}
              onEdit={(f) => modals.actions.openEditFolder(f)}
              onShare={(f) => modals.actions.openShareFolder(f)}
              onMove={(f) => modals.actions.openMoveFolder(f)}
              onDropItem={canEditFolder ? onDropItem : undefined}
              onDelete={(f) => modals.actions.openDeleteFolder(f.id, f.name)}
            />
          )}

          {/* Documents in Table */}
          {documents.length > 0 && (
            <FileTable
              documents={documents}
              isSharedSection={isSharedSection}
              currentFolderId={currentFolderId}
              myCategoryIds={allMyCategoryIds}
              selectedKeys={selectedItemKeys}
              onToggleSelect={(d) => toggleSelectItem('document', d.id)}
              currentFolderName={locationName}
              showHeader={foldersToDisplay.length === 0}
              onPreview={(d) => modals.actions.openPreviewDoc(d)}
              onView={(d) => modals.actions.openDetailDoc(d)}
              onEdit={(d) => modals.actions.openEditDoc(d)}
              onShare={(d) => modals.actions.openShareDoc(d)}
              onMove={(d) => modals.actions.openMoveDoc(d)}
              onSaveToFolder={(d) => modals.actions.openSaveToFolder(d)}
              onRemoveFromFolder={onRemoveFromFolder}
              onDelete={(d) => modals.actions.openDeleteDoc(d.id, d.title)}
              onNavigateFolder={(id) => onNavigateFolder(id)}
            />
          )}
        </div>
      )}
    </div>
  );
};
