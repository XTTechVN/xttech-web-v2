'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Mail, Plus } from 'lucide-react';
import { Badge } from '@/components';
import { getAccessMembers, getAccessRoles, getInvitations, lockAccessMember, resendInvitation, resetAccessMemberPassword, revokeInvitation } from '@/actions';
import { useCan } from '@/hooks';
import type { AccessMember } from '@/types';
import { ListState, PageHeader } from '../_components/page-header';
import { RowMenu } from '../_components/row-menu';
import { AddMemberModal } from './_components/add-member-modal';
import { EffectiveModal } from './_components/effective-modal';
import { MemberRolesModal } from './_components/member-roles-modal';
import { SecretModal } from './_components/secret-modal';

const messageOf = (e: unknown) => (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? 'Có lỗi xảy ra';

export default function AccessMembersPage() {
  const qc = useQueryClient();
  const { can } = useCan();
  const members = useQuery({ queryKey: ['access-members'], queryFn: getAccessMembers });
  const roles = useQuery({ queryKey: ['access-roles'], queryFn: getAccessRoles });
  const invitations = useQuery({ queryKey: ['access-invitations'], queryFn: getInvitations });
  const [adding, setAdding] = useState(false);
  const [rolesFor, setRolesFor] = useState<AccessMember | null>(null);
  const [effectiveFor, setEffectiveFor] = useState<AccessMember | null>(null);
  const [secret, setSecret] = useState<{ username: string; password: string; title: string } | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['access-members'] });
    qc.invalidateQueries({ queryKey: ['access-invitations'] });
    qc.invalidateQueries({ queryKey: ['access-roles'] });
  };
  const lock = useMutation({
    mutationFn: (m: AccessMember) => lockAccessMember(m.id, m.status === 'active'),
    onSuccess: refresh,
    onError: (e) => toast.error(messageOf(e)),
  });
  const reset = useMutation({
    mutationFn: (m: AccessMember) => resetAccessMemberPassword(m.id),
    onSuccess: (r) => setSecret({ username: r.member.username, password: r.generatedPassword, title: 'Mật khẩu mới' }),
    onError: (e) => toast.error(messageOf(e)),
  });
  const resend = useMutation({ mutationFn: resendInvitation, onSuccess: (r) => { toast.success(r.emailSent ? 'Đã gửi lại lời mời' : 'Đã làm mới lời mời (email chưa gửi được)'); refresh(); }, onError: (e) => toast.error(messageOf(e)) });
  const revoke = useMutation({ mutationFn: revokeInvitation, onSuccess: () => { toast.success('Đã thu hồi lời mời'); refresh(); }, onError: (e) => toast.error(messageOf(e)) });

  const menuFor = (m: AccessMember) => [
    { label: 'Đổi vai trò', disabled: !can('user:assign_role'), onSelect: () => setRolesFor(m) },
    { label: 'Quyền hiện có', onSelect: () => setEffectiveFor(m) },
    { label: 'Reset mật khẩu', disabled: !can('user:update'), onSelect: () => window.confirm(`Sinh mật khẩu mới cho ${m.username}? Mật khẩu cũ sẽ không dùng được.`) && reset.mutate(m) },
    { label: m.status === 'active' ? 'Khoá tài khoản' : 'Mở khoá', danger: m.status === 'active', disabled: !can('user:update'), onSelect: () => (m.status === 'locked' || window.confirm(`Khoá tài khoản ${m.username}?`)) && lock.mutate(m) },
  ];

  const pending = invitations.data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <PageHeader
        title="Thành viên"
        description="Mời qua email hoặc tạo luôn tài khoản, đổi vai trò, khoá và đặt lại mật khẩu."
        action={
          can('user:create') && (
            <button type="button" onClick={() => setAdding(true)} aria-label="Thêm thành viên" className="inline-flex h-11 flex-none items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-white active:scale-95">
              <Plus size={18} /><span className="hidden sm:inline">Thêm thành viên</span>
            </button>
          )
        }
      />

      {pending.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-sm font-semibold text-gray-700">Lời mời đang chờ · {pending.length}</h2>
          <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {pending.map((inv) => (
              <li key={inv.id} className="flex min-h-16 items-center gap-1 pl-4 pr-1">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-gray-100 text-gray-500"><Mail size={16} aria-hidden="true" /></span>
                <span className="ml-3 min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-900">{inv.email}</span>
                  <span className="block truncate text-xs text-gray-500">{inv.roleName} · hết hạn {new Date(inv.expiresAt).toLocaleDateString('vi-VN')}</span>
                </span>
                <RowMenu label={`Thao tác với lời mời ${inv.email}`} items={[
                  { label: 'Gửi lại', onSelect: () => resend.mutate(inv.id) },
                  { label: 'Thu hồi', danger: true, onSelect: () => window.confirm(`Thu hồi lời mời gửi tới ${inv.email}?`) && revoke.mutate(inv.id) },
                ]} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {members.isLoading && <ListState kind="loading" />}
      {members.isError && <ListState kind="error" onRetry={() => members.refetch()} />}
      {members.data && members.data.length === 0 && <ListState kind="empty" emptyText="Chưa có thành viên nào." />}
      {members.data && members.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {members.data.map((m) => (
            <li key={m.id} className="flex min-h-16 items-center gap-1 pl-4 pr-1">
              <span className="min-w-0 flex-1 py-2">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900">{m.fullName || m.username}</span>
                  {m.status === 'locked' && <Badge size="sm" variant="danger">Đã khoá</Badge>}
                  {m.mustChangePassword && <Badge size="sm" variant="warning">Chờ đổi mật khẩu</Badge>}
                </span>
                <span className="block truncate text-xs text-gray-500">{m.email}</span>
                <span className="block truncate text-xs text-gray-500">{m.roles.map((r) => r.name).join(', ') || 'Chưa có vai trò'}</span>
              </span>
              <RowMenu label={`Thao tác với ${m.username}`} items={menuFor(m)} />
            </li>
          ))}
        </ul>
      )}

      <AddMemberModal
        open={adding}
        roles={roles.data ?? []}
        onClose={() => setAdding(false)}
        onInvited={() => { setAdding(false); refresh(); }}
        onCreated={(s) => { setAdding(false); refresh(); setSecret({ username: s.member.username, password: s.generatedPassword, title: 'Tài khoản đã tạo' }); }}
      />
      <MemberRolesModal key={rolesFor?.id ?? 'none'} member={rolesFor} roles={roles.data ?? []} onClose={() => setRolesFor(null)} onSaved={() => { setRolesFor(null); refresh(); }} />
      <EffectiveModal member={effectiveFor} onClose={() => setEffectiveFor(null)} />
      <SecretModal title={secret?.title ?? ''} username={secret?.username ?? ''} secret={secret?.password ?? null} onClose={() => setSecret(null)} />
    </div>
  );
}
