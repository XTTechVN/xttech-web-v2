'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Eye,
  FilePen,
  FileText,
  MoreVertical,
  RefreshCw,
  Trash2,
  User,
} from 'lucide-react';
import { cn, getFileUrl, DriveFileIcon } from '@/utils';
import type { DocumentItem } from '@/types';
import { DOCUMENT_STATUS_MAP } from '@/types';
import { EXPIRING_SOON_DAYS } from '../_utils/rules-constants';
import { getRuleActions, type RuleActionContext } from '../_utils/rule-permissions';
import {
  RuleTypeBadge,
  TargetScopeBox,
  CardReadCompliance,
  formatRuleDate,
  getDaysUntilExpiry,
  getFileExtensionBadge,
} from './rule-badges';

export interface RuleCardProps {
  doc: DocumentItem;
  context?: RuleActionContext;
  onPreview: (doc: DocumentItem) => void;
  onOpenDetail: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onReplace?: (doc: DocumentItem) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({
  doc,
  context,
  onPreview,
  onOpenDetail,
  onEdit,
  onDelete,
  onReplace,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const isUnread = doc.isRead === false;
  const actions = context ? getRuleActions(doc, context) : null;
  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const mimeType = currentVersion?.mimeType;
  const isImage = Boolean(mimeType?.startsWith('image/'));
  const downloadUrl =
    currentVersion?.downloadUrl || (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  const fileExt = getFileExtensionBadge(fileName, mimeType);
  const daysLeft = getDaysUntilExpiry(doc);
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_SOON_DAYS;
  const statusInfo = DOCUMENT_STATUS_MAP[doc.status];

  return (
    <div
      onClick={() => onPreview(doc)}
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border bg-white p-3 sm:p-3.5 transition-all cursor-pointer hover:shadow-md hover:border-primary/40 shadow-2xs',
        isUnread ? 'border-primary/40 bg-sky-50/15' : 'border-slate-200',
      )}
    >
      <div className="flex flex-col gap-2 sm:gap-2.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {isUnread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Chưa đọc" />}
            <RuleTypeBadge type={doc.documentType} />
            <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate" title={doc.code}>
              {doc.code}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className={cn('px-1.5 py-0.5 rounded text-[9px] sm:text-[9.5px] font-bold border', fileExt.badgeClass)}>
              {fileExt.ext}
            </span>
            <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                title="Thao tác"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <MoreVertical size={16} className="sm:w-[15px] sm:h-[15px]" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-white shadow-xl border border-slate-200 py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onPreview(doc);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                  >
                    <Eye size={14} className="text-slate-400" />
                    <span>Xem văn bản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenDetail(doc);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                  >
                    <FileText size={14} className="text-slate-400" />
                    <span>Chi tiết &amp; Lịch sử</span>
                  </button>
                  {actions?.canReplace && onReplace && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onReplace(doc);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 text-left cursor-pointer"
                    >
                      <RefreshCw size={14} className="text-amber-500" />
                      <span>Soạn cơ chế thay thế</span>
                    </button>
                  )}
                  {actions?.canEdit && onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(doc);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sky-700 hover:bg-sky-50 text-left cursor-pointer"
                    >
                      <FilePen size={14} className="text-sky-500" />
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                  {actions?.canDelete && onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(doc);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100 cursor-pointer"
                    >
                      <Trash2 size={14} className="text-rose-500" />
                      <span>Xóa văn bản</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Khung xem trước A4 chỉ hiển thị từ màn hình sm trở lên để tránh chiếm diện tích dọc trên điện thoại */}
        <div className="hidden sm:flex relative w-full h-32 rounded-lg bg-[#f0f4f9] border border-slate-200/80 p-2 overflow-hidden items-center justify-center">
          {isImage && downloadUrl ? (
            <div className="w-full h-full rounded bg-white overflow-hidden shadow-2xs">
              <img src={downloadUrl} alt={doc.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-full bg-white rounded shadow-2xs border border-slate-200/90 p-2.5 flex flex-col justify-between select-none relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] font-black text-slate-900 text-2xl tracking-widest rotate-[-18deg]">
                XT-TECH
              </div>
              <div className="flex flex-col items-center border-b border-slate-100 pb-1 text-center shrink-0">
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </span>
                <span className="text-[6.5px] text-slate-400 italic">Độc lập - Tự do - Hạnh phúc</span>
              </div>
              <div className="flex-1 flex flex-col justify-center my-1 min-h-0 text-center px-1">
                <span className="text-[9.5px] font-bold text-slate-800 uppercase line-clamp-2 leading-snug">
                  {doc.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-[7.5px] text-slate-400 pt-1 border-t border-slate-100 shrink-0">
                <span className="inline-flex items-center gap-1 font-mono text-slate-400">
                  <DriveFileIcon filename={fileName} mimeType={mimeType} size={10} />
                  {doc.code}
                </span>
                {isExpiringSoon ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    ● Sắp hết hạn (còn {daysLeft} ngày)
                  </span>
                ) : (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full font-semibold',
                      doc.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    ● {statusInfo?.label || doc.status}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3
            className={cn(
              'text-[13px] sm:text-[13px] line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-0 sm:min-h-[36px]',
              isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800',
            )}
            title={doc.title}
          >
            {doc.title}
          </h3>
          <p className="hidden sm:block text-[11px] text-slate-500 line-clamp-2 mt-1 min-h-[30px] leading-relaxed">
            {doc.summary || 'Văn bản ban hành chính thức áp dụng theo quy định của công ty.'}
          </p>
        </div>

        <TargetScopeBox doc={doc} />
      </div>

      <div className="flex items-center justify-between gap-2 pt-2.5 sm:pt-3 mt-2 sm:mt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Calendar size={11} className="text-slate-400 shrink-0" />
            <span className="truncate">
              {formatRuleDate(doc.effectiveDate)}
              {doc.expirationDate ? ` → ${formatRuleDate(doc.expirationDate)}` : ''}
            </span>
          </div>
          {doc.createdBy?.fullName && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
              <User size={10} className="shrink-0" />
              <span className="truncate">{doc.createdBy.fullName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <CardReadCompliance doc={doc} />
          {/* Nút Xem nhanh trên mobile */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(doc);
            }}
            className="sm:hidden inline-flex items-center gap-1 px-2 py-1 rounded bg-primary text-white text-[10px] font-semibold shadow-2xs hover:bg-primary/90"
          >
            <Eye size={11} />
            <span>Xem</span>
          </button>
        </div>
      </div>
    </div>
  );
};
