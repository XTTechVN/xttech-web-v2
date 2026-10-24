'use client';

import React from 'react';
import type { DocumentExplorerHook } from '@/hooks/use-document-explorer';
import { DocumentsToolbar } from './documents-toolbar';
import { DocumentsFolderHeader } from './documents-folder-header';
import { DocumentsExplorerView } from './documents-explorer-view';
import { DocumentsModals } from './modals/documents-modals';

interface DocumentExplorerPageLayoutProps {
  explorer: DocumentExplorerHook;
  subHeaderSlot?: React.ReactNode;
}

export const DocumentExplorerPageLayout: React.FC<DocumentExplorerPageLayoutProps> = ({
  explorer,
  subHeaderSlot,
}) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      <DocumentsToolbar
        search={explorer.search}
        onSearchChange={explorer.setSearch}
        documentType={explorer.documentType}
        onDocumentTypeChange={explorer.setDocumentType}
        documentTypeOptions={explorer.documentTypeOptions}
        status={explorer.status}
        onStatusChange={explorer.setStatus}
        statusOptions={explorer.statusOptions}
        hasActiveFilters={explorer.hasActiveFilters}
        onResetFilters={explorer.handleResetFilters}
        viewMode={explorer.viewMode}
        onViewModeChange={explorer.setViewMode}
        canCreate={explorer.canCreate}
        isUploading={explorer.isUploading}
        onCreateFolder={explorer.modals.actions.openCreateFolder}
        onUploadFiles={explorer.triggerFilesUpload}
        onUploadFolder={explorer.triggerFolderUpload}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <DocumentsFolderHeader
          currentFolderId={explorer.currentFolderId}
          currentFolder={explorer.currentFolder}
          parentFolder={explorer.parentFolder}
          tab={explorer.tab}
          subFoldersCount={explorer.subFolders.length}
          documentsCount={explorer.documents.length}
          onGoBack={explorer.handleGoBack}
        />

        {subHeaderSlot}

        <DocumentsExplorerView explorer={explorer} />
      </div>

      <DocumentsModals
        modals={explorer.modals}
        currentFolderId={explorer.currentFolderId}
        currentFolder={explorer.currentFolder}
        safeCategoryTree={explorer.safeCategoryTree}
        onConfirmDelete={explorer.handleConfirmDelete}
        onRefetchCategories={explorer.refetchCategories}
        onRefetchDocuments={explorer.refetchDocuments}
      />
    </div>
  );
};
