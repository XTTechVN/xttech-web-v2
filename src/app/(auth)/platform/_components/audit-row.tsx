import type { AuditLog } from '@/types';

export function AuditRow({ log: l }: { log: AuditLog }) {
  const target = l.targetId ?? l.target_id;
  return (
    <div className="flex min-h-14 flex-col justify-center gap-0.5 px-4 py-2 md:flex-row md:items-center md:justify-between md:gap-4">
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-slate-900">{l.action}</span>
        <span className="block truncate text-xs text-slate-500">
          {l.actor.userName ?? l.actor.user_name ?? 'Hệ thống'} · {l.resource}
          {target ? ` #${target}` : ''}
        </span>
      </span>
      <span className="flex-none text-xs text-slate-500">
        {new Date(l.timestamp).toLocaleString('vi-VN')} · {l.status}
      </span>
    </div>
  );
}
