'use client';

import React, { useState, useMemo, Suspense, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePermission, useQueryParam } from '@/hooks';
import { useAuthStore } from '@/stores';
import {
  getDocumentCategoryTree,
  getDocuments,
  updateDocumentCategory,
  updateDocument,
  deleteDocumentCategory,
  deleteDocument,
  removeDocumentFromFolder,
} from '@/actions/document';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP, type DocumentCategory, type DocumentItem } from '@/types';
import { isDocumentOwner, isDocumentSharedWithUser, getDocumentPermissions } from '../documents/_utils/doc-helpers';

// Custom Hooks từ module documents
import { useDocumentSelection } from '../documents/_hooks/use-document-selection';
import { useFolderTree } from '../documents/_hooks/use-folder-tree';
import { useDocumentModals } from '../documents/_hooks/use-document-modals';

// Sub Components & Modals
import { DocumentsToolbar } from '../documents/_components/documents-toolbar';
import { DocumentsFolderHeader } from '../documents/_components/documents-folder-header';
import { DocumentsExplorerView } from '../documents/_components/documents-explorer-view';
import { FloatingSelectionBar } from '../documents/_components/floating-selection-bar';
import { DocumentsModals } from '../documents/_components/documents-modals';

// Utilities
import toast from 'react-hot-toast';
import { showErrorToast } from '@/utils';

