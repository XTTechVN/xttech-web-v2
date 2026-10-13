'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
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
  removeDocumentFromFolder,
} from '@/actions/document';
import {
  DOCUMENT_TYPE_MAP,
  DOCUMENT_STATUS_MAP,
  type DocumentCategory,
  type DocumentItem,
} from '@/types';
import {
  isDocumentOwner,
  isDocumentSharedWithUser,
  isDocumentSharedOut,
  getDocumentPermissions,
} from './_utils/doc-helpers';

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
import { SaveToFolderModal } from './_components/save-to-folder-modal';

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
  const [saveToFolderDoc, setSaveToFolderDoc] = useState<DocumentItem | null>(null);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<ItemToMoveState | null>(null);

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'folder',
    id: 0,
    name: '',
    loading: false,
  });

  // Reset thư mục khi chuyển tab (Tài liệu của tôi <-> Được chia sẻ)
  useEffect(() => {
    setCurrentFolderId(null);
  }, [tab]);

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
    myFolders,
    sharedFolders,
    foldersToDisplay,
    isSharedSection,
    isDescendant,
  } = useFolderTree({
    categoryTree,
    currentFolderId,
    tab,
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

  // 4. Resolve documents list for current folder & shared / my section
  const documents = useMemo<DocumentItem[]>(() => {
    let rawItems: DocumentItem[] = [];
    if (Array.isArray(documentsData?.items)) rawItems = documentsData.items;
    else if (Array.isArray(documentsData)) rawItems = documentsData as any;
    else if (Array.isArray((documentsData as any)?.data)) rawItems = (documentsData as any).data;

    // PHÂN VÙNG: ĐƯỢC CHIA SẺ (tab === 'shared' hoặc đang ở trong thư mục con thuộc nhánh chia sẻ)
    if (isSharedSection) {
      if (currentFolderId === null) {
        // Ở thư mục gốc của Được chia sẻ với tôi:
        // 1. Tuyệt đối KHÔNG hiển thị tài liệu do chính currentUser sở hữu.
        // 2. Chỉ hiển thị tài liệu được người khác chia sẻ cho currentUser (có quyền truy cập hợp lệ).
        // 3. Nếu tài liệu nằm trong thư mục chia sẻ con đã hiển thị -> không lặp lại ở gốc.
        return rawItems.filter((doc) => {
          if (isDocumentOwner(doc, currentUser, allMyCategoryIds)) return false;
          const sharedToMe = isDocumentSharedWithUser(doc, currentUser, allSharedCategoryIds);
          if (!sharedToMe) return false;
          if (doc.categoryId === null || doc.categoryId === undefined) return true;
          return !allSharedCategoryIds.has(doc.categoryId);
        });
      }

      // Đang ở trong một thư mục chia sẻ cụ thể:
      return rawItems.filter(
        (doc) => doc.categoryId === currentFolderId || doc.category?.id === currentFolderId
      );
    }

    // PHÂN VÙNG: TÀI LIỆU CỦA TÔI (tab !== 'shared' và không nằm trong nhánh chia sẻ)
    // Nguyên tắc quan trọng:
    // - Hiển thị các tài liệu thuộc quyền sở hữu của người dùng hiện tại.
    // - Khi chủ sở hữu chia sẻ tài liệu cho người khác, tài liệu VẪN PHẢI HIỂN THỊ trong Tài liệu của tôi của chủ sở hữu.
    // - Tuyệt đối KHÔNG xóa, ẩn hoặc di chuyển tài liệu khỏi danh sách của chủ sở hữu sau khi chia sẻ.
    // - Tài liệu do người khác tạo và chia sẻ cho tôi TUYỆT ĐỐI KHÔNG hiển thị tại đây.
    if (currentFolderId === null) {
      return rawItems.filter((doc) => {
        const isRoot = doc.categoryId === null || doc.categoryId === undefined;
        if (!isRoot) return false;
        return isDocumentOwner(doc, currentUser, allMyCategoryIds);
      });
    }

    return rawItems.filter((doc) => {
      const isInFolder =
        doc.categoryId === currentFolderId || doc.category?.id === currentFolderId;
      if (!isInFolder) return false;
      return isDocumentOwner(doc, currentUser, allMyCategoryIds);
    });
  }, [documentsData, currentFolderId, isSharedSection, allSharedCategoryIds, allMyCategoryIds, currentUser]);

  // Quyền thao tác thư mục: trong mục Được chia sẻ với tôi chỉ HR hoặc ADMIN được sửa/xóa folder
  const canEditFolder = !isSharedSection || canManageDocuments;
  const canDeleteFolder = !isSharedSection || canManageDocuments;

  // Handle go back 1 level (như nút Back trên máy tính)
  const handleGoBack = () => {
    if (parentFolder) {
      setCurrentFolderId(parentFolder.id);
    } else {
      setCurrentFolderId(null);
    }
  };

  // Handle gỡ lối tắt khỏi thư mục cá nhân
  const handleRemoveFromFolder = async (doc: DocumentItem) => {
    if (!currentFolderId) return;
    try {
      await removeDocumentFromFolder(doc.id, currentFolderId);
      toast.success(`Đã gỡ tài liệu "${doc.title}" khỏi thư mục này`);
      refetchDocuments();
      refetchCategories();
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
    } catch (error: any) {
      toast.error(error.message || 'Không thể gỡ tài liệu khỏi thư mục');
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (isSharedSection && !canManageDocuments) {
      toast.error('Bạn không có quyền xóa trong mục Được chia sẻ với tôi');
      setDeleteModal((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

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
            setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
            return;
          }
        }

        await deleteDocument(deleteModal.id);
        toast.success(`Đã xóa tài liệu "${deleteModal.name}"`);
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
                      canEditFolder
                        ? (f) => {
                            setEditingFolder(f);
                            setEditFolderOpen(true);
                          }
                        : undefined
                    }
                    onShare={
                      canEditFolder
                        ? (f) => {
                            setSharingFolder(f);
                            setShareFolderOpen(true);
                          }
                        : undefined
                    }
                    onMove={
                      canEditFolder
                        ? (f) => {
                            setItemToMove({ type: 'folder', item: f });
                            setMoveModalOpen(true);
                          }
                        : undefined
                    }
                    onDropItem={canEditFolder ? handleDropItem : undefined}
                    onDelete={
                      canDeleteFolder
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
                    isSharedSection={isSharedSection}
                    currentFolderId={currentFolderId}
                    myCategoryIds={allMyCategoryIds}
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
                    onPreview={(d) => {
                      setSelectedDoc(d);
                      setPreviewDocOpen(true);
                    }}
                    onView={(d) => {
                      setSelectedDoc(d);
                      setDetailDocOpen(true);
                    }}
                    onEdit={(d) => {
                      setEditingDoc(d);
                      setEditDocOpen(true);
                    }}
                    onShare={(d) => {
                      setSharingDoc(d);
                      setSharingFolder(null);
                      setShareFolderOpen(true);
                    }}
                    onMove={(d) => {
                      setItemToMove({ type: 'document', item: d });
                      setMoveModalOpen(true);
                    }}
                    onSaveToFolder={(d) => setSaveToFolderDoc(d)}
                    onRemoveFromFolder={handleRemoveFromFolder}
                    onDelete={(d) => {
                      setDeleteModal({
                        isOpen: true,
                        type: 'document',
                        id: d.id,
                        name: d.title,
                        loading: false,
                      });
                    }}
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
                      canEditFolder
                        ? (f) => {
                            setEditingFolder(f);
                            setEditFolderOpen(true);
                          }
                        : undefined
                    }
                    onShare={
                      canEditFolder
                        ? (f) => {
                            setSharingFolder(f);
                            setSharingDoc(null);
                            setShareFolderOpen(true);
                          }
                        : undefined
                    }
                    onMove={
                      canEditFolder
                        ? (f) => {
                            setItemToMove({ type: 'folder', item: f });
                            setMoveModalOpen(true);
                          }
                        : undefined
                    }
                    onDropItem={canEditFolder ? handleDropItem : undefined}
                    onDelete={
                      canDeleteFolder
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
                    isSharedSection={isSharedSection}
                    currentFolderId={currentFolderId}
                    myCategoryIds={allMyCategoryIds}
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
                    onPreview={(d) => {
                      setSelectedDoc(d);
                      setPreviewDocOpen(true);
                    }}
                    onView={(d) => {
                      setSelectedDoc(d);
                      setDetailDocOpen(true);
                    }}
                    onEdit={(d) => {
                      setEditingDoc(d);
                      setEditDocOpen(true);
                    }}
                    onShare={(d) => {
                      setSharingDoc(d);
                      setSharingFolder(null);
                      setShareFolderOpen(true);
                    }}
                    onMove={(d) => {
                      setItemToMove({ type: 'document', item: d });
                      setMoveModalOpen(true);
                    }}
                    onSaveToFolder={(d) => setSaveToFolderDoc(d)}
                    onRemoveFromFolder={handleRemoveFromFolder}
                    onDelete={(d) => {
                      setDeleteModal({
                        isOpen: true,
                        type: 'document',
                        id: d.id,
                        name: d.title,
                        loading: false,
                      });
                    }}
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

      {/* 4.1. Save To Folder Modal */}
      <SaveToFolderModal
        isOpen={Boolean(saveToFolderDoc)}
        onClose={() => setSaveToFolderDoc(null)}
        document={saveToFolderDoc}
        onSuccess={refetchDocuments}
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
