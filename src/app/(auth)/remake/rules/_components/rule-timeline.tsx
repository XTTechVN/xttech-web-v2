'use client';

import { useQuery } from '@tanstack/react-query';
import { getDocumentTimeline } from '@/actions';
import { APPROVAL_ACTION_MAP } from '@/types';

const at = (s: string) =>
  new Date(s).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

// Lịch sử soạn thảo, gửi duyệt, duyệt, ban hành.
export function RuleTimeline({ id }: { id: number }) {
  const { data = [], isLoading } = useQuery({ queryKey: ['rules', 'timeline', id], queryFn: () => getDocumentTimeline(id) });
  if (isLoading) return <div aria-busy="true" aria-label="Đang tải" className="h-12 animate-rm-pulse rounded-rm bg-rm-line" />;
  if (data.length === 0) return <p className="text-sm text-rm-muted">Chưa có hoạt động nào.</p>;
  return (
    <ol className="flex flex-col gap-3 border-l border-rm-line pl-4">
      {data.map((l) => (
        <li key={l.id} className="relative">
          <span aria-hidden="true" className="absolute -left-[1.3125rem] top-1.5 size-2.5 rounded-full bg-rm-primary" />
          <p className="text-sm font-medium [overflow-wrap:anywhere]">
            {APPROVAL_ACTION_MAP[l.action] ?? l.action}
            {l.actor && <span className="font-normal text-rm-muted"> · {l.actor.fullName}</span>}
          </p>
          <p className="text-xs text-rm-muted">{at(l.createdAt)}</p>
          {l.note && <p className="mt-1 rounded-rm bg-rm-bg px-2 py-1 text-sm [overflow-wrap:anywhere]">{l.note}</p>}
        </li>
      ))}
    </ol>
  );
}
