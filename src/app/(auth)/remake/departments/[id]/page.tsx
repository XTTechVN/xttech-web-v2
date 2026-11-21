'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { getDepartment, getEmployees, getPositions } from '@/actions';
import { useCan } from '@/hooks';
import type { Department, Position } from '@/types';
import { Badge } from '../../_components/badge';
import { BTN_LINE } from '../../_components/form';
import { BackLink, PageHeader } from '../../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { DepartmentSheet } from '../_components/department-sheet';

// Chi tiết phòng ban: chức vụ và thành viên đang thuộc phòng.
export default function RemakeDepartmentDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const { can } = useCan();
  const [edit, setEdit] = useState(false);
  const dept = useQuery({ queryKey: ['department', id], queryFn: (): Promise<Department> => getDepartment(id) });
  const positions = useQuery({ queryKey: ['department', id, 'positions'], queryFn: () => getPositions({ limit: 200 }) });
  const own = (positions.data?.items ?? []).filter((p: Position) => p.departmentId === id); // API chưa lọc theo phòng ban
  const members = useQuery({ queryKey: ['department', id, 'members'], queryFn: () => getEmployees({ departmentId: id, limit: 100, offset: 0 }) });
  const d = dept.data;

  return (
    <>
      <BackLink href="/remake/departments" label="Phòng ban" />
      {dept.isLoading && <ListSkeleton />}
      {dept.isError && (
        <ErrorState
          title="Không tải được phòng ban"
          description="Kiểm tra kết nối rồi thử lại."
          actionLabel="Thử lại"
          onAction={() => dept.refetch()}
        />
      )}
      {d && (
        <>
          <PageHeader title={d.name} description={d.code} />
          {can('department:update') && (
            <button type="button" onClick={() => setEdit(true)} className={`${BTN_LINE} mb-4 w-full md:w-auto md:px-6`}>
              Sửa phòng ban
            </button>
          )}

          <h2 className="mb-2 text-sm font-semibold">Chức vụ · {own.length}</h2>
          {positions.isLoading && <ListSkeleton rows={2} />}
          {positions.data && own.length === 0 && <p className="mb-4 text-sm text-rm-muted">Chưa có chức vụ.</p>}
          {own.length > 0 && (
            <ul className="mb-4 divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
              {own.map((p: Position) => {
                const count = members.data?.items.filter((u) => u.positions.some((x) => x.id === p.id)).length;
                return (
                  <li key={p.id} className="flex min-h-rm-row items-center gap-3 px-rm-gutter py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      {count !== undefined && <span className="block truncate text-xs text-rm-muted">{count} thành viên</span>}
                    </span>
                    <Badge tone="primary">Chức vụ</Badge>
                  </li>
                );
              })}
            </ul>
          )}

          <h2 className="mb-2 text-sm font-semibold">Thành viên · {members.data?.meta.total ?? 0}</h2>
          {members.isLoading && <ListSkeleton rows={3} />}
          {members.isError && (
            <ErrorState title="Không tải được thành viên" description="Thử lại sau." actionLabel="Thử lại" onAction={() => members.refetch()} />
          )}
          {members.data && members.data.items.length === 0 && (
            <EmptyState title="Chưa có thành viên" description="Gán chức vụ của phòng cho nhân sự ở trang Nhân viên." />
          )}
          {(members.data?.items.length ?? 0) > 0 && (
            <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
              {members.data!.items.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/remake/employees?open=${u.id}`}
                    className="flex min-h-rm-row items-center gap-3 px-rm-gutter py-2 active:bg-rm-bg md:hover:bg-rm-bg"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 truncate text-sm font-medium">{u.fullName || u.username}</span>
                        {u.positions[0] && <Badge>{u.positions[0].name}</Badge>}
                      </span>
                      <span className="block truncate text-xs text-rm-muted">{u.email}</span>
                    </span>
                    <ChevronRight size={18} className="flex-none text-rm-muted" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <DepartmentSheet key={edit ? `d-${d.id}` : 'none'} target={edit ? d : null} onClose={() => setEdit(false)} />
        </>
      )}
    </>
  );
}
