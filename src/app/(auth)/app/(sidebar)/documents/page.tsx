'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce, usePermission } from '@/hooks';
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

// Components
import { FolderCard } from './_components/folder-card';
import { FolderTable } from './_components/folder-table';
import { FileCard } from './_components/file-card';
import { FileTable } from './_components/file-table';
import { CreateFolderModal } from './_components/create-folder-modal';
import { EditFolderModal } from './_components/edit-folder-modal';
import { FolderDetailModal } from './_components/folder-detail-modal';
import { CreateDocumentModal } from './_components/create-document-modal';
import { EditDocumentModal } from './_components/edit-document-modal';
import { DocumentDetailModal } from './_components/document-detail-modal';
import { DocumentPreviewModal } from './_components/document-preview-modal';
import { MoveItemModal } from './_components/move-item-modal';
import { DeleteConfirmModal } from './_components/delete-confirm-modal';
import { ShareFolderModal } from './_components/share-folder-modal';
import { Button, Select, TableSearch } from '@/components';

// Icons
import {
  FolderPlus,
  Upload,
  LayoutGrid,
  List,
  Folder,
  FolderOpen,
  FileText,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

function MyDocumentsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const queryClient = useQueryClient();
  const { isAdmin, isHR } = usePermission();
  const canManageDocuments = isAdmin || isHR;
  
  // Navigation & View States
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());

  const toggleSelectItem = (type: 'folder' | 'document', id: number) => {
    const key = `${type === 'folder' ? 'folder' : 'doc'}-${id}`;
    setSelectedItemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedItemKeys(new Set());
  };

  // If the URL changes to a different tab or folder, reset selection
  useEffect(() => {
    setCurrentFolderId(null);
    clearSelection();
  }, [tab]);

  useEffect(() => {
    clearSelection();
  }, [currentFolderId]);

  // Handle Escape key to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItemKeys.size > 0) {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemKeys]);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [status, setStatus] = useState('');

  // Options for existing Select component
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

  // Modals
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentCategory | null>(null);
  const [detailFolderOpen, setDetailFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DocumentCategory | null>(null);
  const [shareFolderOpen, setShareFolderOpen] = useState(false);
  const [sharingFolder, setSharingFolder] = useState<DocumentCategory | null>(null);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);

  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [detailDocOpen, setDetailDocOpen] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<{ type: 'folder' | 'document'; item: DocumentCategory | DocumentItem } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'folder' | 'document';
    id: number;
    name: string;
    loading: boolean;
  }>({
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

  // 2. Fetch Documents for current folder & filters
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

  const safeCategoryTree = useMemo<DocumentCategory[]>(() => {
    if (Array.isArray(categoryTree)) return categoryTree;
    if (Array.isArray((categoryTree as any)?.data)) return (categoryTree as any).data;
    if (Array.isArray((categoryTree as any)?.items)) return (categoryTree as any).items;
    return [];
  }, [categoryTree]);

  // Helper: Find current folder, its direct parent, and subfolders recursively
  const { currentFolder, parentFolder, subFolders, myFolders, sharedFolders } = useMemo<{
    currentFolder: DocumentCategory | null;
    parentFolder: DocumentCategory | null;
    subFolders: DocumentCategory[];
    myFolders: DocumentCategory[];
    sharedFolders: DocumentCategory[];
  }>(() => {
    if (currentFolderId === null) {
      return {
        currentFolder: null,
        parentFolder: null,
        subFolders: safeCategoryTree,
        myFolders: safeCategoryTree.filter((f) => !f.isShared),
        sharedFolders: safeCategoryTree.filter((f) => f.isShared),
      };
    }

    let targetFolder: DocumentCategory | null = null;
    let directParent: DocumentCategory | null = null;

    const findFolderRecursive = (
      nodes: DocumentCategory[],
      parent: DocumentCategory | null
    ): boolean => {
      for (const node of nodes) {
        if (node.id === currentFolderId) {
          targetFolder = node;
          directParent = parent;
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (findFolderRecursive(node.children, node)) {
            return true;
          }
        }
      }
      return false;
    };

    findFolderRecursive(safeCategoryTree, null);
    
    const children = targetFolder ? (targetFolder as DocumentCategory).children || [] : [];

    return {
      currentFolder: targetFolder,
      parentFolder: directParent,
      subFolders: children,
      myFolders: children,
      sharedFolders: [],
    };
  }, [safeCategoryTree, currentFolderId]);

  const foldersToDisplay = useMemo(() => {
    if (currentFolderId !== null) return subFolders;
    if (tab === 'shared') return sharedFolders;
    return myFolders; // default for 'my' or null
  }, [currentFolderId, tab, subFolders, sharedFolders, myFolders]);

  // Kiểm tra xem vị trí hiện tại có thuộc mục "Được chia sẻ với tôi" hay không
  const isSharedSection = useMemo(() => {
    if (tab === 'shared') return true;
    if (currentFolder?.isShared) return true;
    if (currentFolderId !== null && safeCategoryTree.length > 0) {
      const checkDescendantOfShared = (
        nodes: DocumentCategory[],
        targetId: number,
        isUnderShared = false
      ): boolean => {
        for (const node of nodes) {
          const nodeIsShared = isUnderShared || Boolean(node.isShared);
          if (node.id === targetId) {
            return nodeIsShared;
          }
          if (node.children && node.children.length > 0) {
            if (checkDescendantOfShared(node.children, targetId, nodeIsShared)) {
              return true;
            }
          }
        }
        return false;
      };
      return checkDescendantOfShared(safeCategoryTree, currentFolderId);
    }
    return false;
  }, [tab, currentFolder, currentFolderId, safeCategoryTree]);

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
            // Nếu không có quyền xóa thư mục gốc của người tạo, tự động gỡ bỏ thư mục khỏi mục Được chia sẻ với tôi
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

  // Hàm đệ quy kiểm tra xem targetId có nằm trong nhánh của sourceId không
  const isDescendant = (categories: DocumentCategory[], sourceId: number, targetId: number): boolean => {
    for (const cat of categories) {
      if (cat.id === sourceId) {
        const checkChildren = (children?: DocumentCategory[]): boolean => {
          if (!children) return false;
          if (children.some(c => c.id === targetId)) return true;
          return children.some(c => checkChildren(c.children));
        };
        return checkChildren(cat.children);
      }
      if (cat.children && cat.children.length > 0) {
        if (isDescendant(cat.children, sourceId, targetId)) return true;
      }
    }
    return false;
  };

  const handleDropItem = async (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => {
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
        const doc = documents.find(d => d.id === sourceId);
        if (doc) {
          await updateDocument(sourceId, { 
            title: doc.title,
            documentType: doc.documentType,
            status: doc.status,
            shareScope: doc.shareScope,
            categoryId: targetFolderId 
          });
          toast.success('Di chuyển tài liệu thành công');
        } else {
          // If not in current view, maybe just try with categoryId
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
  const hasActiveFilters = Boolean(search || documentType || status);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: Search, Filters & View Controls (Ảnh 2) */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-1 min-w-0">
            {/* Search Input using existing TableSearch component */}
            <div className="w-full sm:w-52 lg:w-64">
              <TableSearch
                placeholder="Tìm mã, tiêu đề..."
                value={search}
                onChange={setSearch}
                className="w-full"
              />
            </div>

            {/* Document Type Filter using existing Select component */}
            <div className="w-44 sm:w-48">
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                options={documentTypeOptions}
                placeholder="Tất cả loại văn bản"
                className="h-9 text-xs"
              />
            </div>

            {/* Status Filter using existing Select component */}
            <div className="w-40 sm:w-44 hidden sm:block">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusOptions}
                placeholder="Tất cả trạng thái"
                className="h-9 text-xs"
              />
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setDocumentType('');
                  setStatus('');
                }}
                className="h-9 px-2.5 rounded-lg border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={14} />
              </Button>
            )}

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0 mx-0.5" />

            {/* View Switch: 2 Options (Folder Grid vs Google Drive List) */}
            <div className="flex items-center p-0.5 rounded-xl border border-slate-200 bg-slate-100/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng thư mục & lưới"
              >
                <LayoutGrid size={15} />
                <span className="hidden xl:inline text-xs">Lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dạng danh sách Google Drive"
              >
                <List size={15} />
                <span className="hidden xl:inline text-xs">Danh sách</span>
              </button>
            </div>
          </div>

          {/* Right: Action buttons (Ẩn khi ở mục Được chia sẻ với tôi đối với user thường) */}
          {(!isSharedSection || canManageDocuments) && (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
                onClick={() => setCreateFolderOpen(true)}
                leftIcon={<FolderPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              >
                Thư mục mới
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="h-7 px-2.5 text-xs md:h-9 md:px-3 md:text-sm shrink-0"
                onClick={() => setCreateDocOpen(true)}
                leftIcon={<Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              >
                Tải lên tài liệu
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Main Views */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Thanh tiêu đề vị trí thư mục & Nút quay lại (Kiểu folder máy tính) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
          <div className="flex items-center gap-3 min-w-0">
            {/* Nút Quay lại 1 cấp (chỉ hiện khi đang ở trong thư mục con) */}
            {currentFolderId !== null && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                leftIcon={<ArrowLeft size={15} />}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs shrink-0"
                title={parentFolder ? `Quay lại ${parentFolder.name}` : 'Quay lại Tài liệu của tôi'}
              >
                Quay lại
              </Button>
            )}

            {/* Thông tin thư mục hiện tại */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {currentFolderId !== null ? <FolderOpen size={18} /> : <Folder size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm md:text-base font-bold text-slate-800 truncate leading-tight">
                    {currentFolder
                      ? currentFolder.name
                      : tab === 'shared'
                      ? 'Được chia sẻ với tôi'
                      : tab === 'trash'
                      ? 'Thùng rác'
                      : 'Tài liệu của tôi'}
                  </h2>
                  {currentFolder?.code && (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {currentFolder.code}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {currentFolder
                    ? `${subFolders.length} thư mục con • ${documents.length} tài liệu`
                    : `${subFolders.length} thư mục • ${documents.length} tài liệu`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* THƯ MỤC VÀ TÀI LIỆU (KHÔNG PHÂN CHIA) */}
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
                {/* 1. Render Folders */}
                {foldersToDisplay.map((folder) => (
                  <FolderCard
                    key={`folder-${folder.id}`}
                    folder={folder}
                    isSelected={selectedItemKeys.has(`folder-${folder.id}`)}
                    onToggleSelect={(f) => toggleSelectItem('folder', f.id)}
                    locationName={currentFolder ? currentFolder.name : (tab === 'shared' ? 'Được chia sẻ với tôi' : (tab === 'trash' ? 'Thùng rác' : 'Tài liệu của tôi'))}
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onViewDetail={(f) => {
                      setSelectedFolder(f);
                      setDetailFolderOpen(true);
                    }}
                    onEdit={canEditItem ? (f) => {
                      setEditingFolder(f);
                      setEditFolderOpen(true);
                    } : undefined}
                    onShare={canEditItem ? (f) => {
                      setSharingFolder(f);
                      setShareFolderOpen(true);
                    } : undefined}
                    onMove={canEditItem ? (f) => {
                      setItemToMove({ type: 'folder', item: f });
                      setMoveModalOpen(true);
                    } : undefined}
                    onDropItem={canEditItem ? handleDropItem : undefined}
                    onDelete={canDeleteItem ? (f) => {
                      setDeleteModal({
                        isOpen: true,
                        type: 'folder',
                        id: f.id,
                        name: f.name,
                        loading: false,
                      });
                    } : undefined}
                  />
                ))}
                {/* 2. Render Documents */}
                {documents.map((doc) => (
                  <FileCard
                    key={`doc-${doc.id}`}
                    document={doc}
                    isSelected={selectedItemKeys.has(`doc-${doc.id}`)}
                    onToggleSelect={(d) => toggleSelectItem('document', d.id)}
                    locationName={
                      currentFolder
                        ? currentFolder.name
                        : doc.category?.name || (isSharedSection ? 'Được chia sẻ với tôi' : (tab === 'trash' ? 'Thùng rác' : 'Tài liệu của tôi'))
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
                    onEdit={canEditItem ? (d) => {
                      setEditingDoc(d);
                      setEditDocOpen(true);
                    } : undefined}
                    onShare={canEditItem ? (d) => {
                      setSharingDoc(d);
                      setSharingFolder(null);
                      setShareFolderOpen(true);
                    } : undefined}
                    onMove={canEditItem ? (d) => {
                      setItemToMove({ type: 'document', item: d });
                      setMoveModalOpen(true);
                    } : undefined}
                    onDelete={canDeleteItem ? (d) => {
                      setDeleteModal({
                        isOpen: true,
                        type: 'document',
                        id: d.id,
                        name: d.title,
                        loading: false,
                      });
                    } : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {/* 1. Render Folders */}
                {foldersToDisplay.length > 0 && (
                  <FolderTable
                    folders={foldersToDisplay}
                    selectedKeys={selectedItemKeys}
                    onToggleSelect={(f) => toggleSelectItem('folder', f.id)}
                    locationName={currentFolder ? currentFolder.name : (tab === 'shared' ? 'Được chia sẻ với tôi' : (tab === 'trash' ? 'Thùng rác' : 'Tài liệu của tôi'))}
                    showHeader={true}
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onViewDetail={(f) => {
                      setSelectedFolder(f);
                      setDetailFolderOpen(true);
                    }}
                    onEdit={canEditItem ? (f) => {
                      setEditingFolder(f);
                      setEditFolderOpen(true);
                    } : undefined}
                    onShare={canEditItem ? (f) => {
                      setSharingFolder(f);
                      setSharingDoc(null);
                      setShareFolderOpen(true);
                    } : undefined}
                    onMove={canEditItem ? (f) => {
                      setItemToMove({ type: 'folder', item: f });
                      setMoveModalOpen(true);
                    } : undefined}
                    onDropItem={canEditItem ? handleDropItem : undefined}
                    onDelete={canDeleteItem ? (f) => {
                      setDeleteModal({
                        isOpen: true,
                        type: 'folder',
                        id: f.id,
                        name: f.name,
                        loading: false,
                      });
                    } : undefined}
                  />
                )}
                {/* 2. Render Documents */}
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
                    onEdit={canEditItem ? (d) => {
                      setEditingDoc(d);
                      setEditDocOpen(true);
                    } : undefined}
                    onShare={canEditItem ? (d) => {
                      setSharingDoc(d);
                      setSharingFolder(null);
                      setShareFolderOpen(true);
                    } : undefined}
                    onMove={canEditItem ? (d) => {
                      setItemToMove({ type: 'document', item: d });
                      setMoveModalOpen(true);
                    } : undefined}
                    onDelete={canDeleteItem ? (d) => {
                      setDeleteModal({
                        isOpen: true,
                        type: 'document',
                        id: d.id,
                        name: d.title,
                        loading: false,
                      });
                    } : undefined}
                    onNavigateFolder={(id) => setCurrentFolderId(id)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATE TOÀN BỘ (Khi folder hiện tại không có thư mục con và không có file con nào) */}
        {isEmptyState && (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-3xl p-8 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Folder size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {currentFolder ? `Thư mục "${currentFolder.name}" đang trống` : 'Chưa có thư mục hoặc tài liệu nào'}
            </h3>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Create Folder Modal */}
      <CreateFolderModal
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        parentId={currentFolderId}
        parentFolder={currentFolder}
        onSuccess={() => {
          refetchCategories();
        }}
      />

      {/* 2. Edit Folder Modal */}
      <EditFolderModal
        isOpen={editFolderOpen}
        onClose={() => {
          setEditFolderOpen(false);
          setEditingFolder(null);
        }}
        folder={editingFolder}
        onSuccess={() => {
          refetchCategories();
        }}
      />

      {/* 3. Create / Upload Document Modal */}
      <CreateDocumentModal
        isOpen={createDocOpen}
        onClose={() => setCreateDocOpen(false)}
        currentFolderId={currentFolderId}
        currentFolder={currentFolder}
        categories={safeCategoryTree}
        onSuccess={() => {
          refetchDocuments();
        }}
      />

      {/* 3.5 Edit Document Modal */}
      <EditDocumentModal
        isOpen={editDocOpen}
        onClose={() => {
          setEditDocOpen(false);
          setEditingDoc(null);
        }}
        document={editingDoc}
        categories={safeCategoryTree}
        onSuccess={() => {
          refetchDocuments();
        }}
      />

      {/* 4. Document Detail Modal */}
      <DocumentDetailModal
        isOpen={detailDocOpen}
        onClose={() => {
          setDetailDocOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        onSuccess={refetchDocuments}
      />

      {/* 4.5 Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewDocOpen}
        onClose={() => {
          setPreviewDocOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
      />

      {/* 4.6 Move Item Modal */}
      <MoveItemModal
        isOpen={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          setItemToMove(null);
        }}
        type={itemToMove?.type || 'folder'}
        item={itemToMove?.item || null}
        onSuccess={() => {
          refetchCategories();
          refetchDocuments();
        }}
      />

      {/* 5. Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        title={deleteModal.type === 'folder' ? 'Xác nhận xóa thư mục' : 'Xác nhận xóa tài liệu'}
        description={
          deleteModal.type === 'folder' ? (
            <>
              Bạn có chắc chắn muốn xóa thư mục{' '}
              <strong className="text-gray-900 font-semibold">{deleteModal.name}</strong>?
            </>
          ) : (
            <>
              Bạn có chắc chắn muốn xóa tài liệu{' '}
              <strong className="text-gray-900 font-semibold">{deleteModal.name}</strong>?
            </>
          )
        }
        onConfirm={handleConfirmDelete}
        loading={deleteModal.loading}
      />

      {/* 6. Share Folder / Document Modal */}
      <ShareFolderModal
        isOpen={shareFolderOpen}
        onClose={() => {
          setShareFolderOpen(false);
          setSharingFolder(null);
          setSharingDoc(null);
        }}
        folder={sharingFolder}
        document={sharingDoc}
        onSuccess={() => {
          refetchCategories();
          refetchDocuments();
        }}
      />

      {/* 7. Folder Detail Modal */}
      <FolderDetailModal
        isOpen={detailFolderOpen}
        onClose={() => {
          setDetailFolderOpen(false);
          setSelectedFolder(null);
        }}
        folder={selectedFolder}
      />


      {/* Floating Multi-Selection Bar */}
      {selectedItemKeys.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 duration-150 text-xs">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Đã chọn <strong>{selectedItemKeys.size}</strong> mục
          </span>
          <div className="h-3 w-px bg-slate-700" />
          <button
            type="button"
            onClick={clearSelection}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
          >
            Bỏ chọn (Esc)
          </button>
        </div>
      )}
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
