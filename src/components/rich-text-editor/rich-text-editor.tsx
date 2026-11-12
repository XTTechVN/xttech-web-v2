'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { escapeHtml, normalizePastedHtml, sanitizeNewsHtml } from '@/utils/html';
import { ColorPickerPopover } from './color-picker-popover';
import { EditorToolbar } from './editor-toolbar';
import { LinkInsertPopover } from './link-insert-popover';
import { MediaSelectionOverlay, useMediaControls } from './media-controls';
import { CONTENT_CLASS, PAPER_CONTENT_CLASS } from './rich-text-editor.constants';
import {
  applyEditorHighlightColor,
  applyEditorTextColor,
  buildMediaHtmlChunks,
  buildYoutubeEmbedHtml,
  clearEditorSelectionFormatting,
  countEditorWordsAndChars,
} from './rich-text-editor.utils';
import { YoutubeEmbedPopover } from './youtube-embed-popover';

export interface InsertedMediaItem {
  tempId: string;
  previewUrl: string;
  mediaType: 'image' | 'video';
  defaultCaption?: string;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  isReadOnly?: boolean;
  minHeightClass?: string;
  fullHeight?: boolean;
  showStatusBar?: boolean;
  paperMode?: boolean;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  onInsertMediaFiles?: (files: File[]) => InsertedMediaItem[];
  enableYoutubeEmbed?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  isReadOnly = false,
  minHeightClass = 'min-h-48 max-h-96',
  fullHeight = false,
  showStatusBar = true,
  paperMode = false,
  headerSlot,
  footerSlot,
  onInsertMediaFiles,
  enableYoutubeEmbed = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [activePopover, setActivePopover] = useState<'color' | 'link' | 'youtube' | null>(null);

