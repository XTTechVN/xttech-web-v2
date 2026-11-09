'use client';

import React from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Video,
} from 'lucide-react';
import {
  ALIGN_AND_LIST_ACTION_ITEMS,
  BLOCK_FORMAT_OPTIONS,
  TEXT_STYLE_ACTION_ITEMS,
  type EditorToolbarIconKey,
} from './rich-text-editor.constants';

export interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onClearFormatting: () => void;
  onSaveSelection: () => void;
  isColorPopoverOpen: boolean;
  onToggleColorPopover: () => void;
  isLinkPopoverOpen: boolean;
  onToggleLinkPopover: () => void;
  isYoutubePopoverOpen: boolean;
  onToggleYoutubePopover: () => void;
  canInsertMedia: boolean;
  onClickInsertMedia: () => void;
  canEmbedYoutube: boolean;
}

const renderToolbarIcon = (iconKey: EditorToolbarIconKey): React.ReactNode => {
  switch (iconKey) {
    case 'bold':
      return <Bold size={14} />;
    case 'italic':
      return <Italic size={14} />;
    case 'underline':
      return <Underline size={14} />;
    case 'strikeThrough':
      return <Strikethrough size={14} />;
    case 'justifyLeft':
      return <AlignLeft size={14} />;
    case 'justifyCenter':
      return <AlignCenter size={14} />;
    case 'justifyRight':
      return <AlignRight size={14} />;
    case 'justifyFull':
      return <AlignJustify size={14} />;
    case 'insertUnorderedList':
      return <List size={14} />;
    case 'insertOrderedList':
      return <ListOrdered size={14} />;
  }
};

export function EditorToolbar({
  onCommand,
  onClearFormatting,
  onSaveSelection,
  isColorPopoverOpen,
  onToggleColorPopover,
  isLinkPopoverOpen,
  onToggleLinkPopover,
  isYoutubePopoverOpen,
  onToggleYoutubePopover,
  canInsertMedia,
  onClickInsertMedia,
  canEmbedYoutube,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200 shrink-0">
      {/* Hoàn tác / Làm lại */}
      <button
        type="button"
        title="Hoàn tác (Ctrl+Z)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand('undo')}
        className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-700 hover:text-primary transition-colors cursor-pointer"
      >
        <Undo2 size={14} />
      </button>
      <button
        type="button"
        title="Làm lại (Ctrl+Y)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand('redo')}
        className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-700 hover:text-primary transition-colors cursor-pointer"
      >
        <Redo2 size={14} />
      </button>

      <div className="h-4 w-px bg-slate-300 mx-0.5" />

      {/* Kiểu đoạn văn / Tiêu đề */}
      <select
        onMouseDown={() => onSaveSelection()}
        onChange={(e) => onCommand('formatBlock', e.target.value)}
        defaultValue="p"
        aria-label="Kiểu định dạng đoạn văn"
        className="text-xs h-7 px-2 bg-white border border-slate-200 rounded text-slate-700 focus:outline-hidden focus:border-primary cursor-pointer"
      >
        {BLOCK_FORMAT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="h-4 w-px bg-slate-300 mx-0.5" />

      {/* In đậm, nghiêng, gạch chân, gạch ngang */}
      {TEXT_STYLE_ACTION_ITEMS.map((action) => (
        <button
          key={action.command}
          type="button"
          title={action.title}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand(action.command)}
          className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-700 hover:text-primary transition-colors cursor-pointer"
        >
          {renderToolbarIcon(action.iconKey)}
        </button>
      ))}

      {/* Bảng Màu chữ & Màu nền */}
      <button
        type="button"
        title="Đổi màu chữ & màu nền (hoặc xóa nền đen)"
        onMouseDown={(e) => {
          e.preventDefault();
          onSaveSelection();
        }}
        onClick={onToggleColorPopover}
        className={`inline-flex items-center gap-1 px-2 h-7 rounded text-xs font-semibold transition-colors cursor-pointer border ${
          isColorPopoverOpen
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-slate-700 hover:text-primary border-slate-200 hover:border-primary/40'
        }`}
      >
        <Palette size={13} />
        <span>Màu chữ / Nền</span>
      </button>

      {/* Xóa định dạng & Làm sạch nền đen 1 chạm */}
      <button
        type="button"
        title="Xóa định dạng & làm sạch nền đen về mặc định"
        onMouseDown={(e) => {
          e.preventDefault();
          onSaveSelection();
        }}
        onClick={onClearFormatting}
        className="inline-flex items-center gap-1 px-2 h-7 rounded text-xs font-semibold text-rose-600 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200 transition-colors cursor-pointer"
      >
        <Eraser size={13} />
        <span>Xóa nền / Format</span>
      </button>

      <div className="h-4 w-px bg-slate-300 mx-0.5" />

      {/* Căn lề & Danh sách */}
      {ALIGN_AND_LIST_ACTION_ITEMS.map((action) => (
        <button
          key={action.command}
          type="button"
          title={action.title}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCommand(action.command)}
          className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-700 hover:text-primary transition-colors cursor-pointer"
        >
          {renderToolbarIcon(action.iconKey)}
        </button>
      ))}

      {/* Khối trích dẫn & Đường kẻ ngang */}
      <button
        type="button"
        title="Định dạng khối trích dẫn (Blockquote)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand('formatBlock', 'blockquote')}
        className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-700 hover:text-primary transition-colors cursor-pointer"
      >
        <Quote size={14} />
      </button>
      <button
        type="button"
        title="Chèn đường kẻ ngang phân cách"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onCommand('insertHorizontalRule')}
        className="p-1.5 rounded hover:bg-white hover:shadow-2xs text-slate-700 hover:text-primary transition-colors cursor-pointer"
      >
        <Minus size={14} />
      </button>

      {/* Chèn liên kết (Link) */}
      <button
        type="button"
        title="Chèn hoặc gỡ liên kết (URL)"
        onMouseDown={(e) => {
          e.preventDefault();
          onSaveSelection();
        }}
        onClick={onToggleLinkPopover}
        className={`p-1.5 rounded transition-colors cursor-pointer ${
          isLinkPopoverOpen
            ? 'bg-primary text-white'
            : 'hover:bg-white hover:shadow-2xs text-slate-700 hover:text-primary'
        }`}
      >
        <Link2 size={14} />
      </button>

      {(canInsertMedia || canEmbedYoutube) && <div className="h-4 w-px bg-slate-300 mx-0.5" />}

      {canInsertMedia && (
        <button
          type="button"
          title="Chèn Ảnh hoặc Video vào vị trí con trỏ"
          onMouseDown={() => onSaveSelection()}
          onClick={onClickInsertMedia}
          className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors cursor-pointer"
        >
          <ImagePlus size={14} />
          <span>Chèn Ảnh / Video</span>
        </button>
      )}

      {canEmbedYoutube && (
        <button
          type="button"
          title="Nhúng video YouTube kèm chú thích vào vị trí con trỏ"
          onMouseDown={() => onSaveSelection()}
          onClick={onToggleYoutubePopover}
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
  );
}
