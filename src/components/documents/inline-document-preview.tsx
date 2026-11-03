'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, ExternalLink, FileText, Maximize2 } from 'lucide-react';
import type { DocumentItem } from '@/types';
import { api, formatBytes, getFileExtension, getFileUrl } from '@/utils';
import { HtmlViewer } from './modals/preview-viewers/html-viewer';
import { PdfViewer } from './modals/preview-viewers/pdf-viewer';
import { WordViewer } from './modals/preview-viewers/word-viewer';
import { ExcelViewer } from './modals/preview-viewers/excel-viewer';

interface InlineDocumentPreviewProps {
  document: DocumentItem;
  onOpenFullscreen: () => void;
}

async function fetchPreviewArrayBuffer(url: string): Promise<ArrayBuffer> {
  try {
    const res = await api.get(url, { responseType: 'arraybuffer' });
    return res.data;
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Không thể tải tệp (${res.status})`);
    return res.arrayBuffer();
  }
}

export const InlineDocumentPreview: React.FC<InlineDocumentPreviewProps> = ({
  document: doc,
  onOpenFullscreen,
}) => {
  const version = doc.currentVersion;
  const fileName = version?.fileName || doc.title || '';
  const downloadUrl =
    version?.downloadUrl || (version?.filePath ? getFileUrl(version.filePath) : null);
  const ext = getFileExtension(fileName).toLowerCase();
  const mime = (version?.mimeType || '').toLowerCase();

  const isHtml = Boolean(mime.includes('html') || ext === 'html' || ext === 'htm');
  const isPdf = Boolean(mime.includes('pdf') || ext === 'pdf');
  const isWord = Boolean(mime.includes('word') || ext === 'docx' || ext === 'doc');
  const isExcel = Boolean(
    mime.includes('sheet') || mime.includes('excel') || ['xlsx', 'xls', 'csv'].includes(ext),
  );

  const {
    data: fileBuffer = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inline-doc-preview', doc.id, downloadUrl],
    queryFn: () => fetchPreviewArrayBuffer(downloadUrl!),
    enabled: Boolean(downloadUrl && (isHtml || isPdf || isWord || isExcel)),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const handleDownload = () => {
    if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <div className="flex flex-col h-full min-h-[480px] rounded-xl border border-slate-200 bg-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={15} className="text-primary shrink-0" />
          <span className="font-semibold text-slate-800 truncate">{fileName || 'Bản xem trước văn bản'}</span>
          {version?.fileSize && (
            <span className="font-mono text-[11px] text-slate-400 shrink-0">
              ({formatBytes(version.fileSize)})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {downloadUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-[11px] font-medium cursor-pointer"
              title="Tải tệp gốc"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Tải về</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenFullscreen}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/15 text-[11px] font-semibold cursor-pointer"
            title="Phóng to toàn màn hình"
          >
            <Maximize2 size={13} />
            <span>Toàn màn hình</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        {!downloadUrl ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 text-xs">
            Chưa có tệp văn bản đính kèm.
          </div>
        ) : isHtml ? (
          <HtmlViewer
            buffer={fileBuffer}
            isLoading={isLoading}
            error={errorMessage}
            onDownload={handleDownload}
            compact
          />
        ) : isPdf ? (
          <div className="h-[520px] w-full">
            <PdfViewer file={fileBuffer || downloadUrl} downloadUrl={downloadUrl} onDownload={handleDownload} />
          </div>
        ) : isWord ? (
          <div className="h-[520px] w-full overflow-y-auto">
            <WordViewer
              buffer={fileBuffer}
              isLoading={isLoading}
              error={errorMessage}
              onDownload={handleDownload}
            />
          </div>
        ) : isExcel ? (
          <div className="h-[520px] w-full overflow-y-auto">
            <ExcelViewer
              buffer={fileBuffer}
              isLoading={isLoading}
              error={errorMessage}
              onDownload={handleDownload}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
            <p className="text-xs text-slate-500">Định dạng tệp ({ext || 'khác'}) hỗ trợ mở trực tiếp ở chế độ toàn màn hình.</p>
            <button
              type="button"
              onClick={onOpenFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
            >
              <ExternalLink size={14} /> Mở trình xem chi tiết
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

