'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDocumentExplorer } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-document-explorer';

// Sub Components & Modals
import { DocumentsToolbar } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-toolbar';
import { DocumentsFolderHeader } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-folder-header';
import { DocumentsExplorerView } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-explorer-view';
import { FloatingSelectionBar } from '@/app/(auth)/app/(sidebar)/documents/_components/floating-selection-bar';
import { DocumentsModals } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-modals';

function MyDocumentsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'my';

  const {
    // Navigation & View
    currentFolderId,
    setCurrentFolderId,
    viewMode,
    setViewMode,
    handleGoBack,

    // Search & Filter
    search,
    setSearch,
    documentType,
    setDocumentType,
    documentTypeOptions,
    status,
    setStatus,
    statusOptions,
    hasActiveFilters,
    handleResetFilters,

    // Selection
    selectedItemKeys,
    toggleSelectItem,
    clearSelection,

    // Modals
    modals,

    // Categories
    safeCategoryTree,
    isLoadingCategories,
    refetchCategories,
    currentFolder,
    parentFolder,
    subFolders,
    foldersToDisplay,
    isSharedSection,
    allMyCategoryIds,

    // Documents
    documents,
    isLoadingDocuments,
    refetchDocuments,

    // Permissions
    canEditCurrentFolder,
    canDeleteCurrentFolder,
    canCreate,

    // Actions
    handleConfirmDelete,
    handleDropItem,
    handleRemoveFromFolder,
  } = useDocumentExplorer({ tab });

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* 1. Top Header & Toolbar */}
      <DocumentsToolbar
        search={search}
        onSearchChange={setSearch}
        documentType={documentType}
        onDocumentTypeChange={setDocumentType}
        documentTypeOptions={documentTypeOptions}
        status={status}
        onStatusChange={setStatus}
        statusOptions={statusOptions}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        canCreate={canCreate}
        onCreateFolder={modals.actions.openCreateFolder}
        onCreateDocument={modals.actions.openCreateDoc}
      />

      {/* 2. Scrollable Main Views */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Thanh tiêu đề vị trí thư mục & Nút quay lại */}
        <DocumentsFolderHeader
          currentFolderId={currentFolderId}
          currentFolder={currentFolder}
          parentFolder={parentFolder}
          tab={tab}
          subFoldersCount={subFolders.length}
          documentsCount={documents.length}
          onGoBack={handleGoBack}
        />

        {/* Danh sách Thư mục và Tài liệu (Grid / Table / Empty state) */}
        <DocumentsExplorerView
          viewMode={viewMode}
          isLoadingDocuments={isLoadingDocuments}
          isLoadingCategories={isLoadingCategories}
          currentFolderId={currentFolderId}
          currentFolder={currentFolder}
          tab={tab}
          foldersToDisplay={foldersToDisplay}
          documents={documents}
          allMyCategoryIds={allMyCategoryIds}
          isSharedSection={isSharedSection}
          canEditFolder={canEditCurrentFolder}
          canDeleteFolder={canDeleteCurrentFolder}
          selectedItemKeys={selectedItemKeys}
          toggleSelectItem={toggleSelectItem}
          onNavigateFolder={setCurrentFolderId}
          onDropItem={handleDropItem}
          onRemoveFromFolder={handleRemoveFromFolder}
          modals={modals}
        />
      </div>

      {/* 3. Centralized Modals Container */}
      <DocumentsModals
        modals={modals}
        currentFolderId={currentFolderId}
        currentFolder={currentFolder}
        safeCategoryTree={safeCategoryTree}
        onConfirmDelete={handleConfirmDelete}
        onRefetchCategories={refetchCategories}
        onRefetchDocuments={refetchDocuments}
      />

      {/* 4. Floating Multi-Selection Bar */}
      <FloatingSelectionBar selectedCount={selectedItemKeys.size} onClearSelection={clearSelection} />
    </div>
  );
}

export default function MyDocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white select-none items-center justify-center text-slate-500 text-xs">
          Đang tải dữ liệu...
        </div>
      }
    >
      <MyDocumentsContent />
    </Suspense>
  );
}
