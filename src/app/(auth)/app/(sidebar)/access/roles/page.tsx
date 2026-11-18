'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Lock, Plus, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components';
import { cloneAccessRole, createAccessRole, deleteAccessRole, getAccessRoles, renameAccessRole } from '@/actions';
import { useCan } from '@/hooks';
import type { AccessRole } from '@/types';
import { ListState, PageHeader } from '../_components/page-header';
import { RowMenu } from '../_components/row-menu';
import { RoleNameModal, type RoleNameMode } from './_components/role-name-modal';

const messageOf = (e: unknown) => (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? 'Có lỗi xảy ra';

export default function AccessRolesPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { can } = useCan();
  const [modal, setModal] = useState<{ mode: RoleNameMode; role?: AccessRole } | null>(null);
  const [error, setError] = useState<string>();
  const [openCount, setOpenCount] = useState(0);
  const openModal = (m: { mode: RoleNameMode; role?: AccessRole }) => {
    setOpenCount((n) => n + 1);
    setModal(m);
  };
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['access-roles'], queryFn: getAccessRoles });

  const done = () => {
    setModal(null);
    setError(undefined);
    qc.invalidateQueries({ queryKey: ['access-roles'] });
  };
  const save = useMutation({
    mutationFn: async (name: string) => {
      if (!modal) return;
      if (modal.mode.kind === 'create') return createAccessRole({ name });
      if (modal.mode.kind === 'rename' && modal.role) return renameAccessRole(modal.role.id, { name, description: modal.role.description ?? undefined });
      if (modal.mode.kind === 'clone' && modal.role) return cloneAccessRole(modal.role.id, name);
    },
    onSuccess: (role) => {
      toast.success('Đã lưu vai trò');
      done();
      if (role && modal?.mode.kind !== 'rename') router.push(`/app/access/roles/${role.id}`);
    },
    onError: (e) => setError(messageOf(e)),
  });
  const remove = useMutation({
    mutationFn: (role: AccessRole) => deleteAccessRole(role.id),
    onSuccess: () => {
      toast.success('Đã xoá vai trò');
      qc.invalidateQueries({ queryKey: ['access-roles'] });
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  const menuFor = (role: AccessRole) => [
    { label: 'Đổi tên', disabled: role.isSystem || !can('role:update'), hint: role.isSystem ? 'Role mẫu đã khoá' : undefined, onSelect: () => openModal({ mode: { kind: 'rename', name: role.name }, role }) },
    { label: 'Nhân bản', disabled: !can('role:create'), onSelect: () => openModal({ mode: { kind: 'clone', name: role.name }, role }) },
    {
      label: 'Xoá',
      danger: true,
      disabled: role.isSystem || role.memberCount > 0 || !can('role:delete'),
      hint: role.isSystem ? 'Role mẫu đã khoá' : role.memberCount > 0 ? 'Còn người dùng, hãy chuyển họ sang vai trò khác trước' : undefined,
      onSelect: () => window.confirm(`Xoá vai trò "${role.name}"?`) && remove.mutate(role),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <PageHeader
        title="Vai trò & quyền"
        description="Quyền do hệ thống định nghĩa; doanh nghiệp chỉ tạo vai trò và chọn quyền cho vai trò."
        action={
          can('role:create') && (
            <button type="button" onClick={() => openModal({ mode: { kind: 'create' } })} aria-label="Tạo vai trò" className="inline-flex h-11 flex-none items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-white active:scale-95">
              <Plus size={18} />
              <span className="hidden sm:inline">Tạo vai trò</span>
            </button>
          )
        }
      />

      {isLoading && <ListState kind="loading" />}
      {isError && <ListState kind="error" onRetry={() => refetch()} />}
      {data && data.length === 0 && <ListState kind="empty" emptyText="Chưa có vai trò nào." />}
      {data && data.length > 0 && (
        <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {data.map((role) => (
            <li key={role.id} className="flex min-h-16 items-center gap-1 pl-4 pr-1">
              <Link href={`/app/access/roles/${role.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-2 active:bg-gray-50">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-gray-100 text-gray-500">
                  {role.isSystem ? <Lock size={16} aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900">{role.name}</span>
                    {role.isSystem && <Badge size="sm">Mẫu</Badge>}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {role.memberCount} thành viên · {role.permissionCount} quyền · <span className="font-mono">{role.code}</span>
                  </span>
                </span>
              </Link>
              <RowMenu label={`Thao tác với ${role.name}`} items={menuFor(role)} />
            </li>
          ))}
        </ul>
      )}

      <RoleNameModal key={openCount} mode={modal?.mode ?? null} loading={save.isPending} error={error} onSubmit={(n) => save.mutate(n)} onClose={() => { setModal(null); setError(undefined); }} />
    </div>
  );
}
