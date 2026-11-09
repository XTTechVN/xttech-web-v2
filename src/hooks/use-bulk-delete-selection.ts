'use client';

import { useState, useMemo, useCallback } from 'react';

export function useBulkDeleteSelection<T extends { id: number }>(items: T[]) {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [rawSelectedIds, setRawSelectedIds] = useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const visibleIdSet = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const selectedIds = useMemo(
    () => rawSelectedIds.filter((id) => visibleIdSet.has(id)),
    [rawSelectedIds, visibleIdSet],
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const totalCount = items.length;
  const selectedCount = selectedIds.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const enterBulkMode = useCallback(() => {
    setIsBulkMode(true);
    setRawSelectedIds([]);
  }, []);

  const exitBulkMode = useCallback(() => {
    setIsBulkMode(false);
    setRawSelectedIds([]);
    setIsConfirmOpen(false);
  }, []);

  const clearSelection = useCallback(() => {
    setRawSelectedIds([]);
  }, []);

  const toggleSelect = useCallback((id: number) => {
    setRawSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setRawSelectedIds((prev) => {
      const currentVisibleSelected = prev.filter((id) => visibleIdSet.has(id));
      if (items.length > 0 && currentVisibleSelected.length === items.length) {
        return [];
      }
      return items.map((item) => item.id);
    });
  }, [items, visibleIdSet]);

  return {
    isBulkMode,
    isConfirmOpen,
    setIsConfirmOpen,
    selectedIds,
    selectedIdSet,
    selectedCount,
    totalCount,
    isAllSelected,
    isPartiallySelected,
    enterBulkMode,
    exitBulkMode,
    clearSelection,
    toggleSelect,
    toggleSelectAll,
  };
}

