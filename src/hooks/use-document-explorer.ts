'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePermission } from './user-permission';
import { useQueryParam } from './use-query-param';
import { useExplorerSelection } from './use-explorer-selection';
import { useDocumentModals } from './use-document-modals';
import { useDocumentBulkUpload } from './use-document-bulk-upload';
import { useDocumentExplorerActions } from './use-document-explorer-actions';
import { useAuthStore } from '@/stores';
import { getDocumentCategoryTree, getDocuments, getInboxDocuments } from '@/actions/document';
import { DOCUMENT_TYPE_MAP, DOCUMENT_STATUS_MAP } from '@/types';
import {
  DOC_QUERY_KEYS,
  collectCategoryIds,
  resolveFolderTreeContext,
  filterExplorerDocuments,
} from '@/utils';

interface UseDocumentExplorerOptions {
  tab?: 'my' | 'shared' | string | null;
  defaultFolderId?: number | null;
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại văn bản' },
  ...Object.entries(DOCUMENT_TYPE_MAP).map(([key, item]) => ({ value: key, label: item.label })),
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...Object.entries(DOCUMENT_STATUS_MAP).map(([key, item]) => ({ value: key, label: item.label })),
];

export function useDocumentExplorer({ tab = 'my', defaultFolderId = null }: UseDocumentExplorerOptions = {}) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { isAdmin, isHR } = usePermission();
  const canManageDocuments = isAdmin || isHR;

  const [currentFolderId, setCurrentFolderId] = useState<number | null>(defaultFolderId);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);

  const {
    selectedItemKeys,
    toggleSelectItem,
    selectSingleItem,
    handleItemClick,
    handleContextMenuSelect,
    selectAll,
    clearSelection,
  } = useExplorerSelection(currentFolderId, tab);

  const [rawSearch, setRawSearch] = useQueryParam('search', '');
  const search = rawSearch || '';
  const setSearch = useCallback((v: string) => setRawSearch(v), [setRawSearch]);

  const [rawDocType, setRawDocType] = useQueryParam('type', '');
  const documentType = rawDocType || '';
  const setDocumentType = useCallback((v: string) => setRawDocType(v), [setRawDocType]);

  const [rawStatus, setRawStatus] = useQueryParam('status', '');
  const status = rawStatus || '';
  const setStatus = useCallback((v: string) => setRawStatus(v), [setRawStatus]);

  const hasActiveFilters = Boolean(search || documentType || status);
  const handleResetFilters = useCallback(() => {
    setSearch('');
    setDocumentType('');
    setStatus('');
    setFilterUnreadOnly(false);
  }, [setSearch, setDocumentType, setStatus]);

  const modals = useDocumentModals();
  const bulkUpload = useDocumentBulkUpload({ queryClient, currentFolderId });

  const {
    data: categoryTree = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: DOC_QUERY_KEYS.categories.tree,
    queryFn: getDocumentCategoryTree,
  });

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
  } = useMemo(
    () => resolveFolderTreeContext({ categoryTree, currentFolderId, tab }),
    [categoryTree, currentFolderId, tab],
  );

  const allSharedCategoryIds = useMemo(() => collectCategoryIds(sharedFolders), [sharedFolders]);
  const allMyCategoryIds = useMemo(() => collectCategoryIds(myFolders), [myFolders]);

  const queryParams = useMemo(
    () => ({
      categoryId: currentFolderId || undefined,
      search: search?.trim() || undefined,
      documentType: documentType || undefined,
      status: status || undefined,
      limit: 1000,
    }),
    [currentFolderId, search, documentType, status],
  );

  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: DOC_QUERY_KEYS.documents.list({ ...queryParams, tab }),
    queryFn: () =>
      tab === 'shared' && currentFolderId === null
        ? getInboxDocuments(queryParams)
        : getDocuments(queryParams),
  });

  const documents = useMemo(
    () =>
      filterExplorerDocuments(
        documentsData,
        currentFolderId,
        isSharedSection,
        allSharedCategoryIds,
        allMyCategoryIds,
        currentUser,
      ),
    [documentsData, currentFolderId, isSharedSection, allSharedCategoryIds, allMyCategoryIds, currentUser],
  );

  const unreadCount = useMemo(() => documents.filter((d) => d.isRead === false).length, [documents]);
  const displayedDocuments = useMemo(
    () => (filterUnreadOnly ? documents.filter((d) => d.isRead === false) : documents),
    [documents, filterUnreadOnly],
  );

  const canEditCurrentFolder = !isSharedSection || canManageDocuments || currentFolderPermission === 'edit';
  const canDeleteCurrentFolder = !isSharedSection || canManageDocuments;
  const canCreate =
    !isSharedSection ||
    canManageDocuments ||
    (Boolean(currentFolderId) && (currentFolderPermission === 'edit' || canManageDocuments));

  const handleGoBack = useCallback(() => {
    setCurrentFolderId(parentFolder ? parentFolder.id : null);
  }, [parentFolder]);

  const explorerActions = useDocumentExplorerActions({
    queryClient,
    currentUser,
    canManageDocuments,
    isSharedSection,
    currentFolderId,
    currentFolderPermission,
    setCurrentFolderId,
    safeCategoryTree,
    isDescendant,
    foldersToDisplay,
    documents: displayedDocuments,
    allMyCategoryIds,
    canCreate,
    modals,
    selectedItemKeys,
    handleItemClick,
    handleContextMenuSelect,
    selectAll,
    clearSelection,
    handleGoBack,
    startDownloadFolder: bulkUpload.startDownloadFolder,
  });

  return {
    tab,
    currentUser,
    canManageDocuments,
    currentFolderId,
    setCurrentFolderId,
    viewMode,
    setViewMode,
    handleGoBack,
    search,
    setSearch,
    documentType,
    setDocumentType,
    documentTypeOptions: DOCUMENT_TYPE_OPTIONS,
    status,
    setStatus,
    statusOptions: STATUS_OPTIONS,
    hasActiveFilters,
    handleResetFilters,
    filterUnreadOnly,
    setFilterUnreadOnly,
    unreadCount,
    selectedItemKeys,
    toggleSelectItem,
    selectSingleItem,
    selectAll,
    clearSelection,
    modals,
    categoryTree,
    safeCategoryTree,
    isLoadingCategories,
    refetchCategories,
    currentFolder,
    currentFolderPermission,
    parentFolder,
    subFolders,
    foldersToDisplay,
    isSharedSection,
    allMyCategoryIds,
    allSharedCategoryIds,
    documents,
    displayedDocuments,
    isLoadingDocuments,
    refetchDocuments,
    canEditCurrentFolder,
    canDeleteCurrentFolder,
    canCreate,
    ...bulkUpload,
    ...explorerActions,
  };
}

export type DocumentExplorerHook = ReturnType<typeof useDocumentExplorer>;
