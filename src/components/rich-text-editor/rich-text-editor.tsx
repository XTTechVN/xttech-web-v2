'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Underline,
  Video,
} from 'lucide-react';
import { escapeHtml } from '@/utils/html';
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
  paperMode?: boolean;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  onInsertMediaFiles?: (files: File[]) => InsertedMediaItem[];
  enableYoutubeEmbed?: boolean;
}

interface ToolbarAction {
  command: string;
  title: string;
  icon: React.ReactNode;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { command: 'bold', title: 'In đậm (Ctrl+B)', icon: <Bold size={14} /> },
  { command: 'italic', title: 'In nghiêng (Ctrl+I)', icon: <Italic size={14} /> },
  { command: 'underline', title: 'Gạch chân (Ctrl+U)', icon: <Underline size={14} /> },
  { command: 'justifyLeft', title: 'Căn trái', icon: <AlignLeft size={14} /> },
  { command: 'justifyCenter', title: 'Căn giữa tiêu đề / chương mục', icon: <AlignCenter size={14} /> },
  { command: 'justifyRight', title: 'Căn phải', icon: <AlignRight size={14} /> },
  { command: 'justifyFull', title: 'Căn đều hai bên', icon: <AlignJustify size={14} /> },
  { command: 'insertUnorderedList', title: 'Danh sách gạch đầu dòng', icon: <List size={14} /> },
  { command: 'insertOrderedList', title: 'Danh sách đánh số', icon: <ListOrdered size={14} /> },
];

const MEDIA_CONTENT_STYLES = `
  [&_figure]:my-4 [&_figure]:mx-auto [&_figcaption]:text-xs [&_figcaption]:text-slate-500
  [&_figcaption]:italic [&_figcaption]:text-center [&_figcaption]:mt-1.5
  [&_img]:max-w-full [&_img]:rounded-lg [&_img]:mx-auto
  [&_video]:max-w-full [&_video]:rounded-lg [&_video]:mx-auto
  [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:mx-auto [&_iframe]:border-0 [&_iframe]:shadow-sm
  [&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2.5`;

const CONTENT_CLASS = `p-3.5 text-xs leading-[1.6] text-slate-800 focus:outline-hidden overflow-y-auto no-scrollbar
  [&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-1.5 [&_ol]:pl-5 [&_ol]:list-decimal
  [&_li]:my-0.5 [&_strong]:font-bold [&_u]:underline [&_em]:italic
  [&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-2 [&_h4]:text-xs [&_h4]:font-bold [&_h4]:my-1.5 ${MEDIA_CONTENT_STYLES}`;

const PAPER_CONTENT_CLASS = `min-h-[260px] text-[13.5px] leading-[1.7] text-slate-900 focus:outline-hidden font-sans
  [&_p]:my-2 [&_ul]:my-2 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-6 [&_ol]:list-decimal
  [&_li]:my-1 [&_strong]:font-bold [&_u]:underline [&_em]:italic
  [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:my-2.5 [&_h4]:text-[14px] [&_h4]:font-bold [&_h4]:my-2 ${MEDIA_CONTENT_STYLES}`;

