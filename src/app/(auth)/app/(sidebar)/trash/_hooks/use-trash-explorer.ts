'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTrashItems, getTrashCategoryTree } from '@/actions/trash';
import { getDocuments } from '@/actions/document';
import type { DocumentCategory, DocumentItem, TrashItem, TrashItemType } from '@/types';
import { DOC_QUERY_KEYS } from '@/utils';
import { useExplorerSelection, toExplorerItemKey } from '@/hooks';
import {
  findTrashFolderContext,
  mapCategoryToTrashItem,
  mapDocumentToTrashItem,
  buildTrashContextMenu,
  type TrashContextMenuState,
} from '../_utils/trash-helpers';
import { useTrashMutations, type TrashModalMode } from './use-trash-mutations';

export type { TrashModalMode };

export function useTrashExplorer() {
  const queryClient = useQueryClient();

  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | TrashItemType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [contextMenu, setContextMenu] = useState<TrashContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetType: 'background',
  });

  const {
    data: rootTrashItems = [],
    isLoading: isLoadingRootItems,
    isError: isErrorRootItems,
    refetch: refetchRootItems,
  } = useQuery<TrashItem[]>({
    queryKey: DOC_QUERY_KEYS.trash.items,
    queryFn: getTrashItems,
  });

  const {
    data: trashTree = [],
    isLoading: isLoadingTree,
    refetch: refetchTree,
  } = useQuery<DocumentCategory[]>({
    queryKey: DOC_QUERY_KEYS.trash.tree,
    queryFn: getTrashCategoryTree,
  });

  const { currentFolder, parentFolder, breadcrumbs, subFolders } = useMemo(
    () => findTrashFolderContext(trashTree, currentFolderId),
    [trashTree, currentFolderId],
  );

  const effectiveFolderId = useMemo<number | null>(() => {
    if (currentFolderId === null) return null;
    if (isLoadingTree) return currentFolderId;
    return currentFolder ? currentFolder.id : null;
  }, [currentFolderId, isLoadingTree, currentFolder]);

  const {
    selectedItemKeys,
    toggleSelectItem,
    selectSingleItem,
    handleItemClick,
    handleContextMenuSelect,
    selectAll,
    clearSelection,
  } = useExplorerSelection(effectiveFolderId, 'trash');

  const {
    data: folderDocsRes,
    isLoading: isLoadingFolderDocs,
    isError: isErrorFolderDocs,
    refetch: refetchFolderDocs,
  } = useQuery({
    queryKey: DOC_QUERY_KEYS.trash.folderDocs(effectiveFolderId),
    queryFn: () =>
      getDocuments({
        isDeleted: true,
        categoryId: effectiveFolderId ?? undefined,
        limit: 1000,
      }),
    enabled: effectiveFolderId !== null,
  });

  const currentItems = useMemo<TrashItem[]>(() => {
    if (effectiveFolderId === null) {
      return Array.isArray(rootTrashItems) ? rootTrashItems : [];
    }
    const folderItems = subFolders.map((sub) =>
      mapCategoryToTrashItem(sub, currentFolder?.name || 'Thùng rác'),
    );
    const rawDocs: DocumentItem[] = Array.isArray(folderDocsRes?.items) ? folderDocsRes.items : [];
    const docItems = rawDocs.map((doc) =>
      mapDocumentToTrashItem(doc, currentFolder?.name || 'Thùng rác'),
    );
    return [...folderItems, ...docItems];
  }, [effectiveFolderId, rootTrashItems, subFolders, folderDocsRes, currentFolder]);

  const filteredItems = useMemo(() => {
    return currentItems.filter((item) => {
      if (itemTypeFilter !== 'all' && item.itemType !== itemTypeFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      const title = (item.title || '').toLowerCase();
      const code = (item.code || '').toLowerCase();
      const fileName = (item.fileName || '').toLowerCase();
      const category = (item.categoryName || '').toLowerCase();
      const deletedBy = (item.deletedByName || '').toLowerCase();
      return (
        title.includes(q) ||
        code.includes(q) ||
        fileName.includes(q) ||
        category.includes(q) ||
        deletedBy.includes(q)
      );
    });
  }, [currentItems, itemTypeFilter, search]);

  const orderedKeys = useMemo(
    () => filteredItems.map((it) => toExplorerItemKey(it.itemType, it.id)),
    [filteredItems],
  );

  const selectedItems = useMemo(
    () =>
      filteredItems.filter((it) =>
        selectedItemKeys.has(toExplorerItemKey(it.itemType, it.id)),
      ),
    [filteredItems, selectedItemKeys],
  );

  const folderCount = useMemo(
    () => filteredItems.filter((i) => i.itemType === 'folder').length,
    [filteredItems],
  );
  const docCount = useMemo(
    () => filteredItems.filter((i) => i.itemType === 'document').length,
    [filteredItems],
  );

  const hasAnyTrash = rootTrashItems.length > 0 || currentItems.length > 0;
  const hasActiveFilters = Boolean(search.trim() || itemTypeFilter !== 'all');

  const handleGoBack = useCallback(() => {
    setCurrentFolderId(parentFolder ? parentFolder.id : null);
  }, [parentFolder]);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setItemTypeFilter('all');
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  const handleSelectItem = useCallback(
    (e: React.MouseEvent, item: TrashItem) => {
      handleItemClick(e, item.itemType, item.id, orderedKeys);
    },
    [handleItemClick, orderedKeys],
  );

  const handleContextMenuItem = useCallback(
    (e: React.MouseEvent, item: TrashItem) => {
      e.preventDefault();
      e.stopPropagation();
      handleContextMenuSelect(item.itemType, item.id);
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        targetType: item.itemType,
        targetItem: item,
      });
    },
    [handleContextMenuSelect],
  );

  const handleContextMenuBackground = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      targetType: 'background',
    });
  }, []);

  const mutations = useTrashMutations({
    queryClient,
    currentFolderId: effectiveFolderId,
    setCurrentFolderId,
    selectedItems,
    selectedCount: selectedItemKeys.size,
    orderedKeys,
    contextMenu,
    closeContextMenu,
    clearSelection,
    selectAll,
    handleGoBack,
  });

  const resolvedContextMenu = useMemo(
    () =>
      buildTrashContextMenu({
        contextMenu,
        selectedCount: selectedItemKeys.size,
        totalItems: filteredItems.length,
        currentFolderName: currentFolder ? currentFolder.name : 'Thùng rác',
        onOpenFolder: setCurrentFolderId,
        onRestoreSingle: mutations.openSingleRestore,
        onPurgeSingle: mutations.openSinglePurge,
        onRestoreSelected: mutations.openBulkRestore,
        onPurgeSelected: mutations.openBulkPurge,
        onSelectAll: () => selectAll(orderedKeys),
        onClearSelection: clearSelection,
        onEmptyTrash: mutations.openEmptyTrashModal,
      }),
    [
      contextMenu, selectedItemKeys.size, filteredItems.length, currentFolder,
      mutations.openSingleRestore, mutations.openSinglePurge,
      mutations.openBulkRestore, mutations.openBulkPurge,
      selectAll, orderedKeys, clearSelection, mutations.openEmptyTrashModal,
    ],
  );

  const isLoading = isLoadingRootItems || isLoadingTree || (effectiveFolderId !== null && isLoadingFolderDocs);
  const isError = isErrorRootItems || (effectiveFolderId !== null && isErrorFolderDocs);

  const refetchAll = useCallback(() => {
    void refetchRootItems();
    void refetchTree();
    if (effectiveFolderId !== null) void refetchFolderDocs();
  }, [refetchRootItems, refetchTree, refetchFolderDocs, effectiveFolderId]);

  return {
    currentFolderId: effectiveFolderId,
    setCurrentFolderId,
    currentFolder,
    parentFolder,
    breadcrumbs,
    search,
    setSearch,
    itemTypeFilter,
    setItemTypeFilter,
    viewMode,
    setViewMode,
    filteredItems,
    folderCount,
    docCount,
    hasAnyTrash,
    hasActiveFilters,
    isLoading,
    isError,
    refetchAll,
    handleGoBack,
    handleResetFilters,
    selectedItemKeys,
    toggleSelectItem,
    selectSingleItem,
    selectAll,
    clearSelection,
    orderedKeys,
    handleSelectItem,
    handleContextMenuItem,
    handleContextMenuBackground,
    contextMenu,
    closeContextMenu,
    resolvedContextMenu,
    ...mutations,
  };
}
