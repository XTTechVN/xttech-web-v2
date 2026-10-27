'use client';

import React, { forwardRef } from 'react';
import { Folder, FileText } from 'lucide-react';

export interface ExplorerDragBadgeProps {
  isDragging: boolean;
  count: number;
  title: string;
  type: 'folder' | 'document';
}

export const ExplorerDragBadge = forwardRef<HTMLDivElement, ExplorerDragBadgeProps>(
  ({ isDragging, count, title, type }, ref) => {
    if (!isDragging) return null;

    return (
      <div
        ref={ref}
        style={{
          top: 0,
          left: 0,
          contain: 'layout paint style',
        }}
        className="fixed pointer-events-none z-[9999] will-change-transform flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-primary/30 shadow-xl shadow-slate-900/15 select-none"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          {type === 'folder' ? (
            <Folder size={16} className="fill-primary/20 text-primary" />
          ) : (
            <FileText size={16} className="text-primary" />
          )}
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">
            {title}
          </span>
          <span className="text-[11px] font-medium text-primary">
            {count > 1 ? `Di chuyển ${count} mục` : 'Di chuyển 1 mục'}
          </span>
        </div>

        {count > 1 && (
          <span className="ml-1 w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow-xs shrink-0">
            {count}
          </span>
        )}
      </div>
    );
  }
);

ExplorerDragBadge.displayName = 'ExplorerDragBadge';
