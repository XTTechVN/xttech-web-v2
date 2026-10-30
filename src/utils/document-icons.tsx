import React from 'react';
import { FileText, FileSpreadsheet, FileCode, FileImage, FileArchive, File } from 'lucide-react';

export function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileExtension(filename?: string): string {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif']);
const ARCHIVE_EXTS = new Set(['zip', 'rar', '7z', 'tar', 'gz']);
const CODE_EXTS = new Set(['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py']);
const VIDEO_EXTS = new Set(['mp4', 'mkv', 'avi', 'mov', 'webm']);
const EXCEL_EXTS = new Set(['xls', 'xlsx', 'csv']);

export function getFileVisualInfo(filename?: string, mimeType?: string) {
  const ext = getFileExtension(filename);
  if (ext === 'pdf' || mimeType?.includes('pdf')) {
    return { icon: <FileText className="text-rose-500" size={20} />, color: 'rose', label: 'PDF', bgColor: 'bg-rose-50 border-rose-200' };
  }
  if (ext === 'doc' || ext === 'docx' || mimeType?.includes('word')) {
    return { icon: <FileText className="text-blue-500" size={20} />, color: 'blue', label: 'Word', bgColor: 'bg-blue-50 border-blue-200' };
  }
  if (EXCEL_EXTS.has(ext) || mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
    return { icon: <FileSpreadsheet className="text-emerald-600" size={20} />, color: 'emerald', label: 'Excel', bgColor: 'bg-emerald-50 border-emerald-200' };
  }
  if (IMAGE_EXTS.has(ext) || mimeType?.startsWith('image/')) {
    return { icon: <FileImage className="text-indigo-500" size={20} />, color: 'indigo', label: 'Image', bgColor: 'bg-indigo-50 border-indigo-200' };
  }
  if (ARCHIVE_EXTS.has(ext) || mimeType?.includes('zip')) {
    return { icon: <FileArchive className="text-amber-500" size={20} />, color: 'amber', label: 'Archive', bgColor: 'bg-amber-50 border-amber-200' };
  }
  if (CODE_EXTS.has(ext)) {
    return { icon: <FileCode className="text-purple-500" size={20} />, color: 'purple', label: 'Code', bgColor: 'bg-purple-50 border-purple-200' };
  }
  return { icon: <File className="text-slate-500" size={20} />, color: 'slate', label: ext ? ext.toUpperCase() : 'File', bgColor: 'bg-slate-50 border-slate-200' };
}

function FoldedDocSvg({ size, mainColor, foldColor, children }: { size: number; mainColor: string; foldColor: string; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill={mainColor} />
      <path d="M14 2v6h6" fill={foldColor} />
      {children}
    </svg>
  );
}

export function DriveFileIcon({ filename, mimeType, size = 18 }: { filename?: string; mimeType?: string; size?: number }) {
  const ext = getFileExtension(filename);

  if (ext === 'pdf' || mimeType?.includes('pdf')) {
    return (
      <FoldedDocSvg size={size} mainColor="#EA4335" foldColor="#F89D96">
        <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </FoldedDocSvg>
    );
  }
  if (ext === 'doc' || ext === 'docx' || mimeType?.includes('word')) {
    return (
      <FoldedDocSvg size={size} mainColor="#4285F4" foldColor="#A1C2FA">
        <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </FoldedDocSvg>
    );
  }
  if (EXCEL_EXTS.has(ext) || mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
    return (
      <FoldedDocSvg size={size} mainColor="#0F9D58" foldColor="#87CEAB">
        <rect x="7.5" y="12" width="9" height="6.5" rx="0.5" fill="none" stroke="white" strokeWidth="1.3" />
        <line x1="12" y1="12" x2="12" y2="18.5" stroke="white" strokeWidth="1.3" />
        <line x1="7.5" y1="15.2" x2="16.5" y2="15.2" stroke="white" strokeWidth="1.3" />
      </FoldedDocSvg>
    );
  }
  if (ext === 'ppt' || ext === 'pptx' || mimeType?.includes('presentation')) {
    return (
      <FoldedDocSvg size={size} mainColor="#F4B400" foldColor="#FCDA7F">
        <rect x="8" y="12.5" width="8" height="5.5" rx="0.5" fill="none" stroke="white" strokeWidth="1.3" />
      </FoldedDocSvg>
    );
  }
  if (VIDEO_EXTS.has(ext) || mimeType?.startsWith('video/')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="#EA4335" />
        <polygon points="10,8.5 16,12 10,15.5" fill="white" />
      </svg>
    );
  }
  if (IMAGE_EXTS.has(ext) || mimeType?.startsWith('image/')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
        <rect x="2.5" y="3.5" width="19" height="17" rx="3" fill="#AB47BC" />
        <circle cx="8" cy="8.5" r="1.8" fill="white" />
        <path d="M20 16l-5-5-8 7.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (ARCHIVE_EXTS.has(ext) || mimeType?.includes('zip')) {
    return (
      <FoldedDocSvg size={size} mainColor="#E37400" foldColor="#F5BA80">
        <path d="M10 11h2M10 13h2M10 15h2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      </FoldedDocSvg>
    );
  }
  return (
    <FoldedDocSvg size={size} mainColor="#5F6368" foldColor="#BDC1C6">
      <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </FoldedDocSvg>
  );
}

export const DriveFileBadge = DriveFileIcon;
