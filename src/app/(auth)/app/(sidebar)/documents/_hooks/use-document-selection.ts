import { useState, useEffect, useCallback } from 'react';

export function useDocumentSelection(currentFolderId: number | null, tab: string | null) {
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());

  const toggleSelectItem = useCallback((type: 'folder' | 'document', id: number) => {
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
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItemKeys(new Set());
  }, []);

  // Xóa selection khi đổi tab
  useEffect(() => {
    clearSelection();
  }, [tab, clearSelection]);

  // Xóa selection khi chuyển thư mục
  useEffect(() => {
    clearSelection();
  }, [currentFolderId, clearSelection]);

  // Bấm Escape để bỏ chọn
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItemKeys.size > 0) {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemKeys, clearSelection]);

  return {
    selectedItemKeys,
    toggleSelectItem,
    clearSelection,
  };
}
