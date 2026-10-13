'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePermission } from '@/hooks';
import { useAuthStore } from '@/stores';
import {
  getDocumentCategoryTree,
  getDocuments,
  updateDocumentCategory,
  updateDocument,
  deleteDocumentCategory,
  deleteDocument,
  getDocumentCategoryShares,
  revokeDocumentCategoryShare,
  getDocumentShares,
  revokeDocumentShare,
} from '@/actions/document';
import type { DocumentCategory, DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP } from '@/types';

// Custom Hooks
import { useDocumentSelection } from './_hooks/use-document-selection';
import { useFolderTree } from './_hooks/use-folder-tree';

// Sub Components & Modals
import { DocumentsToolbar } from './_components/documents-toolbar';
import { DocumentsFolderHeader } from './_components/documents-folder-header';
import { FloatingSelectionBar } from './_components/floating-selection-bar';
import {
  DocumentsModals,
  type DeleteModalState,
  type ItemToMoveState,
} from './_components/documents-modals';
import { FolderCard } from './_components/folder-card';
import { FolderTable } from './_components/folder-table';
import { FileCard } from './_components/file-card';
import { FileTable } from './_components/file-table';

// Icons & Utilities
import { Folder } from 'lucide-react';
import toast from 'react-hot-toast';

function MyDocumentsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { isAdmin, isHR } = usePermission();
  const canManageDocuments = isAdmin || isHR;

  // Navigation & View States
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Multi-Selection Hook (handles selection & Escape key)
  const { selectedItemKeys, toggleSelectItem, clearSelection } = useDocumentSelection(
    currentFolderId,
    tab
  );

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [status, setStatus] = useState('');

  const documentTypeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại văn bản' },
      ...Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả trạng thái' },
      ...Object.entries(DOCUMENT_STATUS_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      })),
    ],
    []
  );

  const hasActiveFilters = Boolean(search || documentType || status);

  // Modals States
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentCategory | null>(null);
  const [detailFolderOpen, setDetailFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DocumentCategory | null>(null);

  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [detailDocOpen, setDetailDocOpen] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const [shareFolderOpen, setShareFolderOpen] = useState(false);
  const [sharingFolder, setSharingFolder] = useState<DocumentCategory | null>(null);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<ItemToMoveState | null>(null);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'folder',
    id: 0,
    name: '',
    loading: false,
  });

  // 1. Fetch Category Tree
  const {
    data: categoryTree = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['document-categories', 'tree'],
    queryFn: getDocumentCategoryTree,
  });

  // 2. Folder Hierarchy & Shared Section Hook
  const {
    safeCategoryTree,
    currentFolder,
    parentFolder,
    subFolders,
    foldersToDisplay,
    isSharedSection,
    isDescendant,
  } = useFolderTree({
    categoryTree,
    currentFolderId,
    tab,
  });

  // 3. Fetch Documents for current folder & filters
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['documents', { categoryId: currentFolderId, search, documentType, status }],
    queryFn: () =>
      getDocuments({
        categoryId: currentFolderId || undefined,
        search: search.trim() || undefined,
        documentType: documentType || undefined,
        status: status || undefined,
        limit: 100,
      }),
  });

  // 4. Resolve documents list for current folder
  const documents = useMemo<DocumentItem[]>(() => {
    let rawItems: DocumentItem[] = [];
    if (Array.isArray(documentsData?.items)) rawItems = documentsData.items;
    else if (Array.isArray(documentsData)) rawItems = documentsData as any;
    else if (Array.isArray((documentsData as any)?.data)) rawItems = (documentsData as any).data;

    if (currentFolderId === null) {
      return rawItems.filter((doc) => doc.categoryId === null || doc.categoryId === undefined);
    }
    return rawItems.filter(
      (doc) => doc.categoryId === currentFolderId || doc.category?.id === currentFolderId
    );
  }, [documentsData, currentFolderId]);

  // Quyền chỉnh sửa và xóa tài liệu / thư mục: trong mục Được chia sẻ với tôi chỉ HR hoặc ADMIN được sửa/xóa
  const canEditItem = !isSharedSection || canManageDocuments;
  const canDeleteItem = !isSharedSection || canManageDocuments;

  // Handle go back 1 level (như nút Back trên máy tính)
  const handleGoBack = () => {
    if (parentFolder) {
      setCurrentFolderId(parentFolder.id);
    } else {
      setCurrentFolderId(null);
    }
  };

  // Delete Action (with fallback revoke share if 403)
  const handleConfirmDelete = async () => {
    if (isSharedSection && !canManageDocuments) {
      toast.error('Bạn không có quyền xóa trong mục Được chia sẻ với tôi');
      setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

      if (deleteModal.type === 'folder') {
        try {
          await deleteDocumentCategory(deleteModal.id);
          toast.success(`Đã xóa thư mục "${deleteModal.name}"`);
        } catch (catError: any) {
          const errMsg = catError.message || '';
          const isPermissionErr =
            errMsg.includes('chủ sở hữu') ||
            errMsg.includes('Quản trị viên') ||
            errMsg.includes('FORBIDDEN') ||
            errMsg.includes('403');

          if (isPermissionErr) {
            // Nếu không có quyền xóa thư mục gốc của người tạo, tự động gỡ bỏ khỏi mục Được chia sẻ với tôi
            try {
              const shares = await getDocumentCategoryShares(deleteModal.id);
              const myShare = shares.find(
                (s) =>
                  String(s.userId) === String(currentUser?.id) ||
                  (Boolean(currentUser?.email) &&
                    s.user?.email?.toLowerCase() === currentUser?.email?.toLowerCase())
              );
              if (myShare?.id) {
                await revokeDocumentCategoryShare(deleteModal.id, myShare.id);
                toast.success(`Đã gỡ thư mục "${deleteModal.name}" khỏi mục Được chia sẻ với tôi`);
              } else {
                throw catError;
              }
            } catch (fallbackErr) {
              throw catError;
            }
          } else {
            throw catError;
          }
        }
        refetchCategories();
        queryClient.invalidateQueries({ queryKey: ['documents', 'trash'] });
        queryClient.invalidateQueries({ queryKey: ['document-categories'] });
        if (currentFolderId === deleteModal.id) {
          handleGoBack();
        }
      } else {
        try {
          await deleteDocument(deleteModal.id);
          toast.success(`Đã xóa tài liệu "${deleteModal.name}"`);
        } catch (docErr: any) {
          const errMsg = docErr.message || '';
          const isPermissionErr =
            errMsg.includes('quyền') ||
            errMsg.includes('FORBIDDEN') ||
            errMsg.includes('403');

          if (isPermissionErr) {
            try {
              const shares = await getDocumentShares(deleteModal.id);
              const myShare = shares.find(
                (s) =>
                  String(s.userId) === String(currentUser?.id) ||
                  (Boolean(currentUser?.email) &&
                    s.user?.email?.toLowerCase() === currentUser?.email?.toLowerCase())
              );
              if (myShare?.id) {
                await revokeDocumentShare(deleteModal.id, myShare.id);
                toast.success(`Đã gỡ tài liệu "${deleteModal.name}" khỏi mục Được chia sẻ với tôi`);
              } else {
                throw docErr;
              }
            } catch (fallbackErr) {
              throw docErr;
            }
          } else {
            throw docErr;
          }
        }
        refetchDocuments();
        queryClient.invalidateQueries({ queryKey: ['documents', 'trash'] });
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      }

      setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Drag and Drop move handler
  const handleDropItem = async (
    sourceType: 'folder' | 'document',
    sourceId: number,
    targetFolderId: number
  ) => {
    if (isSharedSection && !canManageDocuments) {
      toast.error('Bạn không có quyền di chuyển trong mục Được chia sẻ với tôi');
      return;
    }

    if (sourceType === 'folder') {
      if (sourceId === targetFolderId) return; // Drop on itself
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
      toast.error(error.message || 'Lỗi khi di chuyển');
    }
  };

  const hasSubFolders = subFolders.length > 0;
  const hasDocuments = documents.length > 0;
  const isEmptyState =
    !hasSubFolders && !hasDocuments && !isLoadingCategories && !isLoadingDocuments;

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
        onResetFilters={() => {
          setSearch('');
          setDocumentType('');
          setStatus('');
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        canCreate={!isSharedSection || canManageDocuments}
        onCreateFolder={() => setCreateFolderOpen(true)}
        onCreateDocument={() => setCreateDocOpen(true)}
      />

      {/* 2. Scrollable Main Views */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Thanh tiêu đề vị trí thư mục & Nút quay lại (Kiểu folder máy tính) */}
        <DocumentsFolderHeader
          currentFolderId={currentFolderId}
          currentFolder={currentFolder}
          parentFolder={parentFolder}
          tab={tab}
          subFoldersCount={subFolders.length}
          documentsCount={documents.length}
          onGoBack={handleGoBack}
        />

        {/* THƯ MỤC VÀ TÀI LIỆU */}
        {(foldersToDisplay.length > 0 || hasDocuments || isLoadingDocuments) && (
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
                    isSelected={selectedItemKeys.has(`folder-${folder.id}`)}
                    onToggleSelect={(f) => toggleSelectItem('folder', f.id)}
                    locationName={
                      currentFolder
                        ? currentFolder.name
                        : tab === 'shared'
                        ? 'Được chia sẻ với tôi'
                        : tab === 'trash'
                        ? 'Thùng rác'
                        : 'Tài liệu của tôi'
                    }
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onViewDetail={(f) => {
                      setSelectedFolder(f);
                      setDetailFolderOpen(true);
                    }}
                    onEdit={
                      canEditItem
                        ? (f) => {
                            setEditingFolder(f);
                            setEditFolderOpen(true);
                          }
                        : undefined
                    }
                    onShare={
                      canEditItem
                        ? (f) => {
                            setSharingFolder(f);
                            setShareFolderOpen(true);
                          }
                        : undefined
                    }
                    onMove={
                      canEditItem
                        ? (f) => {
                            setItemToMove({ type: 'folder', item: f });
                            setMoveModalOpen(true);
                          }
                        : undefined
                    }
                    onDropItem={canEditItem ? handleDropItem : undefined}
                    onDelete={
                      canDeleteItem
                        ? (f) => {
                            setDeleteModal({
                              isOpen: true,
                              type: 'folder',
                              id: f.id,
                              name: f.name,
                              loading: false,
                            });
                          }
                        : undefined
                    }
                  />
                ))}

                {/* Documents in Grid */}
                {documents.map((doc) => (
                  <FileCard
                    key={`doc-${doc.id}`}
                    document={doc}
                    isSelected={selectedItemKeys.has(`doc-${doc.id}`)}
                    onToggleSelect={(d) => toggleSelectItem('document', d.id)}
                    locationName={
                      currentFolder
                        ? currentFolder.name
                        : doc.category?.name ||
                          (isSharedSection
                            ? 'Được chia sẻ với tôi'
                            : tab === 'trash'
                            ? 'Thùng rác'
                            : 'Tài liệu của tôi')
                    }
                    canEdit={canEditItem}
                    canDelete={canDeleteItem}
                    onPreview={(d) => {
                      setSelectedDoc(d);
                      setPreviewDocOpen(true);
                    }}
                    onView={(d) => {
                      setSelectedDoc(d);
                      setDetailDocOpen(true);
                    }}
                    onEdit={
                      canEditItem
                        ? (d) => {
                            setEditingDoc(d);
                            setEditDocOpen(true);
                          }
                        : undefined
                    }
                    onShare={
                      canEditItem
                        ? (d) => {
                            setSharingDoc(d);
                            setSharingFolder(null);
                            setShareFolderOpen(true);
                          }
                        : undefined
                    }
                    onMove={
                      canEditItem
                        ? (d) => {
                            setItemToMove({ type: 'document', item: d });
                            setMoveModalOpen(true);
                          }
                        : undefined
                    }
                    onDelete={
                      canDeleteItem
                        ? (d) => {
                            setDeleteModal({
                              isOpen: true,
                              type: 'document',
                              id: d.id,
                              name: d.title,
                              loading: false,
                            });
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {/* Folders in Table */}
                {foldersToDisplay.length > 0 && (
                  <FolderTable
                    folders={foldersToDisplay}
                    selectedKeys={selectedItemKeys}
                    onToggleSelect={(f) => toggleSelectItem('folder', f.id)}
                    locationName={
                      currentFolder
                        ? currentFolder.name
                        : tab === 'shared'
                        ? 'Được chia sẻ với tôi'
                        : tab === 'trash'
                        ? 'Thùng rác'
                        : 'Tài liệu của tôi'
                    }
                    showHeader={true}
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onViewDetail={(f) => {
                      setSelectedFolder(f);
                      setDetailFolderOpen(true);
                    }}
                    onEdit={
                      canEditItem
                        ? (f) => {
                            setEditingFolder(f);
                            setEditFolderOpen(true);
                          }
                        : undefined
                    }
                    onShare={
                      canEditItem
                        ? (f) => {
                            setSharingFolder(f);
                            setSharingDoc(null);
                            setShareFolderOpen(true);
                          }
                        : undefined
                    }
                    onMove={
                      canEditItem
                        ? (f) => {
                            setItemToMove({ type: 'folder', item: f });
                            setMoveModalOpen(true);
                          }
                        : undefined
                    }
                    onDropItem={canEditItem ? handleDropItem : undefined}
                    onDelete={
                      canDeleteItem
                        ? (f) => {
                            setDeleteModal({
                              isOpen: true,
                              type: 'folder',
                              id: f.id,
                              name: f.name,
                              loading: false,
                            });
                          }
                        : undefined
                    }
                  />
                )}

                {/* Documents in Table */}
                {documents.length > 0 && (
                  <FileTable
                    documents={documents}
                    selectedKeys={selectedItemKeys}
                    onToggleSelect={(d) => toggleSelectItem('document', d.id)}
                    currentFolderName={
                      currentFolder
                        ? currentFolder.name
                        : isSharedSection
                        ? 'Được chia sẻ với tôi'
                        : tab === 'trash'
                        ? 'Thùng rác'
                        : 'Tài liệu của tôi'
                    }
                    showHeader={foldersToDisplay.length === 0}
                    canEdit={canEditItem}
                    canDelete={canDeleteItem}
                    onPreview={(d) => {
                      setSelectedDoc(d);
                      setPreviewDocOpen(true);
                    }}
                    onView={(d) => {
                      setSelectedDoc(d);
                      setDetailDocOpen(true);
                    }}
                    onEdit={
                      canEditItem
                        ? (d) => {
                            setEditingDoc(d);
                            setEditDocOpen(true);
                          }
                        : undefined
                    }
                    onShare={
                      canEditItem
                        ? (d) => {
                            setSharingDoc(d);
                            setSharingFolder(null);
                            setShareFolderOpen(true);
                          }
                        : undefined
                    }
                    onMove={
                      canEditItem
                        ? (d) => {
                            setItemToMove({ type: 'document', item: d });
                            setMoveModalOpen(true);
                          }
                        : undefined
                    }
                    onDelete={
                      canDeleteItem
                        ? (d) => {
                            setDeleteModal({
                              isOpen: true,
                              type: 'document',
                              id: d.id,
                              name: d.title,
                              loading: false,
                            });
                          }
                        : undefined
                    }
                    onNavigateFolder={(id) => setCurrentFolderId(id)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Empty State */}
        {isEmptyState && (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl p-8 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Folder size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {currentFolder
                ? `Thư mục "${currentFolder.name}" đang trống`
                : 'Chưa có thư mục hoặc tài liệu nào'}
            </h3>
          </div>
        )}
      </div>

      {/* 4. Modals Container */}
      <DocumentsModals
        createFolderOpen={createFolderOpen}
        setCreateFolderOpen={setCreateFolderOpen}
        editFolderOpen={editFolderOpen}
        setEditFolderOpen={setEditFolderOpen}
        editingFolder={editingFolder}
        setEditingFolder={setEditingFolder}
        detailFolderOpen={detailFolderOpen}
        setDetailFolderOpen={setDetailFolderOpen}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        createDocOpen={createDocOpen}
        setCreateDocOpen={setCreateDocOpen}
        editDocOpen={editDocOpen}
        setEditDocOpen={setEditDocOpen}
        editingDoc={editingDoc}
        setEditingDoc={setEditingDoc}
        detailDocOpen={detailDocOpen}
        setDetailDocOpen={setDetailDocOpen}
        previewDocOpen={previewDocOpen}
        setPreviewDocOpen={setPreviewDocOpen}
        selectedDoc={selectedDoc}
        setSelectedDoc={setSelectedDoc}
        moveModalOpen={moveModalOpen}
        setMoveModalOpen={setMoveModalOpen}
        itemToMove={itemToMove}
        setItemToMove={setItemToMove}
        shareFolderOpen={shareFolderOpen}
        setShareFolderOpen={setShareFolderOpen}
        sharingFolder={sharingFolder}
        setSharingFolder={setSharingFolder}
        sharingDoc={sharingDoc}
        setSharingDoc={setSharingDoc}
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        onConfirmDelete={handleConfirmDelete}
        currentFolderId={currentFolderId}
        currentFolder={currentFolder}
        safeCategoryTree={safeCategoryTree}
        onRefetchCategories={refetchCategories}
        onRefetchDocuments={refetchDocuments}
      />

      {/* 5. Floating Multi-Selection Bar */}
      <FloatingSelectionBar
        selectedCount={selectedItemKeys.size}
        onClearSelection={clearSelection}
      />
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
