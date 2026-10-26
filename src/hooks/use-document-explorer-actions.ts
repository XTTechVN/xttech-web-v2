'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { removeDocumentFromFolder } from '@/actions/document';
import type { DocumentCategory, DocumentItem } from '@/types';
import {
  getDocumentPermissions,
  invalidateDocumentQueries,
  showErrorToast,
  findFolderWithPermission,
  executeClipboardPaste,
  executeExplorerBulkDelete,
  executeExplorerDrop,
  handleExplorerKeyDown,
  type ClipboardEntry,
  type DocumentClipboardState,
} from '@/utils';
import { toExplorerItemKey } from './use-explorer-selection';
import type { DocumentModalsHook, BulkMoveTarget, BulkDeleteTarget } from './use-document-modals';

export interface ExplorerContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetType: 'folder' | 'document' | 'background';
  targetFolder?: DocumentCategory;
  targetDoc?: DocumentItem;
}

interface UseDocumentExplorerActionsProps {
  queryClient: QueryClient;
  currentUser: any;
  canManageDocuments: boolean;
  isSharedSection: boolean;
  currentFolderId: number | null;
  setCurrentFolderId: (id: number | null) => void;
  safeCategoryTree: DocumentCategory[];
  isDescendant: (tree: DocumentCategory[], sourceId: number, targetId: number) => boolean;
  foldersToDisplay: DocumentCategory[];
  documents: DocumentItem[];
  allMyCategoryIds: Set<number>;
  canCreate: boolean;
  modals: DocumentModalsHook;
  selectedItemKeys: Set<string>;
  handleItemClick: (e: React.MouseEvent, type: 'folder' | 'document', id: number, orderedKeys: string[]) => void;
  handleContextMenuSelect: (type: 'folder' | 'document', id: number) => Set<string>;
  selectAll: (orderedKeys: string[]) => void;
  clearSelection: () => void;
  handleGoBack: () => void;
}

