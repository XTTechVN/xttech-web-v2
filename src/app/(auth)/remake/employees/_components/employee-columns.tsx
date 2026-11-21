import type { Employee } from '@/types';
import { Badge } from '../../_components/badge';
import type { Column } from '../../_components/data-list';
import { POLICIES } from './employee-form';

type Pos = Employee['positions'][number] & { department?: { name: string } };
const posOf = (u: Employee) => u.positions[0] as Pos | undefined;
const posBadge = (u: Employee) => <Badge tone={posOf(u) ? 'primary' : 'neutral'}>{posOf(u)?.name ?? 'Chưa có chức vụ'}</Badge>;
const policyOf = (u: Employee) => POLICIES.find((p) => p.value === (u.attendancePolicy ?? 'administrative'))?.label ?? '–';
const name = (u: Employee) => u.fullName || u.username;

export const employeeColumns: Column<Employee>[] = [
  { key: 'name', header: 'Nhân viên', cell: (u) => <span className="font-medium">{name(u)}</span> },
  { key: 'pos', header: 'Chức vụ', fit: true, cell: posBadge },
  { key: 'dept', header: 'Phòng ban', cell: (u) => posOf(u)?.department?.name ?? '–' },
  { key: 'policy', header: 'Chính sách chấm công', fit: true, cell: policyOf },
  { key: 'phone', header: 'Điện thoại', fit: true, wideOnly: true, cell: (u) => u.phoneNumber ?? '–' },
  { key: 'email', header: 'Email', wideOnly: true, cell: (u) => u.email },
];

export function EmployeeCard({ u }: { u: Employee }) {
  const dept = posOf(u)?.department?.name;
  return (
    <>
      <span className="block truncate text-sm font-medium">{name(u)}</span>
      <span className="flex items-center gap-2">
        {posBadge(u)}
        {dept && <span className="min-w-0 truncate text-xs text-rm-muted">{dept}</span>}
      </span>
      <span className="block truncate text-xs text-rm-muted">{u.email}</span>
    </>
  );
}