  const canEmbedYoutube = Boolean(onInsertMediaFiles || enableYoutubeEmbed);
  const stats = useMemo(() => countEditorWordsAndChars(value), [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value) editor.innerHTML = value;
  }, [value]);

  const saveSelectionRange = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelectionRange = () => {
    if (typeof window === 'undefined' || !savedRangeRef.current || !editorRef.current) return false;
    if (!editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
    return true;
  };

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const media = useMediaControls({
    editorRef,
    wrapperRef,
    enabled: !isReadOnly && !paperMode,
    onContentChange: emitChange,
  });

  const insertHtmlAtCursor = (htmlChunks: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (restoreSelectionRange()) {
      document.execCommand('insertHTML', false, htmlChunks);
    } else {
      editorRef.current.insertAdjacentHTML('beforeend', htmlChunks);
    }
    saveSelectionRange();
    emitChange();
  };

  const executeCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    restoreSelectionRange();
    document.execCommand(command, false, commandValue);
    saveSelectionRange();
    emitChange();
  };

  const runEditorDomUpdate = (fn: (el: HTMLElement) => void) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelectionRange();
    fn(editorRef.current);
    saveSelectionRange();
    emitChange();
  };

  const handleConfirmLink = (url: string, label?: string) => {
    const safeUrl = escapeHtml(url);
    if (label) {
      insertHtmlAtCursor(
        `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
      );
      return;
    }
    editorRef.current?.focus();
    if (restoreSelectionRange()) {
      document.execCommand('createLink', false, url);
      saveSelectionRange();
      emitChange();
    } else {
      insertHtmlAtCursor(
        `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`,
      );
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (isReadOnly) return;
    const htmlData = e.clipboardData?.getData('text/html') || '';
    const textData = e.clipboardData?.getData('text/plain') || '';

    if (htmlData.trim()) {
      e.preventDefault();
      saveSelectionRange();
      insertHtmlAtCursor(sanitizeNewsHtml(normalizePastedHtml(htmlData)));
    } else if (textData.trim()) {
      e.preventDefault();
      saveSelectionRange();
      insertHtmlAtCursor(escapeHtml(textData).replace(/\r?\n/g, '<br/>'));
    }
  };

  const handleMediaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !onInsertMediaFiles) return;
    const items = onInsertMediaFiles(Array.from(fileList));
    e.target.value = '';
    if (items?.length) insertHtmlAtCursor(buildMediaHtmlChunks(items));
  };

  const wrapperLayoutClass =
    fullHeight && !paperMode ? 'flex flex-col flex-1 min-h-0 h-full' : 'flex flex-col';
  const editableHeightClass =
    fullHeight && !paperMode ? 'flex-1 min-h-[320px] lg:min-h-0' : minHeightClass;

  return (
    <div
      ref={wrapperRef}
      className={`relative border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs ${wrapperLayoutClass}`}
    >
      {!isReadOnly && (
        <>
          <EditorToolbar
            onCommand={executeCommand}
            onClearFormatting={() => runEditorDomUpdate(clearEditorSelectionFormatting)}
            onSaveSelection={saveSelectionRange}
            isColorPopoverOpen={activePopover === 'color'}
            onToggleColorPopover={() =>
              setActivePopover((prev) => (prev === 'color' ? null : 'color'))
            }
            isLinkPopoverOpen={activePopover === 'link'}
            onToggleLinkPopover={() =>
              setActivePopover((prev) => (prev === 'link' ? null : 'link'))
            }
            isYoutubePopoverOpen={activePopover === 'youtube'}
            onToggleYoutubePopover={() =>
              setActivePopover((prev) => (prev === 'youtube' ? null : 'youtube'))
            }
            canInsertMedia={Boolean(onInsertMediaFiles)}
            onClickInsertMedia={() => mediaInputRef.current?.click()}
            canEmbedYoutube={canEmbedYoutube}
          />

          {onInsertMediaFiles && (
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaInputChange}
              className="hidden"
            />
          )}

          <ColorPickerPopover
            isOpen={activePopover === 'color'}
            onClose={() => setActivePopover(null)}
            onSelectTextColor={(color) => runEditorDomUpdate((el) => applyEditorTextColor(el, color))}
            onSelectHighlightColor={(color) =>
              runEditorDomUpdate((el) => applyEditorHighlightColor(el, color))
            }
            onClearAllFormatting={() => runEditorDomUpdate(clearEditorSelectionFormatting)}
          />

          <LinkInsertPopover
            isOpen={activePopover === 'link'}
            onClose={() => setActivePopover(null)}
            onConfirmLink={handleConfirmLink}
            onRemoveLink={() => executeCommand('unlink')}
          />

          <YoutubeEmbedPopover
            isOpen={activePopover === 'youtube'}
            onClose={() => setActivePopover(null)}
            onConfirm={(url, cap) => insertHtmlAtCursor(buildYoutubeEmbedHtml(url, cap))}
          />
        </>
      )}

      {paperMode ? (
        <div className="bg-slate-200/75 p-3 sm:p-6 max-h-[480px] overflow-y-auto">
          <div className="w-full max-w-[720px] h-fit min-h-[520px] mx-auto bg-white shadow-md border border-slate-300/80 rounded-sm px-6 sm:px-12 py-6 sm:py-8">
            {headerSlot}
            <div
              ref={editorRef}
              contentEditable={!isReadOnly}
              suppressContentEditableWarning
              data-placeholder={placeholder}
              onInput={emitChange}
              onPaste={handlePaste}
              onKeyUp={saveSelectionRange}
              onMouseUp={saveSelectionRange}
              onBlur={() => {
                saveSelectionRange();
                emitChange();
              }}
              className={`${PAPER_CONTENT_CLASS} ${isReadOnly ? 'bg-slate-50/60' : ''}`}
              style={{ wordBreak: 'break-word' }}
            />
            {footerSlot}
          </div>
        </div>
      ) : (
        <div
          ref={editorRef}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={emitChange}
          onPaste={handlePaste}
          onKeyUp={saveSelectionRange}
          onMouseUp={saveSelectionRange}
          onBlur={() => {
            saveSelectionRange();
            emitChange();
          }}
          className={`${editableHeightClass} ${CONTENT_CLASS} ${isReadOnly ? 'bg-slate-50/60' : ''}`}
          style={{ wordBreak: 'break-word' }}
        />
      )}

      {showStatusBar && !isReadOnly && (
        <div className="px-3 py-1.5 bg-slate-50/90 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
          <span>
            Tự động lọc sạch nền đen khi dán (Ctrl+V) • Nhấn{' '}
            <strong className="text-slate-700">Xóa nền / Format</strong> để làm sạch đoạn văn cũ
          </span>
          <span className="font-mono tabular-nums font-medium text-slate-600">
            {stats.words} từ • {stats.chars} ký tự
          </span>
        </div>
      )}

      {media.isActive && media.rect && (
        <MediaSelectionOverlay
          rect={media.rect}
          dropLine={media.dropLine}
          onSetAlign={media.setAlign}
          onSetWidth={media.setWidth}
          onMoveStep={media.moveStep}
          onRemove={media.removeFigure}
          onResizeStart={media.startResize}
          onMoveStart={media.startMove}
        />
      )}
    </div>
  );
}
