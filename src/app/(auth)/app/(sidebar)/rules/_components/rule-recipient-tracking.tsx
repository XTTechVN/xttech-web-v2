'use client';

import React from 'react';
import type { DocumentItem } from '@/types';
import { SHARE_SCOPE_MAP } from '@/types';

interface RuleRecipientTrackingProps {
  doc: DocumentItem;
}

export const RuleInfoItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-xs font-medium text-slate-700 truncate">{value || '—'}</p>
  </div>
);

export const RuleScopeSection: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
  const scopeLabel = SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Toàn công ty';

  return (
    <section>
      <h3 className="text-xs font-bold text-slate-700 mb-2">Phạm vi áp dụng</h3>
      <div className="flex flex-col gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            {scopeLabel}
          </span>
          {doc.shareScope === 'all' && (
            <span className="text-slate-500">Áp dụng cho toàn thể cán bộ nhân viên trong công ty</span>
          )}
        </div>

        {doc.shareScope === 'department' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Phòng ban áp dụng:</span>
            {doc.recipientDepartments && doc.recipientDepartments.length > 0 ? (
              doc.recipientDepartments.map((dept) => (
                <span
                  key={dept.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {dept.name}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">Đang cập nhật phòng ban cụ thể</span>
            )}
          </div>
        )}

        {doc.shareScope === 'user' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Cá nhân áp dụng ({doc.recipients?.length || 0}):</span>
            {doc.recipients && doc.recipients.length > 0 ? (
              doc.recipients.map((r, idx) => (
                <span
                  key={r.id || idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <span>👤</span>
                  <span>{r.user?.fullName || r.fullName || 'Nhân viên'}</span>
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">Chưa có cá nhân nào được chỉ định</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

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
