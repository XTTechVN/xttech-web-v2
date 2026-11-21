import type { AccessRole } from '@/types';
import { Badge } from '../../../_components/badge';
import type { Column } from '../../../_components/data-list';

export const roleColumns: Column<AccessRole>[] = [
  { key: 'name', header: 'Vai trò', cell: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'kind', header: 'Loại', fit: true, cell: (r) => (r.isSystem ? <Badge>Hệ thống</Badge> : 'Tự tạo') },
  { key: 'members', header: 'Thành viên', fit: true, align: 'right', cell: (r) => r.memberCount },
  { key: 'perms', header: 'Quyền', fit: true, align: 'right', cell: (r) => r.permissionCount },
];

export function RoleCard({ r }: { r: AccessRole }) {
  return (
    <>
      <span className="flex items-center gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{r.name}</span>
        {r.isSystem && <Badge>Hệ thống</Badge>}
      </span>
      <span className="block truncate text-xs text-rm-muted">
        {r.memberCount} thành viên · {r.permissionCount} quyền
      </span>
    </>
  );
}
