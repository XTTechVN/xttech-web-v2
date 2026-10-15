'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDocumentCategoryTree, getDocuments, deleteDocument } from '@/actions/document';
import type { DocumentCategory, DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP, RULE_DOC_TYPES } from '@/types';

// Subcomponents & Modals
import { RulesHeader } from './rules-header';
import { RulesEmptyState } from './rules-empty-state';
import { RulesSplitView } from './rules-split-view';
import { CreateDocumentModal } from '../../documents/_components/create-document-modal';
import { FileTable } from '../../documents/_components/file-table';
import { EditDocumentModal } from '../../documents/_components/edit-document-modal';
import { DocumentDetailModal } from '../../documents/_components/document-detail-modal';
import { DocumentPreviewModal } from '../../documents/_components/document-preview-modal';
import { MoveItemModal } from '../../documents/_components/move-item-modal';
import { DeleteConfirmModal } from '../../documents/_components/delete-confirm-modal';
import { ShareFolderModal } from '../../documents/_components/share-folder-modal';

import toast from 'react-hot-toast';

import { useQueryParam } from '@/hooks';
import { showErrorToast } from '@/utils';

export function RulesContent() {
  const queryClient = useQueryClient();

  // Selection state
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());

  const toggleSelectItem = (_type: 'folder' | 'document', id: number) => {
    const key = `doc-${id}`;
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

  // Search & Filter States (URL sync via useQueryParam)
  const [search, setSearch] = useQueryParam('search', '');
  const [documentType, setDocumentType] = useQueryParam('type', '');
  const [status, setStatus] = useQueryParam('status', '');

  // Options for existing Select component - Filtered for Rule/Policy document types
  const documentTypeOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả loại quy chế' },
      ...Object.entries(DOCUMENT_TYPE_MAP)
        .filter(([key]) => RULE_DOC_TYPES.includes(key))
        .map(([key, item]) => ({
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

  // Modals
  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [detailDocOpen, setDetailDocOpen] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [shareFolderOpen, setShareFolderOpen] = useState(false);
  const [sharingDoc, setSharingDoc] = useState<DocumentItem | null>(null);

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
    type: 'document',
    id: 0,
    name: '',
    loading: false,
  });

  // 1. Fetch Category Tree for Move Modal / Categories
  const { data: categoryTree = [] } = useQuery({
    queryKey: ['document-categories', 'tree'],
    queryFn: getDocumentCategoryTree,
  });

  const safeCategoryTree = useMemo<DocumentCategory[]>(() => {
    if (Array.isArray(categoryTree)) return categoryTree;
    if (Array.isArray((categoryTree as any)?.data)) return (categoryTree as any).data;
    if (Array.isArray((categoryTree as any)?.items)) return (categoryTree as any).items;
    return [];
  }, [categoryTree]);

  // 2. Fetch Documents for rules
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['documents', 'rules', { search, documentType, status }],
    queryFn: () =>
      getDocuments({
        search: search?.trim() || undefined,
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

    // Filter only rule/regulation/policy document types
    return rawItems.filter((doc) => RULE_DOC_TYPES.includes(doc.documentType));
  }, [documentsData]);

  // Delete Action
  const handleConfirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));
      await deleteDocument(deleteModal.id);
      toast.success(`Đã xóa văn bản "${deleteModal.name}"`);
      refetchDocuments();
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'trash'] });
      setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (error: any) {
      showErrorToast(error, 'Lỗi khi xóa');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const hasDocuments = documents.length > 0;
  const isEmptyState = !hasDocuments && !isLoadingDocuments;
  const hasActiveFilters = Boolean(search || documentType || status);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* Top Header & Navigation Bar Component */}
      <RulesHeader
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
        onCreateDocument={() => setCreateDocOpen(true)}
      />

      {/* Scrollable Main Views */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Content: Grid or Table */}
        {(hasDocuments || isLoadingDocuments) && (
          <div className="space-y-3">
            {isLoadingDocuments ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-slate-200/60 animate-pulse" />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <RulesSplitView
                documents={documents}
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
                  setShareFolderOpen(true);
                }}
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
            ) : (
              <div className="flex flex-col gap-0">
                <FileTable
                  documents={documents}
                  selectedKeys={selectedItemKeys}
                  onToggleSelect={(d) => toggleSelectItem('document', d.id)}
                  currentFolderName="Quy chế & Quy định"
                  showHeader={true}
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
                    setShareFolderOpen(true);
                  }}
                  onMove={(d) => {
                    setItemToMove({ type: 'document', item: d });
                    setMoveModalOpen(true);
                  }}
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
              </div>
            )}
          </div>
        )}

        {/* Empty State Component */}
        {isEmptyState && <RulesEmptyState onCreateDocument={() => setCreateDocOpen(true)} />}
      </div>

      {/* MODALS */}

      {/* 1. Create Rule Document Modal */}
      <CreateDocumentModal
        isOpen={createDocOpen}
        onClose={() => setCreateDocOpen(false)}
        categories={safeCategoryTree}
        defaultGroup="rules"
        onSuccess={() => {
          refetchDocuments();
          queryClient.invalidateQueries({ queryKey: ['documents'] });
        }}
      />

      {/* 2. Edit Document Modal */}
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

      {/* 3. Document Detail Modal */}
      <DocumentDetailModal
        isOpen={detailDocOpen}
        onClose={() => {
          setDetailDocOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        onSuccess={refetchDocuments}
      />

      {/* 4. Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewDocOpen}
        onClose={() => {
          setPreviewDocOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
      />

      {/* 5. Move Item Modal */}
      <MoveItemModal
        isOpen={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          setItemToMove(null);
        }}
        type={itemToMove?.type || 'document'}
        item={itemToMove?.item || null}
        onSuccess={() => {
          refetchDocuments();
        }}
      />

      {/* 6. Share Modal */}
      <ShareFolderModal
        isOpen={shareFolderOpen}
        onClose={() => {
          setShareFolderOpen(false);
          setSharingDoc(null);
        }}
        folder={null}
        document={sharingDoc}
      />

      {/* 7. Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        loading={deleteModal.loading}
        title="Xóa văn bản quy chế"
        description={
          <>
            Bạn có chắc chắn muốn chuyển văn bản <strong className="text-gray-900 font-semibold">{deleteModal.name}</strong> vào thùng rác?
          </>
        }
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
