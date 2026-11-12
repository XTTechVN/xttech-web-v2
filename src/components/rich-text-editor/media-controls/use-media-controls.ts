'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import {
  MAX_UNDO_STEPS,
  MEDIA_DRAG_THRESHOLD_PX,
  clampWidthPercent,
  ensureEdgeParagraphs,
  findDropTarget,
  hoistFigure,
  readFigureAlign,
  readFigureWidthPercent,
  type FigureAlign,
} from './media-controls.utils';

export interface MediaOverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
  containerWidth: number;
  align: FigureAlign;
  widthPercent: number;
}

export interface MediaDropLine {
  top: number;
  left: number;
  width: number;
}

interface UseMediaControlsOptions {
  editorRef: RefObject<HTMLDivElement | null>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  onContentChange: () => void;
}

export function useMediaControls({
  editorRef,
  wrapperRef,
  enabled,
  onContentChange,
}: UseMediaControlsOptions) {
  const [hasSelection, setHasSelection] = useState(false);
  const [rect, setRect] = useState<MediaOverlayRect | null>(null);
  const [dropLine, setDropLine] = useState<MediaDropLine | null>(null);

  const selectedRef = useRef<HTMLElement | null>(null);
  const undoRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const canUndoMediaRef = useRef(false);
  const onChangeRef = useRef(onContentChange);

  useEffect(() => {
    onChangeRef.current = onContentChange;
  }, [onContentChange]);

  const clearSelection = useCallback(() => {
    selectedRef.current = null;
    setHasSelection(false);
    setRect(null);
  }, []);

  const refresh = useCallback(() => {
    const figure = selectedRef.current;
    const editor = editorRef.current;
    const wrapper = wrapperRef.current;
    if (!figure || !editor || !wrapper || !editor.contains(figure)) {
      clearSelection();
      return;
    }
    const figureRect = figure.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    setRect({
      top: figureRect.top - wrapperRect.top,
      left: figureRect.left - wrapperRect.left,
      width: figureRect.width,
      height: figureRect.height,
      containerWidth: wrapper.clientWidth,
      align: readFigureAlign(figure),
      widthPercent: readFigureWidthPercent(figure),
    });
  }, [clearSelection, editorRef, wrapperRef]);

  const pushUndoSnapshot = useCallback(
    (html: string) => {
      undoRef.current.push(html);
      if (undoRef.current.length > MAX_UNDO_STEPS) undoRef.current.shift();
      redoRef.current = [];
      canUndoMediaRef.current = true;
    },
    [],
  );

  const applyChange = useCallback(
    (mutate: (editor: HTMLElement, figure: HTMLElement) => void) => {
      const editor = editorRef.current;
      const figure = selectedRef.current;
      if (!editor || !figure) return;
      pushUndoSnapshot(editor.innerHTML);
      hoistFigure(editor, figure);
      mutate(editor, figure);
      ensureEdgeParagraphs(editor);
      onChangeRef.current();
      refresh();
    },
    [editorRef, pushUndoSnapshot, refresh],
  );

  const setAlign = useCallback(
    (align: FigureAlign) => applyChange((_, figure) => figure.setAttribute('data-align', align)),
    [applyChange],
  );

  const setWidth = useCallback(
    (percent: number) =>
      applyChange((_, figure) => {
        figure.style.width = `${clampWidthPercent(percent)}%`;
      }),
    [applyChange],
  );

  const moveStep = useCallback(
    (direction: 'up' | 'down') =>
      applyChange((_, figure) => {
        if (direction === 'up') figure.previousElementSibling?.before(figure);
        else figure.nextElementSibling?.after(figure);
        figure.scrollIntoView({ block: 'nearest' });
      }),
    [applyChange],
  );

  const removeFigure = useCallback(
    () => applyChange((_, figure) => figure.remove()),
    [applyChange],
  );

  const restoreSnapshot = useCallback(
    (from: string[], to: string[]) => {
      const editor = editorRef.current;
      const snapshot = from.pop();
      if (!editor || snapshot === undefined) return;
      to.push(editor.innerHTML);
      editor.innerHTML = snapshot;
      clearSelection();
      onChangeRef.current();
    },
    [clearSelection, editorRef],
  );

  const startResize = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const editor = editorRef.current;
      const figure = selectedRef.current;
      if (!editor || !figure) return;
      e.preventDefault();
      e.stopPropagation();

      const handle = e.currentTarget;
      handle.setPointerCapture(e.pointerId);
      pushUndoSnapshot(editor.innerHTML);
      hoistFigure(editor, figure);

      const parent = figure.parentElement ?? editor;
      const parentStyle = getComputedStyle(parent);
      const containerWidth =
        parent.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight);
      const startX = e.clientX;
      const startWidth = figure.getBoundingClientRect().width;
      const align = readFigureAlign(figure);
      const factor = align === 'right' || align === 'float-right' ? -1 : align === 'center' ? 2 : 1;

      const onMove = (ev: globalThis.PointerEvent) => {
        const nextWidth = startWidth + (ev.clientX - startX) * factor;
        figure.style.width = `${clampWidthPercent((nextWidth / containerWidth) * 100)}%`;
        refresh();
      };
      const onEnd = () => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onEnd);
        handle.removeEventListener('pointercancel', onEnd);
        ensureEdgeParagraphs(editor);
        onChangeRef.current();
        refresh();
      };
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onEnd);
      handle.addEventListener('pointercancel', onEnd);
    },
    [editorRef, pushUndoSnapshot, refresh],
  );

  const startMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const editor = editorRef.current;
      const wrapper = wrapperRef.current;
      const figure = selectedRef.current;
      if (!editor || !wrapper || !figure) return;
      e.preventDefault();
      e.stopPropagation();

      const grip = e.currentTarget;
      grip.setPointerCapture(e.pointerId);
      const htmlBefore = editor.innerHTML;
      hoistFigure(editor, figure);
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;

      const onMove = (ev: globalThis.PointerEvent) => {
        if (
          !moved &&
          Math.hypot(ev.clientX - startX, ev.clientY - startY) < MEDIA_DRAG_THRESHOLD_PX
        ) {
          return;
        }
        moved = true;
        const target = findDropTarget(editor, figure, ev.clientY);
        const wrapperRect = wrapper.getBoundingClientRect();
        const editorRect = editor.getBoundingClientRect();
        setDropLine({
          top: target.lineY - wrapperRect.top,
          left: editorRect.left - wrapperRect.left + 8,
          width: editorRect.width - 16,
        });
      };
      const onEnd = (ev: globalThis.PointerEvent) => {
        grip.removeEventListener('pointermove', onMove);
        grip.removeEventListener('pointerup', onEnd);
        grip.removeEventListener('pointercancel', onEnd);
        setDropLine(null);
        if (moved && ev.type === 'pointerup') {
          const target = findDropTarget(editor, figure, ev.clientY);
          pushUndoSnapshot(htmlBefore);
          editor.insertBefore(figure, target.reference);
          ensureEdgeParagraphs(editor);
        }
        onChangeRef.current();
        refresh();
      };
      grip.addEventListener('pointermove', onMove);
      grip.addEventListener('pointerup', onEnd);
      grip.addEventListener('pointercancel', onEnd);
    },
    [editorRef, wrapperRef, pushUndoSnapshot, refresh],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!enabled || !editor) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const figure = target?.closest('figure') as HTMLElement | null;
      if (!figure || !editor.contains(figure) || target?.closest('figcaption')) {
        clearSelection();
        return;
      }
      selectedRef.current = figure;
      setHasSelection(true);
      refresh();
    };

    const handleInput = () => {
      canUndoMediaRef.current = false;
      if (selectedRef.current) requestAnimationFrame(refresh);
    };

    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'IMG') e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const withModifier = e.ctrlKey || e.metaKey;

      if (key === 'escape' && selectedRef.current) {
        clearSelection();
        return;
      }
      if ((key === 'delete' || key === 'backspace') && selectedRef.current) {
        e.preventDefault();
        removeFigure();
        return;
      }
      if (!withModifier || !canUndoMediaRef.current) return;
      if (key === 'z' && !e.shiftKey && undoRef.current.length) {
        e.preventDefault();
        restoreSnapshot(undoRef.current, redoRef.current);
      } else if ((key === 'y' || (key === 'z' && e.shiftKey)) && redoRef.current.length) {
        e.preventDefault();
        restoreSnapshot(redoRef.current, undoRef.current);
      }
    };

    const handleOutsidePointerDown = (e: globalThis.PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) clearSelection();
    };

    const resizeObserver = new ResizeObserver(() => refresh());
    resizeObserver.observe(editor);

    editor.addEventListener('click', handleClick);
    editor.addEventListener('input', handleInput);
    editor.addEventListener('dragstart', handleDragStart);
    editor.addEventListener('keydown', handleKeyDown);
    editor.addEventListener('scroll', refresh);
    window.addEventListener('resize', refresh);
    document.addEventListener('pointerdown', handleOutsidePointerDown);

    return () => {
      resizeObserver.disconnect();
      editor.removeEventListener('click', handleClick);
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('dragstart', handleDragStart);
      editor.removeEventListener('keydown', handleKeyDown);
      editor.removeEventListener('scroll', refresh);
      window.removeEventListener('resize', refresh);
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [enabled, editorRef, wrapperRef, clearSelection, refresh, removeFigure, restoreSnapshot]);

  return {
    isActive: enabled && hasSelection && Boolean(rect),
    rect,
    dropLine,
    setAlign,
    setWidth,
    moveStep,
    removeFigure,
    startResize,
    startMove,
  };
}
