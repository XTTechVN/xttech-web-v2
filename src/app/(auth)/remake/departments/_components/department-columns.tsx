import type { Department } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';

export const departmentColumns: Column<Department>[] = [
  { key: 'name', header: 'Phòng ban', cell: (d) => <span className="font-medium">{d.name}</span> },
  { key: 'code', header: 'Mã', fit: true, cell: (d) => (d.code ? <Badge>{d.code}</Badge> : '–') },
];

export function DepartmentCard({ d }: { d: Department }) {
  return (
    <span className="flex items-center gap-2">
      <span className="min-w-0 truncate text-sm font-medium">{d.name}</span>
      {d.code && <Badge>{d.code}</Badge>}
    </span>
  );
}
