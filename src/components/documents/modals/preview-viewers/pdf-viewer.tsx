'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  file: string | ArrayBuffer | Blob;
  downloadUrl: string | null;
  onDownload: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ file, downloadUrl, onDownload }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [rotation, setRotation] = useState(0);
  const [inputPage, setInputPage] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [useIframe, setUseIframe] = useState(false);

  if (useIframe && downloadUrl) {
    return (
      <div className="w-full h-full max-w-6xl flex flex-col items-center justify-center bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative">
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={() => setUseIframe(false)}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-white text-[11px] font-medium border border-slate-700 transition-colors"
          >
            Quay lại chế độ xem chuẩn
          </button>
        </div>
        <iframe src={downloadUrl} className="w-full h-full border-0 bg-white" title="PDF Preview" />
      </div>
    );
  }

  const commitPageInput = () => {
    const val = parseInt(inputPage, 10);
    if (!Number.isNaN(val) && numPages && val >= 1 && val <= numPages) {
      setPageNumber(val);
    } else {
      setInputPage(String(pageNumber));
    }
  };

  return (
    <div className="w-full h-full max-w-5xl flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 select-none">
      <div className="h-12 px-3 sm:px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-10 text-slate-300">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const n = Math.max(pageNumber - 1, 1);
              setPageNumber(n);
              setInputPage(String(n));
            }}
            disabled={pageNumber <= 1 || !numPages}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1 text-xs font-medium text-slate-300">
            <input
              type="text"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitPageInput()}
              onBlur={commitPageInput}
              className="w-9 h-7 text-center rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-primary"
            />
            <span className="text-slate-400">/ {numPages || '...'}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!numPages) return;
              const n = Math.min(pageNumber + 1, numPages);
              setPageNumber(n);
              setInputPage(String(n));
            }}
            disabled={!numPages || pageNumber >= numPages}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Trang tiếp theo"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setScale((p) => Math.max(Number((p - 0.15).toFixed(2)), 0.5))}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-slate-300 min-w-11 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((p) => Math.min(Number((p + 0.15).toFixed(2)), 3))}
            disabled={scale >= 3}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={() => setScale(1.0)}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:inline-flex"
            title="Kích thước 100%"
          >
            <Maximize2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setRotation((p) => (p + 90) % 360)}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1 border-l border-slate-700 pl-2"
            title="Xoay 90°"
          >
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full overflow-auto bg-slate-950/60 p-4 sm:p-6 flex items-start justify-center relative">
        {error ? (
          <div className="my-auto p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md shadow-2xl flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertCircle size={28} />
            </div>
            <h4 className="font-semibold text-white text-sm">Không thể nạp tệp PDF</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setUseIframe(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>Dùng trình xem ngoài</span>
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                <Download size={14} />
                <span>Tải về máy</span>
              </button>
            </div>
          </div>
        ) : (
          <Document
            file={file}
            onLoadSuccess={({ numPages: total }) => {
              setNumPages(total);
              setPageNumber(1);
              setInputPage('1');
              setError(null);
            }}
            onLoadError={(err) => setError(err.message || 'Không thể hiển thị tệp PDF.')}
            onSourceError={(err) => setError(err.message || 'Không thể kết nối hoặc tải tệp PDF từ máy chủ.')}
            error={null}
            loading={
              <div className="my-auto flex flex-col items-center justify-center gap-3 text-slate-400 py-16">
                <Loader2 size={36} className="animate-spin text-rose-500" />
                <p className="text-xs font-medium text-slate-300">Đang nạp dữ liệu PDF...</p>
              </div>
            }
          >
            <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="w-[500px] h-[700px] bg-white flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="text-xs">Đang tải trang {pageNumber}...</span>
                  </div>
                }
              />
            </div>
          </Document>
        )}
      </div>
    </div>
  );
};
