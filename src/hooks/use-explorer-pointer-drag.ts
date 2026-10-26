'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface DragItemInfo {
  type: 'folder' | 'document';
  id: number;
  title: string;
  canMove?: boolean;
}

export interface ExplorerPointerDragState {
  isDragging: boolean;
  count: number;
  title: string;
  sourceType: 'folder' | 'document';
  sourceId: number;
  hoverFolderId: number | null;
}

const initialDragState: ExplorerPointerDragState = {
  isDragging: false,
  count: 1,
  title: '',
  sourceType: 'folder',
  sourceId: 0,
  hoverFolderId: null,
};

interface UseExplorerPointerDragOptions {
  selectedItemKeys: Set<string>;
  onDropItem?: (sourceType: 'folder' | 'document', sourceId: number, targetFolderId: number) => void;
}

export function useExplorerPointerDrag({
  selectedItemKeys,
  onDropItem,
}: UseExplorerPointerDragOptions) {
  const [dragState, setDragState] = useState<ExplorerPointerDragState>(initialDragState);

  const trackingRef = useRef<{
    startX: number;
    startY: number;
    item: DragItemInfo;
    count: number;
    isStarted: boolean;
  } | null>(null);

  const badgeElementRef = useRef<HTMLDivElement | null>(null);
  const hoverFolderIdRef = useRef<number | null>(null);
  const lastPointerPosRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });
  const hitTestRafIdRef = useRef<number | null>(null);

  const onDropItemRef = useRef(onDropItem);
  const selectedItemKeysRef = useRef(selectedItemKeys);

  useEffect(() => {
    onDropItemRef.current = onDropItem;
    selectedItemKeysRef.current = selectedItemKeys;
  });

  const setBadgeRef = useCallback((node: HTMLDivElement | null) => {
    badgeElementRef.current = node;
    if (node) {
      const { clientX, clientY } = lastPointerPosRef.current;
      node.style.transform = `translate3d(${clientX + 6}px, ${clientY + 6}px, 0)`;
    }
  }, []);

  const handleGlobalPointerMove = useCallback((e: PointerEvent) => {
    const tracking = trackingRef.current;
    if (!tracking) return;

    lastPointerPosRef.current = { clientX: e.clientX, clientY: e.clientY };

    if (!tracking.isStarted) {
      const dist = Math.hypot(e.clientX - tracking.startX, e.clientY - tracking.startY);
      if (dist < 8) return;

      tracking.isStarted = true;
      setDragState({
        isDragging: true,
        count: tracking.count,
        title: tracking.item.title,
        sourceType: tracking.item.type,
        sourceId: tracking.item.id,
        hoverFolderId: null,
      });
    }

    // Tầng 1: Cập nhật vị trí Badge trực tiếp qua GPU hardware compositing (0ms lag, 144FPS)
    if (badgeElementRef.current) {
      badgeElementRef.current.style.transform = `translate3d(${e.clientX + 6}px, ${e.clientY + 6}px, 0)`;
    }

    // Tầng 2 & 3: Throttled Hit-Test & Zero-Render Gate qua requestAnimationFrame
    if (!hitTestRafIdRef.current) {
      hitTestRafIdRef.current = requestAnimationFrame(() => {
        hitTestRafIdRef.current = null;
        const currentTracking = trackingRef.current;
        if (!currentTracking || !currentTracking.isStarted) return;

        const { clientX, clientY } = lastPointerPosRef.current;
        const el = document.elementFromPoint(clientX, clientY);
        const targetFolderEl = el?.closest('[data-folder-id]') as HTMLElement | null;
        let targetId: number | null = targetFolderEl
          ? Number(targetFolderEl.getAttribute('data-folder-id'))
          : null;

        if (targetId !== null) {
          // Disallow dropping on itself or dropping on any currently selected folder
          if (currentTracking.item.type === 'folder' && targetId === currentTracking.item.id) {
            targetId = null;
          } else if (selectedItemKeysRef.current.has(`folder-${targetId}`)) {
            targetId = null;
          }
        }

        // Zero-Render Gate: CHỈ kích hoạt re-render khi target ID thực sự thay đổi
        if (targetId !== hoverFolderIdRef.current) {
          hoverFolderIdRef.current = targetId;
          setDragState((prev) => (prev.hoverFolderId === targetId ? prev : { ...prev, hoverFolderId: targetId }));
        }
      });
    }
  }, []);

  const cleanupListeners = useCallback(() => {
    window.removeEventListener('pointermove', handleGlobalPointerMove);
    window.removeEventListener('pointerup', handleGlobalPointerUp);
    window.removeEventListener('pointercancel', handleGlobalPointerUp);

    if (hitTestRafIdRef.current) {
      cancelAnimationFrame(hitTestRafIdRef.current);
      hitTestRafIdRef.current = null;
    }
  }, [handleGlobalPointerMove]);

  function handleGlobalPointerUp() {
    const tracking = trackingRef.current;
    const hoverFolderId = hoverFolderIdRef.current;

    cleanupListeners();
    trackingRef.current = null;
    hoverFolderIdRef.current = null;

    if (tracking?.isStarted && hoverFolderId !== null) {
      onDropItemRef.current?.(tracking.item.type, tracking.item.id, hoverFolderId);
    }

    setDragState(initialDragState);
  }

  const startDragTracking = useCallback(
    (e: React.PointerEvent, item: DragItemInfo) => {
      if (e.button !== 0) return;
      if (item.canMove === false) return;

      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, [role="button"], [data-no-select="true"]')) return;

      const itemKey = `${item.type === 'folder' ? 'folder' : 'doc'}-${item.id}`;
      const isSelected = selectedItemKeysRef.current.has(itemKey);
      const count = isSelected && selectedItemKeysRef.current.size > 1 ? selectedItemKeysRef.current.size : 1;

      trackingRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        item,
        count,
        isStarted: false,
      };

      lastPointerPosRef.current = { clientX: e.clientX, clientY: e.clientY };
      hoverFolderIdRef.current = null;

      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
      window.addEventListener('pointercancel', handleGlobalPointerUp);
    },
    [handleGlobalPointerMove, cleanupListeners],
  );

  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);

  return {
    dragState,
    startDragTracking,
    badgeRef: setBadgeRef,
  };
}
