import type { AccessMember } from '@/types';
import { Badge } from '../../../_components/badge';
import type { Column } from '../../../_components/data-list';

const roles = (m: AccessMember) => m.roles.map((r) => r.name).join(', ') || 'Chưa có vai trò';
const name = (m: AccessMember) => m.fullName || m.username;

export const memberColumns: Column<AccessMember>[] = [
  { key: 'name', header: 'Thành viên', cell: (m) => <span className="font-medium">{name(m)}</span> },
  { key: 'user', header: 'Tài khoản', fit: true, wideOnly: true, cell: (m) => m.username },
  { key: 'email', header: 'Email', wideOnly: true, cell: (m) => m.email },
  { key: 'roles', header: 'Vai trò', cell: roles },
  { key: 'status', header: 'Trạng thái', fit: true, cell: (m) => (m.status === 'locked' ? <Badge tone="danger">Đã khoá</Badge> : 'Hoạt động') },
];

export function MemberCard({ m }: { m: AccessMember }) {
  return (
    <>
      <span className="flex items-center gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{name(m)}</span>
        {m.status === 'locked' && <Badge tone="danger">Đã khoá</Badge>}
      </span>
      <span className="block truncate text-xs text-rm-muted">{roles(m)}</span>
    </>
  );
}
