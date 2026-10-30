'use client';

import React from 'react';
import dayjs from 'dayjs';
import { AlertTriangle, Building2, Globe, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components';
import type { DocumentItem } from '@/types';
import { DOCUMENT_STATUS_MAP, DOCUMENT_TYPE_MAP } from '@/types';
import { cn } from '@/utils';
import { EXPIRING_SOON_DAYS } from '../_utils/rules-constants';

export const formatRuleDate = (value?: string | null): string => (value ? dayjs(value).format('DD/MM/YYYY') : '—');

export const formatRuleDateTime = (value?: string | null): string => (value ? dayjs(value).format('HH:mm DD/MM/YYYY') : '—');

export const getDaysUntilExpiry = (doc: DocumentItem): number | null => {
  if (doc.status !== 'published' || !doc.expirationDate) return null;
  return dayjs(doc.expirationDate).startOf('day').diff(dayjs().startOf('day'), 'day');
};

export const getFileExtensionBadge = (fileName?: string, mimeType?: string): { ext: string; badgeClass: string } => {
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

export const RuleTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const info = DOCUMENT_TYPE_MAP[type];
  return (
    <Badge size="sm" className={cn('whitespace-nowrap', info?.badgeClass)}>
      {info?.label || type}
    </Badge>
  );
};

export const RuleStatusBadge: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
  const info = DOCUMENT_STATUS_MAP[doc.status];
  const daysLeft = getDaysUntilExpiry(doc);
  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= EXPIRING_SOON_DAYS;

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge size="sm" className={cn('whitespace-nowrap', info?.badgeClass)}>
        {info?.label || doc.status}
      </Badge>
      {isExpiringSoon && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
          <AlertTriangle size={11} />
          Còn {daysLeft} ngày hết hiệu lực
        </span>
      )}
    </div>
  );
};

export const TargetScopeBox: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
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

export const CardReadCompliance: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
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
