'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Printer, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

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

  const handlePrint = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      win.focus();
      win.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[320px] text-slate-400 gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Đang tải văn bản chuẩn A4...</span>
      </div>
    );
  }

  if (error || !htmlContent) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[320px] text-slate-400 gap-3 p-6 text-center">
        <p className="text-xs text-rose-400">{error || 'Không thể hiển thị nội dung văn bản HTML.'}</p>
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
    <div className="flex flex-col w-full h-full bg-slate-200/80 rounded-xl overflow-hidden border border-slate-300/80">
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 text-xs text-slate-700 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[11px]">
            Văn bản Hành chính A4
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono tabular-nums text-[11px] w-11 text-center font-semibold">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(140, z + 10))}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Mặc định 100%"
          >
            <RotateCcw size={13} />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-white hover:bg-primary/90 font-medium text-[11px] cursor-pointer"
            title="In văn bản khổ A4"
          >
            <Printer size={13} />
            <span>In A4</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-5 flex justify-center">
        <div
          style={{
            width: compact ? '100%' : `${Math.round((794 * zoom) / 100)}px`,
            minHeight: compact ? '520px' : `${Math.round((1123 * zoom) / 100)}px`,
          }}
          className="bg-white shadow-lg rounded-xs overflow-hidden transition-all duration-150"
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