export function useDocumentExplorerActions({
  queryClient, currentUser, canManageDocuments, isSharedSection, currentFolderId, setCurrentFolderId,
  safeCategoryTree, isDescendant, foldersToDisplay, documents, allMyCategoryIds, canCreate,
  modals, selectedItemKeys, handleItemClick, handleContextMenuSelect, selectAll, clearSelection, handleGoBack,
}: UseDocumentExplorerActionsProps) {
  const [contextMenu, setContextMenu] = useState<ExplorerContextMenuState>({
    isOpen: false, x: 0, y: 0, targetType: 'background',
  });
  const [clipboard, setClipboard] = useState<DocumentClipboardState | null>(null);
  const [isPasting, setIsPasting] = useState(false);

  const orderedKeys = useMemo(
    () => [...foldersToDisplay.map((f) => toExplorerItemKey('folder', f.id)), ...documents.map((d) => toExplorerItemKey('document', d.id))],
    [foldersToDisplay, documents],
  );

  const cutKeySet = useMemo(() => {
    const set = new Set<string>();
    if (clipboard?.mode !== 'cut') return set;
    for (const item of clipboard.items) set.add(toExplorerItemKey(item.type, item.id));
    return set;
  }, [clipboard]);

  const clearClipboard = useCallback(() => setClipboard(null), []);

  const isFolderOwnerOrAdmin = useCallback(
    (folder: DocumentCategory): boolean => {
      if (canManageDocuments) return true;
      const byCreator = Boolean(folder.createdById && currentUser?.id && String(folder.createdById) === String(currentUser.id));
      return Boolean(!isSharedSection && (folder.isOwner ?? (byCreator || !folder.createdById))) || byCreator;
    },
    [canManageDocuments, isSharedSection, currentUser],
  );

  const canCreateInFolder = useCallback(
    (targetFolderId: number | null): boolean => {
      if (canManageDocuments) return true;
      if (targetFolderId === currentFolderId) return canCreate;
      if (targetFolderId === null) return !isSharedSection;
      if (allMyCategoryIds.has(targetFolderId)) return true;
      const found = findFolderWithPermission(safeCategoryTree, targetFolderId);
      return Boolean(found && (isFolderOwnerOrAdmin(found.folder) || found.effectivePermission === 'edit'));
    },
    [canManageDocuments, currentFolderId, canCreate, isSharedSection, allMyCategoryIds, safeCategoryTree, isFolderOwnerOrAdmin],
  );

  const getDocPerms = useCallback(
    (doc: DocumentItem) => getDocumentPermissions(doc, currentUser, { isSharedSection, canManageDocuments, myCategoryIds: allMyCategoryIds, currentFolderId }),
    [currentUser, isSharedSection, canManageDocuments, allMyCategoryIds, currentFolderId],
  );

  const resolveSelectedObjects = useCallback(
    (keys: Set<string> = selectedItemKeys) => ({
      selectedFolders: foldersToDisplay.filter((f) => keys.has(toExplorerItemKey('folder', f.id))),
      selectedDocs: documents.filter((d) => keys.has(toExplorerItemKey('document', d.id))),
    }),
    [selectedItemKeys, foldersToDisplay, documents],
  );

  const buildClipboardEntries = useCallback(
    (keys: Set<string> = selectedItemKeys): ClipboardEntry[] => {
      const { selectedFolders, selectedDocs } = resolveSelectedObjects(keys);
      return [
        ...selectedFolders.map((f) => ({ type: 'folder' as const, id: f.id, name: f.name, parentId: f.parentId ?? null, canMove: isFolderOwnerOrAdmin(f) })),
        ...selectedDocs.map((d) => ({ type: 'document' as const, id: d.id, name: d.title, parentId: d.categoryId ?? null, canMove: getDocPerms(d).canMove || canManageDocuments })),
      ];
    },
    [selectedItemKeys, resolveSelectedObjects, isFolderOwnerOrAdmin, getDocPerms, canManageDocuments],
  );

  const cutItems = useCallback((entries: ClipboardEntry[]) => {
    if (entries.length === 0) return;
    const movable = entries.filter((item) => item.canMove !== false);
    if (movable.length === 0) return void toast.error('Bạn không có quyền di chuyển các mục đã chọn');
    setClipboard({ mode: 'cut', items: movable });
    const skipped = entries.length - movable.length;
    toast.success(`Đã cắt ${movable.length} mục${skipped > 0 ? ` (bỏ qua ${skipped} mục không có quyền)` : ''}. Nhấn Ctrl+V tại thư mục đích để di chuyển.`);
  }, []);

  const copyItems = useCallback((entries: ClipboardEntry[]) => {
    if (entries.length === 0) return;
    const docs = entries.filter((item) => item.type === 'document');
    if (docs.length === 0) return void toast('Thư mục không sao chép được', { icon: 'ℹ️' });
    setClipboard({ mode: 'copy', items: docs });
    const skipped = entries.length - docs.length;
    toast.success(`Đã sao chép ${docs.length} tài liệu${skipped > 0 ? ` (bỏ qua ${skipped} thư mục)` : ''}. Nhấn Ctrl+V tại thư mục đích để dán.`);
  }, []);

  const pasteItems = useCallback(
    async (targetFolderId: number | null) => {
      if (!clipboard || clipboard.items.length === 0 || isPasting) return;
      if (!canCreateInFolder(targetFolderId)) return void toast.error('Bạn không có quyền dán vào thư mục này');
      setIsPasting(true);
      try {
        await executeClipboardPaste({ clipboard, targetFolderId, safeCategoryTree, queryClient, onClearClipboard: () => setClipboard(null) });
      } catch (error: unknown) {
        showErrorToast(error, 'Lỗi khi dán dữ liệu');
      } finally {
        setIsPasting(false);
      }
    },
    [clipboard, isPasting, canCreateInFolder, safeCategoryTree, queryClient],
  );

  const handleSelectItem = useCallback(
    (e: React.MouseEvent, type: 'folder' | 'document', id: number) => handleItemClick(e, type, id, orderedKeys),
    [handleItemClick, orderedKeys],
  );

  const handleContextMenuFolder = useCallback((e: React.MouseEvent, folder: DocumentCategory) => {
    handleContextMenuSelect('folder', folder.id);
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'folder', targetFolder: folder });
  }, [handleContextMenuSelect]);

  const handleContextMenuDoc = useCallback((e: React.MouseEvent, doc: DocumentItem) => {
    handleContextMenuSelect('document', doc.id);
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'document', targetDoc: doc });
  }, [handleContextMenuSelect]);

  const handleContextMenuBackground = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'background' });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev)), []);
  const handleCopySelected = useCallback(() => copyItems(buildClipboardEntries()), [copyItems, buildClipboardEntries]);
  const handleCutSelected = useCallback(() => cutItems(buildClipboardEntries()), [cutItems, buildClipboardEntries]);
  const handleCopySingleDoc = useCallback((doc: DocumentItem) => copyItems([{ type: 'document', id: doc.id, name: doc.title, parentId: doc.categoryId ?? null, canMove: true }]), [copyItems]);
  const handleCutSingleDoc = useCallback((doc: DocumentItem) => {
    if (!(getDocPerms(doc).canMove || canManageDocuments)) return void toast.error('Bạn không có quyền di chuyển tài liệu này');
    cutItems([{ type: 'document', id: doc.id, name: doc.title, parentId: doc.categoryId ?? null, canMove: true }]);
  }, [cutItems, getDocPerms, canManageDocuments]);
  const handleCutSingleFolder = useCallback((folder: DocumentCategory) => {
    if (!isFolderOwnerOrAdmin(folder)) return void toast.error('Bạn không có quyền di chuyển thư mục này');
    cutItems([{ type: 'folder', id: folder.id, name: folder.name, parentId: folder.parentId ?? null, canMove: true }]);
  }, [cutItems, isFolderOwnerOrAdmin]);

  const handleOpenMoveSelected = useCallback(() => {
    const { selectedFolders, selectedDocs } = resolveSelectedObjects();
    const moveTargets: BulkMoveTarget[] = [
      ...selectedFolders.filter(isFolderOwnerOrAdmin).map((f) => ({ type: 'folder' as const, item: f })),
      ...selectedDocs.filter((d) => getDocPerms(d).canMove || canManageDocuments).map((d) => ({ type: 'document' as const, item: d })),
    ];
    if (moveTargets.length === 0) return void toast.error('Bạn không có quyền di chuyển các mục đã chọn');
    modals.actions.openBulkMoveModal(moveTargets);
  }, [resolveSelectedObjects, isFolderOwnerOrAdmin, getDocPerms, canManageDocuments, modals.actions]);

  const handleOpenDeleteSelected = useCallback(() => {
    const { selectedFolders, selectedDocs } = resolveSelectedObjects();
    const deleteTargets: BulkDeleteTarget[] = [
      ...selectedFolders.filter(isFolderOwnerOrAdmin).map((f) => ({ type: 'folder' as const, id: f.id, name: f.name })),
      ...selectedDocs.filter((d) => getDocPerms(d).canDelete || canManageDocuments).map((d) => ({ type: 'document' as const, id: d.id, name: d.title })),
    ];
    if (deleteTargets.length === 0) return void toast.error('Bạn không có quyền xóa các mục đã chọn');
    modals.actions.openBulkDeleteModal(deleteTargets);
  }, [resolveSelectedObjects, isFolderOwnerOrAdmin, getDocPerms, canManageDocuments, modals.actions]);

  const handleOpenFocusedItem = useCallback(() => {
    const { selectedFolders, selectedDocs } = resolveSelectedObjects();
    if (selectedFolders.length === 1 && selectedDocs.length === 0) setCurrentFolderId(selectedFolders[0].id);
    else if (selectedDocs.length === 1 && selectedFolders.length === 0) modals.actions.openPreviewDoc(selectedDocs[0]);
  }, [resolveSelectedObjects, setCurrentFolderId, modals.actions]);

  const handleRenameFocusedItem = useCallback(() => {
    const { selectedFolders, selectedDocs } = resolveSelectedObjects();
    if (selectedFolders.length === 1 && selectedDocs.length === 0 && isFolderOwnerOrAdmin(selectedFolders[0])) {
      modals.actions.openEditFolder(selectedFolders[0]);
    } else if (selectedDocs.length === 1 && selectedFolders.length === 0 && (getDocPerms(selectedDocs[0]).canEdit || canManageDocuments)) {
      modals.actions.openEditDoc(selectedDocs[0]);
    }
  }, [resolveSelectedObjects, isFolderOwnerOrAdmin, getDocPerms, canManageDocuments, modals.actions]);

  const handleConfirmDelete = useCallback(async () => {
    const { deleteModal } = modals.state;
    if (isSharedSection && !canManageDocuments) {
      toast.error('Bạn không có quyền xóa trong mục Được chia sẻ với tôi');
      return void modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false }));
    }
    const targets: BulkDeleteTarget[] = deleteModal.items?.length
      ? deleteModal.items
      : [{ type: deleteModal.type === 'folder' ? 'folder' : 'document', id: deleteModal.id, name: deleteModal.name }];
    try {
      modals.setters.setDeleteModal((prev) => ({ ...prev, loading: true }));
      await executeExplorerBulkDelete(targets, currentFolderId, queryClient, handleGoBack);
      clearSelection();
      modals.setters.setDeleteModal((prev) => ({ ...prev, isOpen: false, loading: false }));
    } catch (error: unknown) {
      showErrorToast(error, 'Lỗi khi xóa');
      modals.setters.setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  }, [modals, isSharedSection, canManageDocuments, currentFolderId, handleGoBack, clearSelection, queryClient]);

  const handleDropItem = useCallback(
    async (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => {
      if (sourceType === 'folder' && sourceId === targetFolderId) return;
      if (isSharedSection && !canManageDocuments) return void toast.error('Bạn không có quyền di chuyển trong mục Được chia sẻ với tôi');
      const draggedKey = toExplorerItemKey(sourceType, sourceId);
      const isBulkDrag = selectedItemKeys.has(draggedKey) && selectedItemKeys.size > 1;
      const entries = buildClipboardEntries(isBulkDrag ? selectedItemKeys : new Set([draggedKey])).filter(
        (it) => it.canMove && (it.type !== 'folder' || (it.id !== targetFolderId && !isDescendant(safeCategoryTree, it.id, targetFolderId))),
      );
      if (entries.length === 0) return;
      try {
        await executeExplorerDrop(entries, targetFolderId, queryClient);
      } catch (error: unknown) {
        showErrorToast(error, 'Lỗi khi di chuyển');
      }
    },
    [isSharedSection, canManageDocuments, selectedItemKeys, buildClipboardEntries, isDescendant, safeCategoryTree, queryClient],
  );

  const handleRemoveFromFolder = useCallback(
    async (doc: DocumentItem) => {
      if (!currentFolderId) return;
      try {
        await removeDocumentFromFolder(doc.id, currentFolderId);
        toast.success(`Đã gỡ tài liệu "${doc.title}" khỏi thư mục này`);
        invalidateDocumentQueries(queryClient);
      } catch (error: unknown) {
        showErrorToast(error, 'Không thể gỡ tài liệu khỏi thư mục');
      }
    },
    [currentFolderId, queryClient],
  );

  const hotkeyActionsRef = useRef({
    hasOpenModal: modals.hasOpenModal,
    hasContextMenu: contextMenu.isOpen,
    selectedCount: selectedItemKeys.size,
    hasClipboard: Boolean(clipboard?.items.length),
    onCloseContextMenu: closeContextMenu,
    onClearSelection: clearSelection,
    onClearClipboard: clearClipboard,
    onSelectAll: () => selectAll(orderedKeys),
    onCopySelected: handleCopySelected,
    onCutSelected: handleCutSelected,
    onPasteToCurrentFolder: () => void pasteItems(currentFolderId),
    onDeleteSelected: handleOpenDeleteSelected,
    onOpenFocusedItem: handleOpenFocusedItem,
    onRenameFocusedItem: handleRenameFocusedItem,
  });

  useEffect(() => {
    hotkeyActionsRef.current = {
      hasOpenModal: modals.hasOpenModal,
      hasContextMenu: contextMenu.isOpen,
      selectedCount: selectedItemKeys.size,
      hasClipboard: Boolean(clipboard?.items.length),
      onCloseContextMenu: closeContextMenu,
      onClearSelection: clearSelection,
      onClearClipboard: clearClipboard,
      onSelectAll: () => selectAll(orderedKeys),
      onCopySelected: handleCopySelected,
      onCutSelected: handleCutSelected,
      onPasteToCurrentFolder: () => void pasteItems(currentFolderId),
      onDeleteSelected: handleOpenDeleteSelected,
      onOpenFocusedItem: handleOpenFocusedItem,
      onRenameFocusedItem: handleRenameFocusedItem,
    };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => handleExplorerKeyDown(e, hotkeyActionsRef.current);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handlePasteToCurrentFolder = useCallback(
    () => void pasteItems(currentFolderId),
    [pasteItems, currentFolderId],
  );

  const handlePasteIntoFolder = useCallback(
    (folder: DocumentCategory) => void pasteItems(folder.id),
    [pasteItems],
  );

  return {
    orderedKeys, contextMenu, closeContextMenu, handleSelectItem,
    handleContextMenuFolder, handleContextMenuDoc, handleContextMenuBackground,
    isFolderOwnerOrAdmin, clipboard, isPasting, cutKeySet, clearClipboard,
    handleCopySelected, handleCutSelected, handleCopySingleDoc, handleCutSingleDoc, handleCutSingleFolder,
    handlePasteToCurrentFolder,
    handlePasteIntoFolder,
    handleOpenMoveSelected, handleOpenDeleteSelected, handleConfirmDelete, handleDropItem, handleRemoveFromFolder,
  };
}
