'use client';

import React from 'react';
import { Download, ExternalLink, FileWarning } from 'lucide-react';
import { formatBytes, getFileExtension, getFileVisualInfo } from '@/utils';

interface FallbackViewerProps {
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  downloadUrl: string | null;
  onDownload: () => void;
}

export const FallbackViewer: React.FC<FallbackViewerProps> = ({
  fileName,
  fileSize,
  mimeType,
  downloadUrl,
  onDownload,
}) => {
  const visualInfo = getFileVisualInfo(fileName, mimeType);
  const ext = getFileExtension(fileName).toUpperCase() || 'FILE';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-300 shadow-2xl select-none mx-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center mb-4 shadow-inner relative">
        {visualInfo?.icon ? (
          React.cloneElement(visualInfo.icon as React.ReactElement<{ size?: number; className?: string }>, {
            size: 40,
            className: 'drop-shadow-sm',
          })
        ) : (
          <FileWarning size={40} className="text-amber-400" />
        )}
        <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-700 text-white border border-slate-600 uppercase">
          {ext}
        </span>
      </div>

      <h3 className="text-base font-bold text-white max-w-sm truncate mb-1" title={fileName}>
        {fileName}
      </h3>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        {fileSize !== undefined && fileSize > 0 && <span>{formatBytes(fileSize)}</span>}
        {mimeType && (
          <>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400 max-w-xs truncate">{mimeType}</span>
          </>
        )}
      </div>

      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 leading-relaxed mb-6 max-w-sm">
        Định dạng này hiện chưa hỗ trợ xem trước trực tiếp trên trình duyệt. Bạn có thể tải tệp tin về máy để mở bằng ứng dụng tương ứng.
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <Download size={16} />
          <span>Tải tệp tin về máy</span>
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <ExternalLink size={15} />
            <span>Mở liên kết</span>
          </a>
        )}
      </div>
    </div>
  );
};
