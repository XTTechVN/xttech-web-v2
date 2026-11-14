'use client';

import React from 'react';
import { Loader2, Save } from 'lucide-react';

interface StudioModalFooterProps {
  sketchMode: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function StudioModalFooter({
  sketchMode,
  isSaving,
  onClose,
  onSave,
}: StudioModalFooterProps) {
  return (
    <div className="flex items-center justify-between w-full px-2 py-1">
      <div className="text-xs text-slate-500 hidden sm:block truncate pr-2">
        {sketchMode
          ? 'Phác thảo mặt đứng 2D minh họa (không tính bóc tách nhôm)'
          : 'Bản vẽ CAD vector và bảng bóc tách tự động cập nhật'}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          Đóng
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4.5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{sketchMode ? 'Lưu phác thảo' : 'Lưu thiết kế'}</span>
        </button>
      </div>
    </div>
  );
}
