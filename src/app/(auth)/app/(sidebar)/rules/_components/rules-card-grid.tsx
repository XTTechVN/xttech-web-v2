'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Eye,
  FilePen,
  FileSearch,
  FileText,
  MoreVertical,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { TablePagination } from '@/components/table';
import { cn, getFileUrl } from '@/utils';
import type { DocumentItem } from '@/types';
import { SHARE_SCOPE_MAP } from '@/types';
import { DriveFileIcon } from '@/app/(auth)/app/(sidebar)/documents/_utils/doc-helpers';
import { RuleTypeBadge, formatRuleDate } from './rule-badges';
import { getRuleActions, type RuleActionContext } from '../_utils/rule-permissions';

interface RulesCardGridProps {
  items: DocumentItem[];
  total: number;
  offset: number;
  limit: number;
  isLoading: boolean;
  emptyHint: string;
  context?: RuleActionContext;
  onPreview: (doc: DocumentItem) => void;
  onOpenDetail: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onReplace?: (doc: DocumentItem) => void;
  onPageChange: (offset: number) => void;
}

const ReadProgress: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
  const isIssued = ['published', 'superseded', 'expired'].includes(doc.status);
  if (!isIssued) {
    return <span className="text-[11px] text-slate-400 italic">Chưa ban hành</span>;
  }

  if (doc.recipientStats) {
    const { readCount, totalRecipients } = doc.recipientStats;
    return (
      <span className="text-[11px] text-slate-600 whitespace-nowrap font-medium">
        Đã đọc <strong className="text-slate-800">{readCount}</strong>/{totalRecipients}
      </span>
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
  return <span className="text-[11px] text-slate-400">—</span>;
};

interface RuleCardProps {
  doc: DocumentItem;
  context?: RuleActionContext;
  onPreview: (doc: DocumentItem) => void;
  onOpenDetail: (doc: DocumentItem) => void;
  onEdit?: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onReplace?: (doc: DocumentItem) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({
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
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const isUnread = doc.isRead === false;
  const actions = context ? getRuleActions(doc, context) : null;
  const canEdit = actions?.canEdit ?? false;
  const canDelete = actions?.canDelete ?? false;
  const canReplace = actions?.canReplace ?? false;

  const currentVersion = doc.currentVersion;
  const fileName = currentVersion?.fileName || doc.title;
  const mimeType = currentVersion?.mimeType;
  const isImage = Boolean(mimeType?.startsWith('image/'));
  const downloadUrl =
    currentVersion?.downloadUrl ||
    (currentVersion?.filePath ? getFileUrl(currentVersion.filePath) : null);

  let scopeTooltip: string | undefined = undefined;
  let scopeCountSuffix = '';
  if (doc.shareScope === 'department' && doc.recipientDepartments && doc.recipientDepartments.length > 0) {
    scopeCountSuffix = ` (${doc.recipientDepartments.length})`;
    scopeTooltip = doc.recipientDepartments.map((d) => d.name).join(', ');
  } else if (doc.shareScope === 'user' && doc.recipients && doc.recipients.length > 0) {
    scopeCountSuffix = ` (${doc.recipients.length})`;
    scopeTooltip = doc.recipients.map((r) => r.user?.fullName || r.fullName || 'Nhân sự').join(', ');
  }

  return (
    <div
      onClick={() => onPreview(doc)}
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border bg-white p-3.5 transition-all cursor-pointer hover:shadow-md hover:border-slate-300',
        isUnread ? 'border-primary/40 bg-sky-50/20' : 'border-slate-200'
      )}
    >
      <div className="flex flex-col gap-2.5">
        {/* Card Header: Type icon, Code, Unread dot, and 3-dots Menu */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                isUnread ? 'bg-primary' : 'bg-transparent'
              )}
            />
            <DriveFileIcon filename={fileName} mimeType={mimeType} size={18} />
            <span className="font-mono text-[11px] font-semibold text-slate-500 truncate" title={doc.code}>
              {doc.code}
            </span>
          </div>

          {/* 3-dots menu container */}
          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              title="Thao tác"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg bg-white shadow-xl border border-slate-200 py-1 z-30 text-xs animate-in fade-in-50 zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onPreview(doc);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <FileText size={14} className="text-slate-400" />
                  <span>Chi tiết &amp; Lịch sử</span>
                </button>

                {canReplace && onReplace && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onReplace(doc);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors text-left"
                  >
                    <RefreshCw size={14} className="text-amber-500" />
                    <span>Soạn cơ chế thay thế</span>
                  </button>
                )}

                {canEdit && onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(doc);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sky-700 hover:bg-sky-50 transition-colors text-left"
                  >
                    <FilePen size={14} className="text-sky-500" />
                    <span>Chỉnh sửa</span>
                  </button>
                )}

                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(doc);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-slate-100"
                  >
                    <Trash2 size={14} className="text-rose-500" />
                    <span>Xóa văn bản</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail / Document Preview Area */}
        <div className="relative w-full h-32 rounded-lg bg-[#f0f4f9] border border-slate-200/80 p-2 overflow-hidden flex items-center justify-center">
          {isImage && downloadUrl ? (
            <div className="w-full h-full rounded bg-white overflow-hidden shadow-2xs">
              <img src={downloadUrl} alt={doc.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-full bg-white rounded shadow-2xs border border-slate-200/90 p-2.5 flex flex-col justify-between select-none relative overflow-hidden">
              {/* Background watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] font-black text-slate-900 text-2xl tracking-widest rotate-[-18deg]">
                XT-TECH
              </div>

              {/* Sheet Header */}
              <div className="flex flex-col items-center border-b border-slate-100 pb-1 text-center shrink-0">
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </span>
                <span className="text-[6.5px] text-slate-400 italic">
                  Độc lập - Tự do - Hạnh phúc
                </span>
              </div>

              {/* Sheet Body */}
              <div className="flex-1 flex flex-col justify-center my-1 min-h-0 text-center px-1">
                <span className="text-[9.5px] font-bold text-slate-800 uppercase line-clamp-2 leading-snug">
                  {doc.title}
                </span>
                {doc.summary ? (
                  <p className="text-[8px] text-slate-500 italic line-clamp-2 mt-1 leading-tight">
                    {doc.summary}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1 mt-1.5 opacity-40 px-3">
                    <div className="h-0.5 w-full bg-slate-400 rounded" />
                    <div className="h-0.5 w-4/5 bg-slate-400 rounded mx-auto" />
                    <div className="h-0.5 w-3/5 bg-slate-400 rounded mx-auto" />
                  </div>
                )}
              </div>

              {/* Sheet Footer */}
              <div className="flex items-center justify-between text-[7.5px] text-slate-400 pt-1 border-t border-slate-100 shrink-0">
                <span className="font-mono text-slate-400">{doc.code}</span>
                <span>Trang 1/1</span>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h3
            className={cn(
              'text-xs line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[32px]',
              isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
            )}
            title={doc.title}
          >
            {doc.title}
          </h3>
        </div>

        {/* Badges: Type & Scope */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <RuleTypeBadge type={doc.documentType} />
          <span
            title={scopeTooltip}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 whitespace-nowrap"
          >
            {SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Toàn công ty'}
            {scopeCountSuffix}
          </span>
        </div>
      </div>

      {/* Footer: Date & Read Progress */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar size={12} />
          <span>{formatRuleDate(doc.effectiveDate)}</span>
        </div>
        <div>
          <ReadProgress doc={doc} />
        </div>
      </div>
    </div>
  );
};

const SkeletonCards: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="animate-pulse rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-4 w-4 bg-slate-200 rounded-full" />
        </div>
        <div className="h-28 w-full bg-slate-100 rounded-lg" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
        <div className="flex gap-2">
          <div className="h-4 w-14 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
        </div>
        <div className="h-4 w-full bg-slate-100 rounded pt-1" />
      </div>
    ))}
  </div>
);

export const RulesCardGrid: React.FC<RulesCardGridProps> = ({
  items,
  total,
  offset,
  limit,
  isLoading,
  emptyHint,
  context,
  onPreview,
  onOpenDetail,
  onEdit,
  onDelete,
  onReplace,
  onPageChange,
}) => {
  const currentPage = limit > 0 ? Math.floor(offset / limit) + 1 : 1;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      <div className="flex-1 overflow-auto px-4 custom-scrollbar">
        {isLoading && items.length === 0 ? (
          <SkeletonCards />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            {items.map((doc) => (
              <RuleCard
                key={doc.id}
                doc={doc}
                context={context}
                onPreview={onPreview}
                onOpenDetail={onOpenDetail}
                onEdit={onEdit}
                onDelete={onDelete}
                onReplace={onReplace}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
            <FileSearch size={36} />
            <p className="text-sm font-medium text-slate-500">Chưa có cơ chế nào</p>
            <p className="text-xs">{emptyHint}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={limit}
          onPageChange={(page) => onPageChange((page - 1) * limit)}
          onPageSizeChange={() => {}}
          hideRowPerPage={true}
        />
      </div>
    </div>
  );
};
