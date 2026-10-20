'use client';

import React from 'react';
import dayjs from 'dayjs';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components';
import type { DocumentItem } from '@/types';
import { DOCUMENT_STATUS_MAP, DOCUMENT_TYPE_MAP } from '@/types';
import { cn } from '@/utils';
import { EXPIRING_SOON_DAYS } from '../_utils/rules-constants';

export const formatRuleDate = (value?: string | null): string => (value ? dayjs(value).format('DD/MM/YYYY') : '—');

export const formatRuleDateTime = (value?: string | null): string => (value ? dayjs(value).format('HH:mm DD/MM/YYYY') : '—');

// Số ngày còn lại đến hạn hết hiệu lực; null nếu không áp dụng
export const getDaysUntilExpiry = (doc: DocumentItem): number | null => {
  if (doc.status !== 'published' || !doc.expirationDate) return null;
  return dayjs(doc.expirationDate).startOf('day').diff(dayjs().startOf('day'), 'day');
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
