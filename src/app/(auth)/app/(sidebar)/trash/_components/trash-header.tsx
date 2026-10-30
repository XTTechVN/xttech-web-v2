'use client';

import React from 'react';
import { ArrowLeft, ChevronRight, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components';
import type { DocumentCategory } from '@/types';
import type { TrashBreadcrumbNode } from '../_utils/trash-helpers';

interface TrashHeaderProps {
  currentFolderId?: number | null;
  currentFolder?: DocumentCategory | null;
  parentFolder?: DocumentCategory | null;
  breadcrumbs?: TrashBreadcrumbNode[];
  folderCount?: number;
  docCount?: number;
  isLoading?: boolean;
  hasAnyTrash?: boolean;
  onGoBack?: () => void;
  onNavigateFolder?: (folderId: number | null) => void;
  onEmptyTrash?: () => void;
}

export const TrashHeader: React.FC<TrashHeaderProps> = ({
  currentFolderId = null,
  currentFolder = null,
  parentFolder = null,
  breadcrumbs = [],
  folderCount = 0,
  docCount = 0,
  isLoading = false,
  hasAnyTrash = false,
  onGoBack,
  onNavigateFolder,
  onEmptyTrash,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/70 flex-wrap">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {currentFolderId !== null && (
          <button
            type="button"
            onClick={onGoBack}
            className="h-8 w-8 sm:w-auto px-0 sm:px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 cursor-pointer shadow-2xs shrink-0 inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none"
            title={parentFolder ? `Quay lại ${parentFolder.name}` : 'Quay lại Thùng rác'}
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap leading-none">Quay lại</span>
          </button>
        )}

        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
          {currentFolderId !== null ? <FolderOpen size={16} /> : <Trash2 size={16} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 flex-wrap text-sm md:text-base font-bold text-slate-800 tracking-tight leading-tight">
            {currentFolderId === null ? (
              <span>Thùng rác</span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateFolder?.(null)}
                  className="text-slate-500 hover:text-primary font-semibold transition-colors cursor-pointer"
                >
                  Thùng rác
                </button>
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={crumb.id ?? idx}>
                      <ChevronRight size={14} className="text-slate-400 shrink-0" />
                      {isLast ? (
                        <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs">
                          {crumb.name}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigateFolder?.(crumb.id)}
                          className="text-slate-500 hover:text-primary font-semibold transition-colors truncate max-w-[160px] cursor-pointer"
                        >
                          {crumb.name}
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
                {breadcrumbs.length === 0 && currentFolder && (
                  <>
                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    <span className="text-slate-800 font-bold truncate">{currentFolder.name}</span>
                  </>
                )}
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {!isLoading && `${folderCount} thư mục • ${docCount} tài liệu`}
          </p>
        </div>
      </div>

      {hasAnyTrash && onEmptyTrash && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEmptyTrash}
          leftIcon={<Trash2 size={14} />}
          className="h-8 px-3 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 shrink-0 cursor-pointer"
        >
          Dọn sạch thùng rác
        </Button>
      )}
    </div>
  );
};
