'use client';

import { useQuery } from '@tanstack/react-query';
import { getMemberEffectivePermissions } from '@/actions';
import { DrawerSection } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Employee } from '@/types';

const SCOPE = { own: 'Của mình', dept: 'Phòng ban', org: 'Cả doanh nghiệp' } as const;

// Quyền thực tế của một người (gộp từ các vai trò). Chỉ tải khi mở tab. Người có user:assign_role mới thấy.
export function PermissionsSection({ employee }: { employee: Employee }) {
  const { can } = useCan();
  const allowed = can('user:assign_role');
  const perms = useQuery({
    queryKey: ['member-effective', employee.id],
    queryFn: () => getMemberEffectivePermissions(employee.id),
    enabled: allowed,
  });

  if (!allowed) return null;

  return (
    <DrawerSection>
      {perms.isLoading && <p className="text-sm text-slate-500">Đang tải...</p>}
      {perms.isError && (
        <p className="text-sm text-red-600">
          Không tải được quyền.{' '}
          <button type="button" onClick={() => perms.refetch()} className="cursor-pointer font-medium underline">
            Thử lại
          </button>
        </p>
      )}
      {perms.data?.length === 0 && <p className="text-sm text-slate-500">Người này chưa có quyền nào.</p>}
      {perms.data && perms.data.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-control border border-slate-200">
          {perms.data.map((p) => (
            <li key={p.code} className="flex min-h-10 items-center justify-between gap-3 px-3 py-1.5">
              <span className="min-w-0 flex-1 text-sm text-slate-800 [overflow-wrap:anywhere]">{p.nameVi}</span>
              <span className="flex-none text-xs text-slate-500">{SCOPE[p.scope]}</span>
            </li>
          ))}
        </ul>
      )}
    </DrawerSection>
  );
}
