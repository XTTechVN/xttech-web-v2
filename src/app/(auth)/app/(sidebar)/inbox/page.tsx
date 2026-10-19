'use client';

import React, { Suspense } from 'react';
import { useDocumentExplorer } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-document-explorer';

// Sub Components & Modals
import { DocumentsToolbar } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-toolbar';
import { DocumentsFolderHeader } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-folder-header';
import { DocumentsExplorerView } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-explorer-view';
import { FloatingSelectionBar } from '@/app/(auth)/app/(sidebar)/documents/_components/floating-selection-bar';
import { DocumentsModals } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-modals';
import { cn } from '@/utils';

function SharedDocumentsInboxContent() {
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

    // Unread
    filterUnreadOnly,
    setFilterUnreadOnly,
    unreadCount,

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
    allMyCategoryIds,

    // Documents
    documents,
    displayedDocuments,
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
  } = useDocumentExplorer({ tab: 'shared' });

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
          tab="shared"
          subFoldersCount={subFolders.length}
          documentsCount={documents.length}
          onGoBack={handleGoBack}
        />

        {/* Quick Filter: Tất cả vs Chưa đọc */}
        <div className="flex items-center justify-between gap-3 pt-0.5 pb-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterUnreadOnly(false)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border',
                !filterUnreadOnly
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              Tất cả ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterUnreadOnly(true)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5',
                filterUnreadOnly
                  ? 'bg-primary text-white border-primary shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              <span>Chưa đọc</span>
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    filterUnreadOnly ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary',
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          {unreadCount > 0 && (
            <span className="text-[11px] text-slate-500 hidden sm:inline-block">
              Bạn có <strong className="text-primary font-semibold">{unreadCount}</strong> văn bản mới chưa xem
            </span>
          )}
        </div>

        {/* Danh sách Thư mục và Tài liệu dạng Card Lưới (Grid) / Bảng (Table) đúng như Ảnh 2 */}
        <DocumentsExplorerView
          viewMode={viewMode}
          isLoadingDocuments={isLoadingDocuments}
          isLoadingCategories={isLoadingCategories}
          currentFolderId={currentFolderId}
          currentFolder={currentFolder}
          tab="shared"
          foldersToDisplay={foldersToDisplay}
          documents={displayedDocuments}
          allMyCategoryIds={allMyCategoryIds}
          isSharedSection={true}
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

export default function SharedDocumentsInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white select-none items-center justify-center text-slate-500 text-xs">
          Đang tải dữ liệu...
        </div>
      }
    >
      <SharedDocumentsInboxContent />
    </Suspense>
  );
}