// Trình soạn thảo văn bản có định dạng (HTML) dùng chung, điều khiển qua value/onChange
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  isReadOnly = false,
  minHeightClass = 'min-h-48 max-h-96',
  paperMode = false,
  headerSlot,
  footerSlot,
  onInsertMediaFiles,
  enableYoutubeEmbed = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isYoutubePopoverOpen, setIsYoutubePopoverOpen] = useState(false);
  const canEmbedYoutube = Boolean(onInsertMediaFiles || enableYoutubeEmbed);

  // Đồng bộ nội dung từ ngoài vào vùng soạn thảo (không ghi đè khi chính người dùng đang gõ)
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value) editor.innerHTML = value;
  }, [value]);

  const saveSelectionRange = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
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
    document.execCommand(command, false, commandValue);
    saveSelectionRange();
    emitChange();
  };

  const handleMediaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !onInsertMediaFiles) return;

    const files = Array.from(fileList);
    const items = onInsertMediaFiles(files);
    e.target.value = '';
    if (!items || items.length === 0) return;

    const htmlChunks = items
      .map((item) => {
        const caption = escapeHtml(item.defaultCaption || 'Nhập chú thích...');
        const safeTempId = escapeHtml(item.tempId);
        const safeSrc = escapeHtml(item.previewUrl);
        if (item.mediaType === 'video') {
          return `<figure><video data-temp-id="${safeTempId}" src="${safeSrc}" controls playsinline preload="metadata"></video><figcaption>${caption}</figcaption></figure><p><br/></p>`;
        }
        return `<figure><img data-temp-id="${safeTempId}" src="${safeSrc}" alt="${caption}" /><figcaption>${caption}</figcaption></figure><p><br/></p>`;
      })
      .join('');

    insertHtmlAtCursor(htmlChunks);
  };

  const handleInsertYoutube = (embedUrl: string, caption: string) => {
    const safeCaption = escapeHtml(caption || 'Nhập chú thích video...');
    const htmlChunk = `<figure><iframe src="${embedUrl}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="true" loading="lazy" class="w-full aspect-video rounded-lg border-0"></iframe><figcaption>${safeCaption}</figcaption></figure><p><br/></p>`;
    insertHtmlAtCursor(htmlChunk);
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
      {!isReadOnly && (
        <>
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 border-b border-slate-200">
            {TOOLBAR_ACTIONS.map((action) => (
              <button
                key={action.command}
                type="button"
                title={action.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeCommand(action.command)}
                className="p-1.5 rounded hover:bg-white hover:shadow-xs text-gray-700 hover:text-primary transition-colors cursor-pointer bg-transparent border-0"
              >
                {action.icon}
              </button>
            ))}
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <select
              onChange={(e) => executeCommand('formatBlock', e.target.value)}
              defaultValue="p"
              className="text-xs h-7 px-2 bg-white border border-slate-200 rounded text-gray-700 focus:outline-hidden focus:border-primary cursor-pointer"
            >
              <option value="p">Văn bản thường</option>
              <option value="h2">Tiêu đề chương (H2)</option>
              <option value="h3">Tiêu đề lớn (H3)</option>
              <option value="h4">Tiêu đề vừa (H4)</option>
            </select>

            {(onInsertMediaFiles || canEmbedYoutube) && <div className="h-4 w-px bg-slate-300 mx-1" />}

            {onInsertMediaFiles && (
              <>
                <button
                  type="button"
                  title="Chèn Ảnh hoặc Video vào vị trí con trỏ"
                  onMouseDown={() => saveSelectionRange()}
                  onClick={() => mediaInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors cursor-pointer"
                >
                  <ImagePlus size={14} />
                  <span>Chèn Ảnh / Video</span>
                </button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaInputChange}
                  className="hidden"
                />
              </>
            )}

            {canEmbedYoutube && (
              <button
                type="button"
                title="Nhúng video YouTube kèm chú thích vào vị trí con trỏ"
                onMouseDown={() => saveSelectionRange()}
                onClick={() => setIsYoutubePopoverOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                  isYoutubePopoverOpen
                    ? 'bg-primary text-white border-primary'
                    : 'text-primary bg-primary/10 hover:bg-primary/15 border-primary/20'
                }`}
              >
                <Video size={14} />
                <span>Nhúng YouTube</span>
              </button>
            )}
          </div>

          <YoutubeEmbedPopover
            isOpen={isYoutubePopoverOpen}
            onClose={() => setIsYoutubePopoverOpen(false)}
            onConfirm={handleInsertYoutube}
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
          onKeyUp={saveSelectionRange}
          onMouseUp={saveSelectionRange}
          onBlur={() => {
            saveSelectionRange();
            emitChange();
          }}
          className={`${minHeightClass} ${CONTENT_CLASS} ${isReadOnly ? 'bg-slate-50/60' : ''}`}
          style={{ wordBreak: 'break-word' }}
        />
      )}
    </div>
  );
}
