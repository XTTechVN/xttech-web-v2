'use client';

import React, { useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface HtmlViewerProps {
  buffer: ArrayBuffer | null;
  isLoading: boolean;
  error: string | null;
  onDownload: () => void;
  compact?: boolean;
}

export const HtmlViewer: React.FC<HtmlViewerProps> = ({
  buffer,
  isLoading,
  error,
  onDownload,
  compact = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [zoom, setZoom] = useState(100);

  const htmlContent = useMemo(() => {
    if (!buffer) return '';
    try {
      return new TextDecoder('utf-8').decode(buffer);
    } catch {
      return '';
    }
  }, [buffer]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[320px] text-slate-400 gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Đang tải văn bản</span>
      </div>
    );
  }

  if (error || !htmlContent) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[320px] text-slate-400 gap-3 p-6 text-center">
        <p className="text-sm text-red-300">{error || 'Không thể hiển thị nội dung văn bản HTML.'}</p>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium cursor-pointer"
        >
          <Download size={14} /> Tải tệp về máy
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-200/80 rounded-block overflow-hidden border border-slate-300">
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 text-xs text-slate-700 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-600">Văn bản hành chính A4</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            className="flex size-9 items-center justify-center rounded-control text-slate-600 cursor-pointer md:hover:bg-slate-100 active:bg-slate-100"
            title="Thu nhỏ"
          >
            <ZoomOut size={14} />
          </button>
          <span className="tabular-nums text-xs w-12 text-center text-slate-700">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(140, z + 10))}
            className="flex size-9 items-center justify-center rounded-control text-slate-600 cursor-pointer md:hover:bg-slate-100 active:bg-slate-100"
            title="Phóng to"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            className="flex size-9 items-center justify-center rounded-control text-slate-600 cursor-pointer md:hover:bg-slate-100 active:bg-slate-100"
            title="Mặc định 100%"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-5 flex justify-center">
        <div
          style={{
            width: compact ? '100%' : `${Math.round((794 * zoom) / 100)}px`,
            minHeight: compact ? '520px' : `${Math.round((1123 * zoom) / 100)}px`,
          }}
          className="bg-white overflow-hidden"
        >
          <iframe
            ref={iframeRef}
            title="Xem trước văn bản A4"
            srcDoc={htmlContent}
            sandbox="allow-same-origin allow-modals"
            className="w-full h-full min-h-[680px] border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
};

