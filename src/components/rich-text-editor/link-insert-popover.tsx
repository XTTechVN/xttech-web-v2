'use client';

import React, { useState } from 'react';
import { Check, Link2, Unlink, X } from 'lucide-react';

export interface LinkInsertPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLink: (url: string, label?: string) => void;
  onRemoveLink: () => void;
}

export function LinkInsertPopover({
  isOpen,
  onClose,
  onConfirmLink,
  onRemoveLink,
}: LinkInsertPopoverProps) {
  const [urlInput, setUrlInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setUrlInput('');
    setLabelInput('');
    setError(null);
    onClose();
  };

  const handleConfirm = () => {
    const raw = urlInput.trim();
    if (!raw) {
      setError('Vui lòng nhập đường dẫn URL (ví dụ: https://xttech.vn)');
      return;
    }
    const normalized = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(raw) ? raw : `https://${raw}`;
    onConfirmLink(normalized, labelInput.trim() || undefined);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <div className="px-3 py-2.5 bg-primary/5 border-b border-primary/20 space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary shrink-0">
          <Link2 size={14} />
          <span>Chèn liên kết:</span>
        </div>

        <input
          type="text"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Nhập URL (https://...)..."
          className="flex-1 min-w-0 h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:border-primary"
          autoFocus
        />

        <input
          type="text"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chữ hiển thị (tùy chọn)"
          className="sm:w-44 h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:border-primary"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1 px-3 h-8 rounded-md text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Check size={13} />
            <span>Chèn</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onRemoveLink();
              handleClose();
            }}
            title="Gỡ liên kết khỏi văn bản đang chọn"
            className="inline-flex items-center gap-1 px-2.5 h-8 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <Unlink size={13} />
            <span>Gỡ link</span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            title="Đóng"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}
