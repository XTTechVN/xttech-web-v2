'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createAccessRole, getAccessRoles } from '@/actions';
import { useCan } from '@/hooks';
import { DataList } from '../../_components/data-list';
import { BTN_LINE, BTN_PRIMARY, Field, INPUT, messageOf } from '../../_components/form';
import { PageHeader } from '../../_components/page-header';
import { Sheet } from '../../_components/sheet';
import { RoleCard, roleColumns } from './_components/role-columns';
import { RoleDrawer } from './_components/role-drawer';
import type { AccessRole } from '@/types';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';

// Danh sách vai trò của doanh nghiệp (API /access/roles). Bấm một dòng để sửa quyền.
export default function RemakeRolesListPage() {
  const router = useRouter();
  const { can, isReady } = useCan();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['access-roles'],
    queryFn: getAccessRoles,
    enabled: isReady && can('role:read'),
  });
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<AccessRole | null>(null);
  const [drawer, setDrawer] = useState(false);

  const create = useMutation({
    mutationFn: () => createAccessRole({ name: name.trim() }),
    onSuccess: () => {
      toast.success('Đã tạo vai trò, hãy cấu hình quyền');
      router.push('/remake/access/roles/matrix');
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  if (!isReady) return <ListSkeleton />;
  if (!can('role:read')) return <EmptyState title="Bạn chưa có quyền xem vai trò" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader
        title="Vai trò & quyền"
        description="Quyền do hệ thống định nghĩa; doanh nghiệp tạo vai trò và chọn quyền cho vai trò."
        actionLabel={can('role:create') ? 'Tạo vai trò' : undefined}
        onAction={() => setCreating(true)}
      />

      <Link href="/remake/access/roles/matrix" className={`${BTN_LINE} mb-3`}>
        Cấu hình quyền
      </Link>

      {isLoading && <ListSkeleton />}
      {isError && (
        <ErrorState title="Không tải được vai trò" description="Kiểm tra kết nối rồi thử lại." actionLabel="Thử lại" onAction={() => refetch()} />
      )}
      {data?.length === 0 && <EmptyState title="Chưa có vai trò" description="Tạo vai trò đầu tiên để phân quyền cho thành viên." />}
      {data && data.length > 0 && (
        <DataList
          label="Danh sách vai trò"
          rows={data}
          rowKey={(r) => r.id}
          columns={roleColumns}
          card={(r) => <RoleCard r={r} />}
          onOpen={(r) => {
            setPicked(r);
            setDrawer(true);
          }}
        />
      )}

      <RoleDrawer role={picked} open={drawer} onClose={() => setDrawer(false)} />

      <Sheet open={creating} onClose={() => setCreating(false)} title="Tạo vai trò">
        <form
          className="flex flex-col gap-4 p-rm-gutter"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Field label="Tên vai trò" id="role-name">
            <input id="role-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required autoFocus className={INPUT} />
          </Field>
          <button type="submit" disabled={create.isPending || !name.trim()} className={BTN_PRIMARY}>
            {create.isPending ? 'Đang tạo…' : 'Tạo vai trò'}
          </button>
        </form>
      </Sheet>
    </>
  );
}
