'use client';

import React, { useEffect } from 'react';
import { Image as AntdImage } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Printer, ExternalLink, X, FileText, AlertCircle } from 'lucide-react';
import type { DocumentItem } from '@/types';
import { getFileUrl, formatBytes, getFileVisualInfo, getFileExtension, api } from '@/utils';
import { cn } from '@/utils/cn';
import { markDocumentAsRead } from '@/actions/document';
import { WordViewer } from './preview-viewers/word-viewer';
import { ExcelViewer } from './preview-viewers/excel-viewer';
import { PdfViewer } from './preview-viewers/pdf-viewer';
import { HtmlViewer } from './preview-viewers/html-viewer';
import { FallbackViewer } from './preview-viewers/fallback-viewer';

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

const ICON_BTN =
  'flex size-11 flex-none cursor-pointer items-center justify-center rounded-control text-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-white sm:size-9 md:hover:bg-slate-800 md:hover:text-white active:bg-slate-800';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
const EXCEL_EXTS = ['xlsx', 'xls', 'csv'];

async function fetchDocumentBuffer(downloadUrl: string, docId?: number): Promise<ArrayBuffer> {
  if (docId) {
    markDocumentAsRead(docId).catch(() => {});
  }
  let buffer: ArrayBuffer;
  try {
    const res = await api.get(downloadUrl, { responseType: 'arraybuffer' });
    buffer = res.data;
  } catch {
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error(`Lỗi nạp tệp: ${res.status} ${res.statusText}`);
    buffer = await res.arrayBuffer();
  }
  if (!buffer || buffer.byteLength === 0) {
    throw new Error('Tệp rỗng hoặc không có dữ liệu.');
  }
  return buffer;
}

export default function DocumentPreviewModalBody({
  isOpen,
  onClose,
  document: doc,
}: DocumentPreviewModalProps) {
  const currentVersion = doc?.currentVersion;
  const fileName = currentVersion?.fileName || doc?.title || '';
  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const visualInfo = doc ? getFileVisualInfo(fileName, currentVersion?.mimeType) : null;
  const ext = getFileExtension(fileName).toLowerCase();
  const mime = (currentVersion?.mimeType || '').toLowerCase();

  const isImage = Boolean(mime.startsWith('image/') || IMAGE_EXTS.includes(ext));
  const isHtml = Boolean(mime.includes('html') || ext === 'html' || ext === 'htm');
  const isPdf = Boolean(mime.includes('pdf') || ext === 'pdf');
  const isWord = Boolean(mime.includes('word') || ext === 'docx' || ext === 'doc');
  const isExcel = Boolean(
    mime.includes('sheet') ||
      mime.includes('excel') ||
      mime.includes('spreadsheet') ||
      mime.includes('csv') ||
      EXCEL_EXTS.includes(ext),
  );

  const {
    data: fileBuffer = null,
    isLoading: isBufferLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['document-preview-buffer', doc?.id, downloadUrl],
    queryFn: () => fetchDocumentBuffer(downloadUrl!, doc?.id),
    enabled: Boolean(isOpen && downloadUrl && !isImage),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const bufferError = queryError instanceof Error ? queryError.message : null;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !doc) return null;

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    if (!downloadUrl) return;
    const printWindow = window.open(downloadUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  if (isImage) {
    return (
      <AntdImage
        style={{ display: 'none' }}
        preview={{
          open: isOpen,
          onOpenChange: (open) => {
            if (!open) onClose();
          },
          src: downloadUrl || '',
        }}
        src={downloadUrl || ''}
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none animate-in fade-in duration-150"
    >
      <div className="flex h-14 flex-none items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button type="button" onClick={onClose} className={cn(ICON_BTN, 'sm:hidden')} title="Đóng (ESC)" aria-label="Đóng">
            <ArrowLeft size={18} />
          </button>

          <div className="flex flex-none items-center justify-center">
            {visualInfo?.icon ? (
              React.cloneElement(visualInfo.icon as React.ReactElement<{ size?: number }>, { size: 20 })
            ) : (
              <FileText size={20} className="text-blue-400" />
            )}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight text-white" title={doc.title}>
              {doc.title}
            </h1>
            <p className="mt-0.5 truncate text-xs tabular-nums text-slate-400">
              {[doc.code, currentVersion?.fileSize ? formatBytes(currentVersion.fileSize) : null].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-1">
          {downloadUrl && (
            <>
              <button type="button" onClick={handlePrint} className={ICON_BTN} title="In tài liệu" aria-label="In tài liệu">
                <Printer size={18} />
              </button>
              <button type="button" onClick={handleDownload} className={ICON_BTN} title="Tải xuống" aria-label="Tải xuống">
                <Download size={18} />
              </button>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className={cn(ICON_BTN, 'hidden sm:flex')} title="Mở tab mới" aria-label="Mở tab mới">
                <ExternalLink size={18} />
              </a>
            </>
          )}
          <button type="button" onClick={onClose} className={ICON_BTN} title="Đóng (ESC)" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-[calc(100vh-56px)] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden relative">
        {!downloadUrl ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Không có tệp xem trước</p>
              <p className="text-xs text-slate-400 mt-1">Tài liệu này chưa được đính kèm tệp tin.</p>
            </div>
          </div>
        ) : isHtml ? (
          <HtmlViewer
            key={downloadUrl}
            buffer={fileBuffer}
            isLoading={isBufferLoading}
            error={bufferError}
            onDownload={handleDownload}
          />
        ) : isWord ? (
          <WordViewer
            key={downloadUrl}
            buffer={fileBuffer}
            isLoading={isBufferLoading}
            error={bufferError}
            onDownload={handleDownload}
          />
        ) : isExcel ? (
          <ExcelViewer
            key={downloadUrl}
            buffer={fileBuffer}
            isLoading={isBufferLoading}
            error={bufferError}
            onDownload={handleDownload}
          />
        ) : isPdf ? (
          <PdfViewer file={fileBuffer || downloadUrl} downloadUrl={downloadUrl} onDownload={handleDownload} />
        ) : (
          <FallbackViewer
            fileName={fileName}
            fileSize={currentVersion?.fileSize}
            mimeType={currentVersion?.mimeType}
            downloadUrl={downloadUrl}
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  );
}
