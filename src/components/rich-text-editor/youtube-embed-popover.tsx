'use client';

import React, { useState } from 'react';
import { Check, Link2, Video, X } from 'lucide-react';
import { extractYoutubeEmbedUrl } from '@/utils/html';

export interface YoutubeEmbedPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (embedUrl: string, caption: string) => void;
}

export function YoutubeEmbedPopover({ isOpen, onClose, onConfirm }: YoutubeEmbedPopoverProps) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const embedUrl = extractYoutubeEmbedUrl(url);
    if (!embedUrl) {
      setError(
        'Đường dẫn YouTube không hợp lệ. Hỗ trợ dạng youtube.com/watch?v=..., youtu.be/... hoặc youtube.com/shorts/...',
      );
      return;
    }

    onConfirm(embedUrl, caption.trim() || 'Nhập chú thích video...');
    setUrl('');
    setCaption('');
    setError(null);
    onClose();
  };

  const handleCancel = () => {
    setUrl('');
    setCaption('');
    setError(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="p-3 bg-primary/5 border-b border-primary/20 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Video className="w-3.5 h-3.5" />
          <span>Nhúng video YouTube vào vị trí con trỏ</span>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          title="Đóng"
          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-6 relative">
          <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Dán link YouTube (vd: https://youtu.be/...)"
            autoFocus
            className="w-full h-8 pl-8 pr-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-900"
          />
        </div>

        <div className="sm:col-span-4">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chú thích dưới video (tùy chọn)..."
            className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-900"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full h-8 px-2.5 rounded-md text-xs font-semibold text-white bg-primary hover:bg-primary/90 inline-flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Chèn</span>
          </button>
        </div>
      </div>

      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}
