'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Eye,
  FilePen,
  FileText,
  Globe,
  MoreVertical,
  RefreshCw,
  ShieldCheck,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { cn, getFileUrl } from '@/utils';
import type { DocumentItem } from '@/types';
import { DOCUMENT_STATUS_MAP } from '@/types';
import { DriveFileIcon } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import { EXPIRING_SOON_DAYS } from '../_utils/rules-constants';
import { getRuleActions, type RuleActionContext } from '../_utils/rule-permissions';
import { RuleTypeBadge, formatRuleDate, getDaysUntilExpiry } from './rule-badges';

export interface RuleCardProps {
  doc: DocumentItem;
  context?: RuleActionContext;
  onPreview: (doc: DocumentItem) => void;
  onOpenDetail: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onReplace?: (doc: DocumentItem) => void;
}

const getFileExtensionBadge = (fileName?: string, mimeType?: string): { ext: string; badgeClass: string } => {
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.pdf') || mimeType?.includes('pdf')) {
    return { ext: 'PDF', badgeClass: 'bg-rose-50 text-rose-600 border-rose-200' };
  }
  if (lower.endsWith('.doc') || lower.endsWith('.docx') || mimeType?.includes('word')) {
    return { ext: 'DOCX', badgeClass: 'bg-sky-50 text-sky-600 border-sky-200' };
  }
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || mimeType?.includes('sheet') || mimeType?.includes('excel')) {
    return { ext: 'XLSX', badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
  }
  return { ext: 'DOC', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
};

const TargetScopeBox: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
  if (doc.shareScope === 'department') {
    const depts = doc.recipientDepartments || [];
    const names = depts.map((d) => d.name);
    const display =
      names.length > 0
        ? names.slice(0, 2).join(', ') + (names.length > 2 ? ` (+${names.length - 2})` : '')
        : doc.issuingDepartment?.name || 'Phòng ban';
    return (
      <div
        title={names.join(', ')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-800"
      >
        <Building2 size={13} className="text-indigo-600 shrink-0" />
        <span className="truncate">
          <strong className="font-semibold">Phòng ban:</strong> {display}
        </span>
      </div>
    );
  }

  if (doc.shareScope === 'user') {
    const recipients = doc.recipients || [];
    const names = recipients.map((r) => r.user?.fullName || r.fullName || 'Nhân sự');
    const display =
      names.length > 0
        ? names.slice(0, 2).join(', ') + (names.length > 2 ? ` (+${names.length - 2})` : '')
        : 'Cá nhân được chỉ định';
    return (
      <div
        title={names.join(', ')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50/70 border border-amber-100 text-[11px] text-amber-900"
      >
        <Users size={13} className="text-amber-600 shrink-0" />
        <span className="truncate">
          <strong className="font-semibold">Cá nhân:</strong> {display}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50/60 border border-primary/15 text-[11px] text-primary">
      <Globe size={13} className="text-primary shrink-0" />
      <span className="truncate">
        <strong className="font-semibold">Phạm vi:</strong> Toàn công ty
      </span>
    </div>
  );
};

const CardReadCompliance: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
  if (doc.recipientStats && doc.recipientStats.totalRecipients > 0) {
    const { readCount, totalRecipients } = doc.recipientStats;
    const pct = Math.min(100, Math.round((readCount / totalRecipients) * 100));
    return (
      <div className="flex flex-col items-end gap-1 min-w-[96px]">
        <span className="text-[10.5px] font-medium text-slate-600 whitespace-nowrap">
          Đã đọc <strong className="text-slate-800">{readCount}/{totalRecipients}</strong> • {pct}%
        </span>
        <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-primary' : 'bg-amber-500',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (doc.requiresAcknowledgement && doc.isAcknowledged !== null && doc.isAcknowledged !== undefined) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap',
          doc.isAcknowledged ? 'text-emerald-600' : 'text-amber-600',
        )}
      >
        <ShieldCheck size={12} />
        {doc.isAcknowledged ? 'Đã xác nhận' : 'Cần xác nhận'}
      </span>
    );
  }

  return (
    <span className={cn('text-[11px] font-medium whitespace-nowrap', doc.isRead === false ? 'text-rose-600' : 'text-emerald-600')}>
      {doc.isRead === false ? '● Chưa đọc' : '✓ Đã xem'}
    </span>
  );
};

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
        'group relative flex flex-col justify-between rounded-xl border bg-white p-3.5 transition-all cursor-pointer hover:shadow-md hover:border-primary/40',
        isUnread ? 'border-primary/40 bg-sky-50/15' : 'border-slate-200',
      )}
    >
      <div className="flex flex-col gap-2.5">
        {/* Top Row: Type Badge + Code + File Ext + Action Menu */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {isUnread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Chưa đọc" />}
            <RuleTypeBadge type={doc.documentType} />
            <span className="font-mono text-[11px] font-semibold text-slate-500 truncate" title={doc.code}>
              {doc.code}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className={cn('px-1.5 py-0.5 rounded text-[9.5px] font-bold border', fileExt.badgeClass)}>
              {fileExt.ext}
            </span>
            <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                title="Thao tác"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <MoreVertical size={15} />
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

        {/* Mini A4 Official Document Preview */}
        <div className="relative w-full h-32 rounded-lg bg-[#f0f4f9] border border-slate-200/80 p-2 overflow-hidden flex items-center justify-center">
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

        {/* Title & Summary */}
        <div>
          <h3
            className={cn(
              'text-[13px] line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[36px]',
              isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800',
            )}
            title={doc.title}
          >
            {doc.title}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 min-h-[30px] leading-relaxed">
            {doc.summary || 'Văn bản ban hành chính thức áp dụng theo quy định của công ty.'}
          </p>
        </div>

        {/* Target Audience Scope Box */}
        <TargetScopeBox doc={doc} />
      </div>

      {/* Footer: Effective Date, Creator & Read Compliance Progress */}
      <div className="flex items-end justify-between gap-2 pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
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

        <CardReadCompliance doc={doc} />
      </div>
    </div>
  );
};
