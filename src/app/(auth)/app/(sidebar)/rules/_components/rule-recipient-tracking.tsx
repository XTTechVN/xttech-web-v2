'use client';

import React from 'react';
import type { DocumentItem } from '@/types';

interface RuleRecipientTrackingProps {
  doc: DocumentItem;
}

// Bảng theo dõi đọc — chỉ hiển thị số nhân viên đã đọc và chưa đọc
export const RuleRecipientTracking: React.FC<RuleRecipientTrackingProps> = ({ doc }) => {
  const stats = doc.recipientStats;
  if (!stats) return null;

  const unreadCount = stats.unreadCount ?? (stats.totalRecipients - stats.readCount);

  return (
    <section>
      <h3 className="text-xs font-bold text-slate-700 mb-2">Theo dõi người nhận</h3>
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <div>
          <span>Đã đọc: </span>
          <strong className="text-emerald-600 font-semibold">{stats.readCount}</strong>/{stats.totalRecipients} nhân viên
        </div>
        <div className="w-px h-3.5 bg-slate-200 hidden sm:block" />
        <div>
          <span>Chưa đọc: </span>
          <strong className="text-amber-600 font-semibold">{unreadCount}</strong> nhân viên
        </div>
      </div>
    </section>
  );
};

