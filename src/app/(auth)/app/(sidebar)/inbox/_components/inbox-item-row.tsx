'use client';

import React from 'react';
import { Eye, Download, Check, FileText, Clock, User, ShieldCheck, Mail, MailOpen, FolderPlus } from 'lucide-react';
import type { DocumentItem } from '@/types';
import { DOCUMENT_TYPE_MAP, APPROVAL_STATUS_MAP } from '@/types';
import { formatBytes, getFileVisualInfo } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import { getFileUrl } from '@/utils/string';
import { cn } from '@/utils';
import dayjs from 'dayjs';

interface InboxItemRowProps {
  document: DocumentItem;
  onOpenDetail: (doc: DocumentItem) => void;
  onMarkAsRead?: (docId: number, e: React.MouseEvent) => void;
  onSaveToFolder?: (doc: DocumentItem, e: React.MouseEvent) => void;
  currentUserId?: string;
}

export const InboxItemRow: React.FC<InboxItemRowProps> = ({ document: doc, onOpenDetail, onMarkAsRead, onSaveToFolder, currentUserId }) => {
  const isRead = doc.isRead === true;
  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const visualInfo = getFileVisualInfo(fileName, currentVersion?.mimeType);

  const docTypeInfo = DOCUMENT_TYPE_MAP[doc.documentType] || {
    label: doc.documentType || 'Văn bản',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const approvalInfo = APPROVAL_STATUS_MAP[doc.approvalStatus] || {
    label: doc.approvalStatus || 'Soạn thảo',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const isAssignedToMeForApproval = doc.approvalStatus === 'pending' && Boolean(currentUserId) && String(doc.approverId) === String(currentUserId);

  const downloadUrl = currentVersion?.downloadUrl || (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const senderName = doc.createdBy?.fullName || doc.createdBy?.email || 'Hệ thống';
  const initial = senderName.charAt(0).toUpperCase();

  return (
    <div
      onClick={() => onOpenDetail(doc)}
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 border-b border-slate-100 transition-colors cursor-pointer select-none',
        isRead ? 'bg-white hover:bg-slate-50/80 text-slate-600' : 'bg-sky-50/40 hover:bg-sky-50/70 text-slate-900 border-l-4 border-l-primary',
      )}
    >
      {/* Cột trái: Trạng thái Đọc/Chưa đọc + Loại + Mã + Tiêu đề */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Unread indicator */}
        <div className="pt-0.5 shrink-0 flex items-center justify-center">
          {isRead ? (
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Đã đọc" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse" title="Chưa đọc" />
          )}
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Mã văn bản */}
            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
              {doc.code}
            </span>

            {/* Phân loại văn bản */}
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', docTypeInfo.badgeClass)}>{docTypeInfo.label}</span>

            {/* Badge cần duyệt đích danh */}
            {isAssignedToMeForApproval && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                <Clock size={11} />
                Chờ bạn phê duyệt
              </span>
            )}

            {/* Trạng thái duyệt nếu đã có */}
            {!isAssignedToMeForApproval && doc.approvalStatus && doc.approvalStatus !== 'draft' && (
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', approvalInfo.badgeClass)}>{approvalInfo.label}</span>
            )}
          </div>

          {/* Tiêu đề văn bản */}
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'text-xs sm:text-sm truncate transition-colors',
                isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900 group-hover:text-primary',
              )}
            >
              {doc.title}
            </h4>
          </div>

          {/* Tóm tắt nội dung */}
          {doc.summary && <p className="text-[11px] text-slate-500 truncate max-w-2xl">{doc.summary}</p>}

          {/* Tệp đính kèm info (mobile view hoặc khi có tệp) */}
          {currentVersion?.fileName && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100/70 hover:bg-slate-200/70 px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0">
              <span className="shrink-0">{visualInfo.icon}</span>
              <span className="truncate max-w-[200px] font-medium text-slate-700">{currentVersion.fileName}</span>
              {currentVersion.fileSize ? <span className="text-[10px] text-slate-400">({formatBytes(currentVersion.fileSize)})</span> : null}
            </div>
          )}
        </div>
      </div>

      {/* Cột phải: Người gửi, Thời gian nhận, Nút thao tác nhanh */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Người gửi */}
        <div className="flex items-center gap-2 text-right">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{initial}</div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold text-slate-700 truncate max-w-[130px]">{senderName}</p>
            <p className="text-[10px] text-slate-400">{dayjs(doc.createdAt).format('HH:mm - DD/MM/YYYY')}</p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Nút đánh dấu đã đọc nếu chưa đọc */}
          {!isRead && onMarkAsRead && (
            <button
              type="button"
              onClick={(e) => onMarkAsRead(doc.id, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
              title="Đánh dấu đã đọc"
            >
              <Check size={15} />
            </button>
          )}

          {/* Tải tệp tin */}
          {downloadUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Tải tệp tin"
            >
              <Download size={15} />
            </button>
          )}

          {/* Lưu lối tắt vào Thư mục của tôi */}
          {onSaveToFolder && (
            <button
              type="button"
              onClick={(e) => onSaveToFolder(doc, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
              title="Lưu lối tắt vào Thư mục của tôi"
            >
              <FolderPlus size={15} />
            </button>
          )}

          {/* Xem chi tiết */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(doc);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
