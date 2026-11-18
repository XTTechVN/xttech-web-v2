import type { AuditLog } from '@/types';

export const AuditRow = ({ log: l }: { log: AuditLog }) => (
  <div className="flex min-h-16 flex-col justify-center px-4 py-2 md:flex-row md:items-center md:justify-between md:gap-4">
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold text-gray-900">{l.action}</span>
      <span className="block truncate text-xs text-gray-500">
        {l.actor.userName ?? l.actor.user_name ?? 'Hệ thống'} · {l.resource}
        {(l.targetId ?? l.target_id) ? ` #${l.targetId ?? l.target_id}` : ''}
      </span>
    </span>
    <span className="flex-none text-xs text-gray-500">
      {new Date(l.timestamp).toLocaleString('vi-VN')} · {l.status}
    </span>
  </div>
);
