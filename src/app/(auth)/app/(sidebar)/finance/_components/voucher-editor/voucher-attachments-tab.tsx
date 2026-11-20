'use client';

import React, { useRef } from 'react';
import { Camera, ExternalLink, FileText, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components';
import type { VoucherAttachment } from '@/types';
import { getFileUrl } from '@/utils/string';

export interface VoucherAttachmentsTabProps {
  existingAttachments: VoucherAttachment[];
  pendingFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemovePendingFile: (index: number) => void;
  onRemoveExistingAttachment: (index: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

const formatBytes = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function VoucherAttachmentsTab({
  existingAttachments,
  pendingFiles,
  onAddFiles,
  onRemovePendingFile,
  onRemoveExistingAttachment,
  disabled = false,
  compact = false,
}: VoucherAttachmentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length > 0) {
      onAddFiles(selected);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,.xml,.xlsx"
        onChange={handleFilePick}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFilePick}
        className="hidden"
      />

      <div
        className={
          compact
            ? 'flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70'
            : 'flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70'
        }
      >
        <div className="text-xs text-slate-600">
          <div className="font-semibold text-slate-800">
            Ảnh hóa đơn, phiếu giao hàng, biên bản nghiệm thu
          </div>
          <div className="text-[11px] text-slate-500">
            Hỗ trợ ảnh chụp điện thoại, PDF, XML hóa đơn (tối đa 10MB/tệp).
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={disabled}
            leftIcon={<Camera size={14} />}
            onClick={() => cameraInputRef.current?.click()}
          >
            Chụp ảnh
          </Button>
          <Button
            type="button"
            variant="primary"
            size="xs"
            disabled={disabled}
            leftIcon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Chọn tệp
          </Button>
        </div>
      </div>

      {(existingAttachments.length > 0 || pendingFiles.length > 0) && (
        <div className="space-y-1.5">
          {existingAttachments.map((att, idx) => (
            <div
              key={`${att.fileUrl}-${idx}`}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={15} className="text-primary shrink-0" />
                <span className="truncate font-medium text-slate-800">{att.fileName}</span>
                {att.fileSize ? (
                  <span className="text-[11px] text-slate-400 shrink-0">
                    ({formatBytes(att.fileSize)})
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={getFileUrl(att.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-primary hover:bg-primary/10 rounded-md"
                  title="Xem chứng từ"
                >
                  <ExternalLink size={14} />
                </a>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemoveExistingAttachment(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                    title="Gỡ tệp"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {pendingFiles.map((file, idx) => (
            <div
              key={`${file.name}-${file.size}-${idx}`}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Upload size={14} className="text-emerald-600 shrink-0" />
                <span className="truncate font-medium text-emerald-900">{file.name}</span>
                <span className="text-[11px] text-emerald-700 shrink-0">
                  Chờ tải lên ({formatBytes(file.size)})
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemovePendingFile(idx)}
                  className="p-1 text-emerald-700 hover:text-red-600 rounded cursor-pointer"
                  title="Bỏ tệp này"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
