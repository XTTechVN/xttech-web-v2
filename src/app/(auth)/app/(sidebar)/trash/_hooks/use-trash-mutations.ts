'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { restoreTrashItem, purgeTrashItem, emptyTrash } from '@/actions/trash';
import type { TrashItem } from '@/types';
import { invalidateDocumentQueries } from '@/utils';
import { getTrashItemDisplayName, type TrashContextMenuState } from '../_utils/trash-helpers';

export type TrashModalMode = 'single' | 'bulk' | 'emptyAll';

interface UseTrashMutationsProps {
  queryClient: QueryClient;
  currentFolderId: number | null;
  setCurrentFolderId: (id: number | null) => void;
  selectedItems: TrashItem[];
  selectedCount: number;
  orderedKeys: string[];
  contextMenu: TrashContextMenuState;
  closeContextMenu: () => void;
  clearSelection: () => void;
  selectAll: (orderedKeys: string[]) => void;
  handleGoBack: () => void;
}

export function useTrashMutations({
  queryClient,
  currentFolderId,
  setCurrentFolderId,
  selectedItems,
  selectedCount,
  orderedKeys,
  contextMenu,
  closeContextMenu,
  clearSelection,
  selectAll,
  handleGoBack,
}: UseTrashMutationsProps) {
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    mode: TrashModalMode;
    items: TrashItem[];
  }>({ isOpen: false, mode: 'single', items: [] });

  const [purgeModal, setPurgeModal] = useState<{
    isOpen: boolean;
    mode: TrashModalMode;
    items: TrashItem[];
  }>({ isOpen: false, mode: 'single', items: [] });

  const [activeRestoringId, setActiveRestoringId] = useState<number | null>(null);
  const [activePurgingId, setActivePurgingId] = useState<number | null>(null);

  const openSingleRestore = useCallback((item: TrashItem) => {
    setRestoreModal({ isOpen: true, mode: 'single', items: [item] });
  }, []);

  const openBulkRestore = useCallback(() => {
    if (selectedItems.length === 0) return;
    setRestoreModal({
      isOpen: true,
      mode: selectedItems.length === 1 ? 'single' : 'bulk',
      items: selectedItems,
    });
  }, [selectedItems]);

  const openSinglePurge = useCallback((item: TrashItem) => {
    setPurgeModal({ isOpen: true, mode: 'single', items: [item] });
  }, []);

  const openBulkPurge = useCallback(() => {
    if (selectedItems.length === 0) return;
    setPurgeModal({
      isOpen: true,
      mode: selectedItems.length === 1 ? 'single' : 'bulk',
      items: selectedItems,
    });
  }, [selectedItems]);

  const openEmptyTrashModal = useCallback(() => {
    setPurgeModal({ isOpen: true, mode: 'emptyAll', items: [] });
  }, []);

  const restoreMutation = useMutation({
    mutationFn: async (items: TrashItem[]) => {
      if (items.length === 1) setActiveRestoringId(items[0].id);
      for (const it of items) {
        await restoreTrashItem({ itemType: it.itemType, itemId: it.id });
      }
      return items;
    },
    onSuccess: (items) => {
      if (items.length === 1) {
        const it = items[0];
        toast.success(
          `Đã khôi phục ${it.itemType === 'folder' ? 'thư mục' : 'tài liệu'} "${getTrashItemDisplayName(it)}" thành công!`,
        );
      } else {
        toast.success(`Đã khôi phục ${items.length} mục thành công!`);
      }
      if (items.some((it) => it.itemType === 'folder' && it.id === currentFolderId)) {
        handleGoBack();
      }
      clearSelection();
      setRestoreModal((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể khôi phục mục đã chọn');
    },
    onSettled: () => {
      setActiveRestoringId(null);
      invalidateDocumentQueries(queryClient);
    },
  });

  const purgeMutation = useMutation({
    mutationFn: async (payload: { mode: TrashModalMode; items: TrashItem[] }) => {
      if (payload.mode === 'emptyAll') {
        await emptyTrash();
        return payload;
      }
      if (payload.items.length === 1) setActivePurgingId(payload.items[0].id);
      for (const it of payload.items) {
        await purgeTrashItem({ itemType: it.itemType, itemId: it.id });
      }
      return payload;
    },
    onSuccess: ({ mode, items }) => {
      if (mode === 'emptyAll') {
        toast.success('Đã dọn sạch toàn bộ thùng rác!');
        setCurrentFolderId(null);
      } else if (items.length === 1) {
        const it = items[0];
        toast.success(
          `Đã xóa vĩnh viễn ${it.itemType === 'folder' ? 'thư mục' : 'tài liệu'} "${getTrashItemDisplayName(it)}"!`,
        );
      } else {
        toast.success(`Đã xóa vĩnh viễn ${items.length} mục!`);
      }
      if (items.some((it) => it.itemType === 'folder' && it.id === currentFolderId)) {
        handleGoBack();
      }
      clearSelection();
      setPurgeModal((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể xóa vĩnh viễn');
    },
    onSettled: () => {
      setActivePurgingId(null);
      invalidateDocumentQueries(queryClient);
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (restoreModal.isOpen || purgeModal.isOpen) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'Escape') {
        if (contextMenu.isOpen) {
          e.preventDefault();
          closeContextMenu();
        } else if (selectedCount > 0) {
          e.preventDefault();
          clearSelection();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll(orderedKeys);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCount > 0) {
        e.preventDefault();
        openBulkPurge();
        return;
      }
      if (e.key === 'Enter' && selectedItems.length === 1 && selectedItems[0].itemType === 'folder') {
        e.preventDefault();
        setCurrentFolderId(selectedItems[0].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    restoreModal.isOpen, purgeModal.isOpen, contextMenu.isOpen, selectedCount,
    orderedKeys, selectedItems, closeContextMenu, clearSelection, selectAll, openBulkPurge, setCurrentFolderId,
  ]);

  return {
    restoreModal, setRestoreModal, purgeModal, setPurgeModal,
    openSingleRestore, openBulkRestore, openSinglePurge, openBulkPurge, openEmptyTrashModal,
    restoreMutation, purgeMutation, activeRestoringId, activePurgingId,
  };
}
