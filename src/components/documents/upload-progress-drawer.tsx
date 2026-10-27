'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  FileText,
  FolderUp,
  FolderArchive,
} from 'lucide-react';

export type UploadItemStatus = 'pending' | 'compressing' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface QueueUploadItem {
  id: string;
  file?: File;
  relativePath?: string;
  targetCategoryId?: number | null;
  title: string;
  size: number;
  progress: number;
  status: UploadItemStatus;
  errorMessage?: string;
  abortController?: AbortController;
  direction?: 'upload' | 'download';
}

interface UploadProgressDrawerProps {
  items: QueueUploadItem[];
  isOpen: boolean;
  onClose: () => void;
  onRetryItem: (id: string) => void;
  onCancelItem: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const UploadProgressDrawer: React.FC<UploadProgressDrawerProps> = ({
  items,
  isOpen,
  onClose,
  onRetryItem,
  onCancelItem,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen || items.length === 0) return null;

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.status === 'success').length;
  const errorCount = items.filter((i) => i.status === 'error').length;
  const isAllFinished = items.every((i) => i.status === 'success' || i.status === 'error' || i.status === 'cancelled');

  const hasDownload = items.some((i) => i.direction === 'download');
  const isAllDownload = items.every((i) => i.direction === 'download');
  const isCompressing = items.some((i) => i.status === 'compressing');

  const totalBytes = items.reduce((acc, it) => acc + it.size, 0);
  const loadedBytes = items.reduce((acc, it) => {
    if (it.status === 'success') return acc + it.size;
    if (it.status === 'uploading') return acc + Math.round((it.size * it.progress) / 100);
    return acc;
  }, 0);
  const totalPercent = totalBytes > 0 ? Math.round((loadedBytes * 100) / totalBytes) : 0;

  const getHeaderTitle = () => {
    if (isAllDownload) {
      if (!isAllFinished) {
        if (isCompressing && loadedBytes === 0) return 'Đang chuẩn bị tải xuống';
        return totalCount === 1 ? 'Đang tải xuống...' : `Đang tải xuống (${completedCount}/${totalCount})`;
      }
      if (errorCount > 0) return totalCount === 1 ? 'Tải xuống thất bại' : `Tải xuống hoàn tất với ${errorCount} lỗi`;
      return totalCount === 1 ? 'Đã hoàn tất tải xuống' : `Đã hoàn tất tải xuống ${completedCount} mục`;
    }
    if (hasDownload) {
      if (!isAllFinished) return `Đang truyền tải (${completedCount}/${totalCount})`;
      return errorCount > 0 ? `Hoàn tất với ${errorCount} lỗi` : `Đã hoàn tất ${completedCount} mục`;
    }
    if (!isAllFinished) return `Đang tải lên (${completedCount}/${totalCount})`;
    return errorCount > 0 ? `Hoàn tất với ${errorCount} tệp lỗi` : `Đã tải lên ${completedCount} tệp`;
  };

  return (
    <aside
      aria-label="Tiến trình truyền tải tài liệu"
      className="fixed bottom-4 right-4 z-[9990] w-96 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col select-none animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {!isAllFinished ? (
            <Loader2 size={16} className="text-primary animate-spin shrink-0" />
          ) : errorCount > 0 ? (
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          )}

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">
              {getHeaderTitle()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {!isAllFinished
                ? isCompressing && totalBytes === 0
                  ? 'Đang chuẩn bị dữ liệu...'
                  : `${totalPercent}% • ${formatFileSize(loadedBytes)} / ${formatFileSize(totalBytes)}`
                : 'Đã hoàn tất truyền tải'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            aria-label={isMinimized ? 'Mở rộng bảng tiến trình' : 'Thu nhỏ bảng tiến trình'}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng tiến trình"
            className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Overall Progress Bar */}
      {!isAllFinished && (
        <div className="h-1 bg-slate-800 w-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${totalPercent}%` }}
          />
        </div>
      )}

      {/* Body List */}
      {!isMinimized && (
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 bg-white">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                  {item.status === 'success' ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : item.status === 'error' ? (
                    <AlertCircle size={16} className="text-rose-500" />
                  ) : item.status === 'compressing' || item.status === 'uploading' ? (
                    <Loader2 size={15} className="text-primary animate-spin" />
                  ) : item.direction === 'download' ? (
                    <FolderArchive size={15} className="text-amber-600" />
                  ) : item.relativePath?.includes('/') ? (
                    <FolderUp size={15} className="text-primary" />
                  ) : (
                    <FileText size={15} className="text-slate-500" />
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium text-slate-800 truncate" title={item.title}>
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    {item.status === 'compressing' ? (
                      <span className="text-primary font-medium">Đang nén...</span>
                    ) : (
                      <>
                        {item.size > 0 && <span>{formatFileSize(item.size)}</span>}
                        {item.status === 'uploading' && (
                          <span className="text-primary font-semibold">
                            • {item.progress}%
                          </span>
                        )}
                        {item.status === 'success' && (
                          <span className="text-emerald-600 font-medium">
                            {item.direction === 'download' ? 'Đã tải về máy' : 'Đã tải lên'}
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-rose-500 font-medium truncate max-w-[140px]">
                            • {item.errorMessage || 'Lỗi'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="shrink-0 flex items-center">
                {item.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => onRetryItem(item.id)}
                    className="p-1 rounded-md hover:bg-slate-100 text-primary transition-colors"
                    title="Thử lại"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                {(item.status === 'pending' || item.status === 'compressing' || item.status === 'uploading') && (
                  <button
                    type="button"
                    onClick={() => onCancelItem(item.id)}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Hủy bỏ"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};
