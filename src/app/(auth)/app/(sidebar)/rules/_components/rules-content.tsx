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
import { FileTable } from '@/app/(auth)/app/(sidebar)/documents/_components/file-table';
import { DocumentsModals } from '@/app/(auth)/app/(sidebar)/documents/_components/documents-modals';
import { useDocumentModals } from '@/app/(auth)/app/(sidebar)/documents/_hooks/use-document-modals';
import { DOC_QUERY_KEYS, invalidateDocumentQueries } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-query-keys';

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

  // Modals hook tập trung
  const modals = useDocumentModals();

  // 1. Fetch Category Tree
  const { data: categoryTree = [] } = useQuery({
    queryKey: DOC_QUERY_KEYS.categories.tree,
    queryFn: getDocumentCategoryTree,
  });

  const safeCategoryTree = useMemo<DocumentCategory[]>(() => {
    if (Array.isArray(categoryTree)) return categoryTree;
    if (Array.isArray((categoryTree as any)?.data)) return (categoryTree as any).data;
    if (Array.isArray((categoryTree as any)?.items)) return (categoryTree as any).items;
    return [];
  }, [categoryTree]);

  // 2. Fetch Documents for rules
  const queryParams = useMemo(
    () => ({
      search: search?.trim() || undefined,
      documentType: documentType || undefined,
      status: status || undefined,
      limit: 1000,
    }),
    [search, documentType, status],
  );

  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: DOC_QUERY_KEYS.documents.list({ ...queryParams, scope: 'rules' }),
    queryFn: () => getDocuments(queryParams),
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
    const { deleteModal } = modals.state;
    try {
      modals.setters.setDeleteModal((prev) => ({ ...prev, loading: true }));
      await deleteDocument(deleteModal.id);
      toast.success(`Đã xóa văn bản "${deleteModal.name}"`);
      invalidateDocumentQueries(queryClient);
      modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (error: any) {
      showErrorToast(error, 'Lỗi khi xóa');
      modals.setters.setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const hasDocuments = documents.length > 0;
  const isEmptyState = !hasDocuments && !isLoadingDocuments;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white select-none">
      {/* Top Header & Navigation Bar Component */}
      <RulesHeader
        search={search || ''}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateDocument={() => modals.actions.openCreateDoc()}
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
                onPreview={modals.actions.openPreviewDoc}
                onView={modals.actions.openDetailDoc}
                onEdit={modals.actions.openEditDoc}
                onShare={modals.actions.openShareDoc}
                onDelete={(d) => modals.actions.openDeleteDoc(d.id, d.title)}
              />
            ) : (
              <div className="flex flex-col gap-0">
                <FileTable
                  documents={documents}
                  selectedKeys={selectedItemKeys}
                  onToggleSelect={(d) => toggleSelectItem('document', d.id)}
                  currentFolderName="Quy chế & Quy định"
                  showHeader={true}
                  onPreview={modals.actions.openPreviewDoc}
                  onView={modals.actions.openDetailDoc}
                  onEdit={modals.actions.openEditDoc}
                  onShare={modals.actions.openShareDoc}
                  onMove={(d) => modals.actions.openMoveDoc(d)}
                  onDelete={(d) => modals.actions.openDeleteDoc(d.id, d.title)}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State Component */}
        {isEmptyState && <RulesEmptyState onCreateDocument={() => modals.actions.openCreateDoc()} />}
      </div>

      {/* Centralized Modals Container */}
      <DocumentsModals
        modals={modals}
        safeCategoryTree={safeCategoryTree}
        defaultGroup="rules"
        onConfirmDelete={handleConfirmDelete}
        onRefetchDocuments={refetchDocuments}
      />
    </div>
  );
}
