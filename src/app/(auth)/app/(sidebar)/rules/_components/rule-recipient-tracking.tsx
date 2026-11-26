'use client';

import { DrawerSection, Tag } from '@/components-remake';
import type { DocumentItem } from '@/types';
import { SHARE_SCOPE_MAP } from '@/types';

const MUTED = 'text-sm text-slate-600';

// Văn bản áp dụng cho ai: toàn công ty, phòng ban hoặc cá nhân
export function RuleScopeSection({ doc }: { doc: DocumentItem }) {
  const scopeLabel = SHARE_SCOPE_MAP[doc.shareScope] || doc.shareScope || 'Toàn công ty';
  const depts = doc.recipientDepartments ?? [];
  const people = doc.recipients ?? [];

  return (
    <DrawerSection title="Phạm vi áp dụng">
      <div className="flex flex-wrap items-center gap-1.5">
        {doc.shareScope === 'all' ? (
          <span className="text-sm text-slate-900">{scopeLabel}: toàn thể cán bộ nhân viên trong công ty</span>
        ) : (
          <Tag tone="blue">{scopeLabel}</Tag>
        )}
        {doc.shareScope === 'department' &&
          (depts.length > 0 ? depts.map((d) => <Tag key={d.id} tone="violet">{d.name}</Tag>) : <span className={MUTED}>Chưa chọn phòng ban</span>)}
        {doc.shareScope === 'user' &&
          (people.length > 0 ? (
            people.map((r, i) => (
              <Tag key={r.id || i} tone="green">
                {r.user?.fullName || r.fullName || 'Nhân viên'}
              </Tag>
            ))
          ) : (
            <span className={MUTED}>Chưa chỉ định cá nhân</span>
          ))}
      </div>
    </DrawerSection>
  );
}

// Số người đã đọc / chưa đọc: hai ô số rõ ràng
export function RuleRecipientTracking({ doc }: { doc: DocumentItem }) {
  const stats = doc.recipientStats;
  if (!stats) return null;
  const unread = stats.unreadCount ?? stats.totalRecipients - stats.readCount;

  return (
    <DrawerSection title="Theo dõi người nhận">
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4">
        <div>
          <p className="text-2xl font-medium tabular-nums text-green-700">
            {stats.readCount}
            <span className="text-base font-normal text-slate-600">/{stats.totalRecipients}</span>
          </p>
          <p className={MUTED}>Đã đọc</p>
        </div>
        <div>
          <p className="text-2xl font-medium tabular-nums text-amber-600">{unread}</p>
          <p className={MUTED}>Chưa đọc</p>
        </div>
      </div>
    </DrawerSection>
  );
}