function SharedDocumentsInboxContent() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { isAdmin, isHR } = usePermission();
  const canManageDocuments = isAdmin || isHR;

  // Navigation & View States (Mặc định là dạng Grid Card như Ảnh 2)
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Multi-Selection Hook (handles selection & Escape key)
  const { selectedItemKeys, toggleSelectItem, clearSelection } = useDocumentSelection(currentFolderId, 'shared');

  // Search & Filter States (Đồng bộ URL qua useQueryParam chuẩn dự án)
  const [search, setSearch] = useQueryParam('search', '');
  const [documentType, setDocumentType] = useQueryParam('type', '');
  const [status, setStatus] = useQueryParam('status', '');

  const documentTypeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại văn bản' },
      ...Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    [],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả trạng thái' },
      ...Object.entries(DOCUMENT_STATUS_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    [],
  );

  const hasActiveFilters = Boolean(search || documentType || status);

  // Modals Controller Hook
  const modals = useDocumentModals();

  // 1. Fetch Category Tree
  const {
    data: categoryTree = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['document-categories', 'tree'],
    queryFn: getDocumentCategoryTree,
  });

  // 2. Folder Hierarchy & Shared Section Hook (cố định tab 'shared')
  const {
    safeCategoryTree,
    currentFolder,
    currentFolderPermission,
    parentFolder,
    subFolders,
    myFolders,
    sharedFolders,
    foldersToDisplay,
    isSharedSection,
    isDescendant,
  } = useFolderTree({
    categoryTree,
    currentFolderId,
    tab: 'shared',
  });

  // Tập hợp toàn bộ ID của các thư mục thuộc cây thư mục chia sẻ
  const allSharedCategoryIds = useMemo(() => {
    const ids = new Set<number>();
    const collect = (nodes: DocumentCategory[]) => {
      for (const node of nodes) {
        ids.add(node.id);
        if (node.children && node.children.length > 0) {
          collect(node.children);
        }
      }
    };
    collect(sharedFolders);
    return ids;
  }, [sharedFolders]);

  // Tập hợp toàn bộ ID của các thư mục thuộc cây thư mục của tôi
  const allMyCategoryIds = useMemo(() => {
    const ids = new Set<number>();
    const collect = (nodes: DocumentCategory[]) => {
      for (const node of nodes) {
        ids.add(node.id);
        if (node.children && node.children.length > 0) {
          collect(node.children);
        }
      }
    };
    collect(myFolders);
    return ids;
  }, [myFolders]);

  // 3. Fetch Documents for current folder & filters
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['documents', 'shared-inbox', { categoryId: currentFolderId, search, documentType, status }],
    queryFn: () =>
      getDocuments({
        categoryId: currentFolderId || undefined,
        search: search?.trim() || undefined,
        documentType: documentType || undefined,
        status: status || undefined,
        limit: 1000,
      }),
  });

  // 4. Resolve documents list for shared section
  const documents = useMemo<DocumentItem[]>(() => {
    let rawItems: DocumentItem[] = [];
    if (Array.isArray(documentsData?.items)) rawItems = documentsData.items;
    else if (Array.isArray(documentsData)) rawItems = documentsData as any;
    else if (Array.isArray((documentsData as any)?.data)) rawItems = (documentsData as any).data;

    if (currentFolderId === null) {
      return rawItems.filter((doc) => {
        if (isDocumentOwner(doc, currentUser, allMyCategoryIds)) return false;
        const sharedToMe = isDocumentSharedWithUser(doc, currentUser, allSharedCategoryIds);
        if (!sharedToMe) return false;
        if (doc.categoryId === null || doc.categoryId === undefined) return true;
        return !allSharedCategoryIds.has(doc.categoryId);
      });
    }
    return rawItems.filter((doc) => doc.categoryId === currentFolderId || doc.category?.id === currentFolderId);
  }, [documentsData, currentFolderId, allSharedCategoryIds, allMyCategoryIds, currentUser]);

  const canEditCurrentFolder = !isSharedSection || canManageDocuments;
  const canDeleteCurrentFolder = !isSharedSection || canManageDocuments;

  const canCreate = Boolean(currentFolderId) && (currentFolderPermission === 'edit' || canManageDocuments);

  // Handle go back 1 level
  const handleGoBack = useCallback(() => {
    if (parentFolder) {
      setCurrentFolderId(parentFolder.id);
    } else {
      setCurrentFolderId(null);
    }
  }, [parentFolder]);

  // Handle gỡ lối tắt khỏi thư mục cá nhân
  const handleRemoveFromFolder = useCallback(
    async (doc: DocumentItem) => {
      if (!currentFolderId) return;
      try {
        await removeDocumentFromFolder(doc.id, currentFolderId);
        toast.success(`Đã gỡ tài liệu "${doc.title}" khỏi thư mục này`);
        refetchDocuments();
        refetchCategories();
        queryClient.invalidateQueries({ queryKey: ['documents'] });
        queryClient.invalidateQueries({ queryKey: ['document-categories'] });
      } catch (error: any) {
        showErrorToast(error, 'Không thể gỡ tài liệu khỏi thư mục');
      }
    },
    [currentFolderId, refetchDocuments, refetchCategories, queryClient],
  );

  // Delete Action
  const handleConfirmDelete = useCallback(async () => {
    const { deleteModal } = modals.state;
    if (isSharedSection && !canManageDocuments) {
      toast.error('Bạn không có quyền xóa trong mục Được chia sẻ với tôi');
      modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    try {
      modals.setters.setDeleteModal((prev) => ({ ...prev, loading: true }));

      if (deleteModal.type === 'folder') {
        await deleteDocumentCategory(deleteModal.id);
        toast.success(`Đã xóa thư mục "${deleteModal.name}"`);
        refetchCategories();
        queryClient.invalidateQueries({ queryKey: ['documents', 'trash'] });
        queryClient.invalidateQueries({ queryKey: ['document-categories'] });
        if (currentFolderId === deleteModal.id) {
          handleGoBack();
        }
      } else {
        const docToDelete = documents.find((d) => d.id === deleteModal.id);
        if (docToDelete) {
          const perms = getDocumentPermissions(docToDelete, currentUser, {
            isSharedSection,
            canManageDocuments,
            myCategoryIds: allMyCategoryIds,
            currentFolderId,
          });
          if (!perms.canDelete && !canManageDocuments) {
            toast.error('Chỉ chủ sở hữu tài liệu mới có quyền xóa tài liệu gốc');
            modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
            return;
          }
        }

        await deleteDocument(deleteModal.id);
        toast.success(`Đã xóa tài liệu "${deleteModal.name}"`);
        refetchDocuments();
        queryClient.invalidateQueries({ queryKey: ['documents', 'trash'] });
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      }

      modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (error: any) {
      showErrorToast(error, 'Lỗi khi xóa');
      modals.setters.setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  }, [
    modals,
    isSharedSection,
    canManageDocuments,
    currentFolderId,
    documents,
    currentUser,
    allMyCategoryIds,
    refetchCategories,
    refetchDocuments,
    queryClient,
    handleGoBack,
  ]);

  // Drag and Drop move handler
  const handleDropItem = useCallback(
    async (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => {
      if (sourceType === 'document') {
        const doc = documents.find((d) => d.id === sourceId);
        if (doc) {
          const perms = getDocumentPermissions(doc, currentUser, {
            isSharedSection,
            canManageDocuments,
          });
          if (!perms.canMove && !canManageDocuments) {
            toast.error('Chỉ chủ sở hữu tài liệu mới có quyền di chuyển');
            return;
          }
        }
      }

      if (isSharedSection && !canManageDocuments) {
        toast.error('Bạn không có quyền di chuyển trong mục Được chia sẻ với tôi');
        return;
      }

      if (sourceType === 'folder') {
        if (sourceId === targetFolderId) return;
        if (isDescendant(safeCategoryTree, sourceId, targetFolderId)) {
          toast.error('Vị trí đích không hợp lệ (không thể di chuyển vào thư mục con).');
          return;
        }
      }

      try {
        if (sourceType === 'folder') {
          await updateDocumentCategory(sourceId, { parentId: targetFolderId });
          toast.success('Di chuyển thư mục thành công');
        } else {
          const doc = documents.find((d) => d.id === sourceId);
          if (doc) {
            await updateDocument(sourceId, {
              title: doc.title,
              documentType: doc.documentType,
              status: doc.status,
              shareScope: doc.shareScope,
              categoryId: targetFolderId,
            });
            toast.success('Di chuyển tài liệu thành công');
          } else {
            await updateDocument(sourceId, { categoryId: targetFolderId });
            toast.success('Di chuyển tài liệu thành công');
          }
        }
        refetchCategories();
        refetchDocuments();
      } catch (error: any) {
        showErrorToast(error, 'Lỗi khi di chuyển');
      }
    },
    [
      documents,
      currentUser,
      isSharedSection,
      canManageDocuments,
      safeCategoryTree,
      isDescendant,
      refetchCategories,
      refetchDocuments,
    ],
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* 1. Top Header & Toolbar */}
      <DocumentsToolbar
        search={search || ''}
        onSearchChange={setSearch}
        documentType={documentType || ''}
        onDocumentTypeChange={setDocumentType}
        documentTypeOptions={documentTypeOptions}
        status={status || ''}
        onStatusChange={setStatus}
        statusOptions={statusOptions}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={() => {
          setSearch('');
          setDocumentType('');
          setStatus('');
        }}
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

        {/* Danh sách Thư mục và Tài liệu dạng Card Lưới (Grid) / Bảng (Table) đúng như Ảnh 2 */}
        <DocumentsExplorerView
          viewMode={viewMode}
          isLoadingDocuments={isLoadingDocuments}
          isLoadingCategories={isLoadingCategories}
          currentFolderId={currentFolderId}
          currentFolder={currentFolder}
          tab="shared"
          foldersToDisplay={foldersToDisplay}
          documents={documents}
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

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col min-w-0 h-full overflow-hidden bg-white select-none items-center justify-center text-slate-500 text-xs">
          Đang tải dữ liệu được chia sẻ...
        </div>
      }
    >
      <SharedDocumentsInboxContent />
    </Suspense>
  );
}
