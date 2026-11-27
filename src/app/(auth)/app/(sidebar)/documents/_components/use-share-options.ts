import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDepartments, getEmployees } from '@/actions';
import type { SelectOption } from '@/components-remake';

export interface PickOption extends SelectOption {
  sub?: string;
}

const listOf = (raw: unknown): { id: number | string; name?: string; code?: string }[] => {
  const src = (raw as { data?: unknown })?.data ?? raw;
  if (Array.isArray(src)) return src;
  return Array.isArray((src as { items?: unknown })?.items) ? (src as { items: [] }).items : [];
};

// Danh sách người nhận / người duyệt / phòng ban cho form ban hành.
export function useShareOptions(enabled: boolean, excludeUserId?: string) {
  const people = useQuery({ queryKey: ['rule-opt', 'employees'], queryFn: () => getEmployees({ limit: 200 }), enabled });
  const approvers = useQuery({
    queryKey: ['rule-opt', 'approvers'],
    queryFn: () => getEmployees({ limit: 200, permission: 'user:update' }),
    enabled,
  });
  const depts = useQuery({ queryKey: ['rule-opt', 'departments'], queryFn: () => getDepartments({ limit: 100 }), enabled });

  return useMemo(() => {
    const toUser = (e: { id: string; fullName?: string; username?: string; email?: string }): PickOption => ({
      value: String(e.id),
      label: e.fullName || e.username || 'Nhân sự',
      sub: e.email,
    });
    const others = (items?: { id: string }[]) => (items ?? []).filter((e) => e?.id && String(e.id) !== excludeUserId);
    return {
      employees: others(people.data?.items).map((e) => toUser(e as never)),
      approvers: others(approvers.data?.items).map((e) => toUser(e as never)),
      departments: listOf(depts.data).map((d): PickOption => ({ value: String(d.id), label: d.name ?? '', sub: d.code })),
    };
  }, [people.data, approvers.data, depts.data, excludeUserId]);
}
