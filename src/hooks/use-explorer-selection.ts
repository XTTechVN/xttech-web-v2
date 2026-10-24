'use client';

import { useState, useCallback } from 'react';

export const toExplorerItemKey = (type: 'folder' | 'document', id: number): string =>
  `${type === 'folder' ? 'folder' : 'doc'}-${id}`;

export const parseExplorerItemKey = (
  key: string,
): { type: 'folder' | 'document'; id: number } | null => {
  const [prefix, rawId] = key.split('-');
  const id = Number(rawId);
  if (Number.isNaN(id)) return null;
  if (prefix === 'folder') return { type: 'folder', id };
  if (prefix === 'doc' || prefix === 'document') return { type: 'document', id };
  return null;
};

export function useExplorerSelection(currentFolderId: number | null, tab: string | null = null) {
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(() => new Set());
  const [lastSelectedKey, setLastSelectedKey] = useState<string | null>(null);

  const contextKey = `${tab ?? ''}::${currentFolderId ?? 'root'}`;
  const [prevContextKey, setPrevContextKey] = useState(contextKey);
  if (contextKey !== prevContextKey) {
    setPrevContextKey(contextKey);
    if (selectedItemKeys.size > 0) setSelectedItemKeys(new Set());
    if (lastSelectedKey !== null) setLastSelectedKey(null);
  }

  const toggleSelectItem = useCallback((type: 'folder' | 'document', id: number) => {
    const key = toExplorerItemKey(type, id);
    setSelectedItemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setLastSelectedKey(key);
  }, []);

  const selectSingleItem = useCallback((type: 'folder' | 'document', id: number) => {
    const key = toExplorerItemKey(type, id);
    setSelectedItemKeys(new Set([key]));
    setLastSelectedKey(key);
  }, []);

  const handleItemClick = useCallback(
    (
      e: React.MouseEvent,
      type: 'folder' | 'document',
      id: number,
      orderedKeys: string[] = [],
    ) => {
      e.stopPropagation();
      const key = toExplorerItemKey(type, id);

      if (e.shiftKey && lastSelectedKey && orderedKeys.length > 0) {
        const startIdx = orderedKeys.indexOf(lastSelectedKey);
        const endIdx = orderedKeys.indexOf(key);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          const rangeKeys = orderedKeys.slice(from, to + 1);
          setSelectedItemKeys((prev) => {
            const next = e.ctrlKey || e.metaKey ? new Set(prev) : new Set<string>();
            for (const k of rangeKeys) next.add(k);
            return next;
          });
          return;
        }
      }

      if (e.ctrlKey || e.metaKey) {
        toggleSelectItem(type, id);
        return;
      }

      selectSingleItem(type, id);
    },
    [lastSelectedKey, toggleSelectItem, selectSingleItem],
  );

  const handleContextMenuSelect = useCallback(
    (type: 'folder' | 'document', id: number): Set<string> => {
      const key = toExplorerItemKey(type, id);
      if (selectedItemKeys.has(key)) return selectedItemKeys;
      const next = new Set([key]);
      setSelectedItemKeys(next);
      setLastSelectedKey(key);
      return next;
    },
    [selectedItemKeys],
  );

  const selectAll = useCallback((orderedKeys: string[]) => {
    setSelectedItemKeys(new Set(orderedKeys));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItemKeys(new Set());
    setLastSelectedKey(null);
  }, []);

  return {
    selectedItemKeys,
    lastSelectedKey,
    toggleSelectItem,
    selectSingleItem,
    handleItemClick,
    handleContextMenuSelect,
    selectAll,
    clearSelection,
  };
}

export const useDocumentSelection = useExplorerSelection;
