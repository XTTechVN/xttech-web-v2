'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Download, Loader2 } from 'lucide-react';

interface WordViewerProps {
  buffer: ArrayBuffer | null;
  isLoading: boolean;
  error: string | null;
  onDownload: () => void;
}

export const WordViewer: React.FC<WordViewerProps> = ({
  buffer,
  isLoading,
  error: parentError,
  onDownload,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(Boolean(buffer));
  const [renderError, setRenderError] = useState<string | null>(null);
  const [prevBuffer, setPrevBuffer] = useState<ArrayBuffer | null>(buffer);

  if (buffer !== prevBuffer) {
    setPrevBuffer(buffer);
    setIsRendering(Boolean(buffer));
    setRenderError(null);
  }

  useEffect(() => {
    if (!buffer) return;
    let isMounted = true;

    const render = async () => {
      try {
        const bytes = new Uint8Array(buffer.slice(0, 4));
        const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
        const isOldDoc = bytes[0] === 0xd0 && bytes[1] === 0xcf;

        if (isOldDoc) {
          throw new Error('Tệp sử dụng định dạng Word cũ (.doc). Vui lòng tải về máy để xem.');
        }
        if (!isZip) {
          throw new Error('Dữ liệu trả về không phải là tệp văn bản hợp lệ.');
        }

        const { renderAsync } = await import('docx-preview');
        if (containerRef.current && isMounted) {
          containerRef.current.innerHTML = '';
          await renderAsync(buffer, containerRef.current, undefined, {
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            useBase64URL: true,
            className: 'docx-document-viewer',
          });
        }
      } catch (err: any) {
        if (isMounted) setRenderError(err?.message || 'Không thể xem trực tiếp tệp Word này.');
      } finally {
        if (isMounted) setIsRendering(false);
      }
    };

    void render();
    return () => {
      isMounted = false;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [buffer]);

  const loading = isLoading || isRendering;
  const error = parentError || renderError;

  return (
    <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-900 relative">
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-xs font-semibold text-slate-700">Đang đọc và dựng văn bản Word (.docx)...</p>
        </div>
      )}
      {error && !loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
            <AlertCircle size={28} />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Không thể xem trực tiếp tệp Word</h4>
          <p className="text-xs text-slate-500 max-w-md">{error}</p>
          <button
            type="button"
            onClick={onDownload}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Download size={15} />
            <span>Tải tệp tin về máy</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12">
          <div ref={containerRef} className="w-full docx-container text-slate-900 mx-auto select-text leading-normal" />
        </div>
      )}
    </div>
  );
};
