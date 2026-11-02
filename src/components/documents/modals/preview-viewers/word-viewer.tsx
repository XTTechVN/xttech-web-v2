'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Download, Loader2, ZoomIn, ZoomOut, Maximize2, FileText } from 'lucide-react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(Boolean(buffer));
  const [renderError, setRenderError] = useState<string | null>(null);
  const [prevBuffer, setPrevBuffer] = useState<ArrayBuffer | null>(buffer);
  const [scale, setScale] = useState<number>(1);

  if (buffer !== prevBuffer) {
    setPrevBuffer(buffer);
    setIsRendering(Boolean(buffer));
    setRenderError(null);
  }

  // Tự động tính toán tỷ lệ để trang Word vừa khít màn hình (đặc biệt cho mobile)
  const fitToWidth = useCallback(() => {
    if (!scrollContainerRef.current || !containerRef.current) return;
    const scrollEl = scrollContainerRef.current;

    // Tìm section trang A4 được docx-preview tạo ra
    const firstSection = containerRef.current.querySelector('section') as HTMLElement | null;
    const pageWidth = firstSection?.offsetWidth || firstSection?.getBoundingClientRect().width || 794;

    // Khoảng trống khả dụng trừ đi lề đệm
    const availableWidth = scrollEl.clientWidth - 16;

    if (pageWidth > 0 && availableWidth > 0) {
      if (availableWidth < pageWidth) {
        // Màn hình hẹp/mobile: thu nhỏ để vừa vặn 100% chiều rộng
        const newScale = Number((availableWidth / pageWidth).toFixed(2));
        setScale(Math.max(0.25, Math.min(newScale, 1.5)));
      } else {
        // Màn hình rộng desktop: mặc định kích thước chuẩn 100%
        setScale(1.0);
      }
    }
  }, []);

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

          // Tự động căn chỉnh vừa vặn màn hình sau khi render xong
          setTimeout(() => {
            if (isMounted) {
              fitToWidth();
            }
          }, 80);
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
  }, [buffer, fitToWidth]);

  // Cập nhật lại kích thước khi xoay màn hình hoặc resize cửa sổ
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        fitToWidth();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitToWidth]);

  const loading = isLoading || isRendering;
  const error = parentError || renderError;

  return (
    <div className="w-full h-full max-w-5xl bg-white sm:rounded-xl shadow-2xl border-0 sm:border border-slate-800 flex flex-col overflow-hidden text-slate-900 relative">
      {loading && (
        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-500">
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900">
          {/* Thanh công cụ Thu nhỏ / Phóng to / Vừa màn hình */}
          <div className="h-10 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 text-slate-300 select-none">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <FileText size={15} className="text-primary shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Văn bản Word</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setScale((p) => Math.max(Number((p - 0.1).toFixed(2)), 0.25))}
                disabled={scale <= 0.25}
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-300 min-w-10 text-center select-none">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale((p) => Math.min(Number((p + 0.1).toFixed(2)), 2.5))}
                disabled={scale >= 2.5}
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn size={15} />
              </button>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              <button
                type="button"
                onClick={fitToWidth}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                title="Tự động vừa màn hình"
              >
                <Maximize2 size={13} />
                <span className="hidden sm:inline">Vừa màn hình</span>
              </button>
              <button
                type="button"
                onClick={() => setScale(1.0)}
                className="px-2 py-1 rounded-md text-[11px] font-medium hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Kích thước 100%"
              >
                100%
              </button>
            </div>
          </div>

          {/* Vùng xem trang Word: Hỗ trợ cuộn ngang và cuộn dọc mượt mà */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-auto p-2 sm:p-6 md:p-8 bg-slate-200/70 flex justify-center"
          >
            <div
              ref={containerRef}
              className="docx-container text-slate-900 select-text leading-normal transition-transform duration-150"
              style={{
                zoom: scale,
                display: 'inline-block',
                margin: '0 auto',
              }}
            />
          </div>

          {/* Tinh chỉnh CSS để tài liệu hiển thị dạng trang sách và không bị vỡ khung trên mobile */}
          <style>{`
            .docx-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: max-content;
              min-width: 100%;
            }
            .docx-container section.docx-document-viewer {
              margin-left: auto !important;
              margin-right: auto !important;
              margin-bottom: 24px !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
              background: #ffffff !important;
            }
            .docx-container section.docx-document-viewer:last-child {
              margin-bottom: 0 !important;
            }
            .docx-container img {
              max-width: 100% !important;
              height: auto !important;
            }
            .docx-container table {
              max-width: 100% !important;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default WordViewer;
