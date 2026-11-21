'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { getAccessMembers, getAccessRoles, getInvitations, resendInvitation, revokeInvitation } from '@/actions';
import { useCan } from '@/hooks';
import type { AccessMember } from '@/types';
import { DataList } from '../../_components/data-list';
import { messageOf } from '../../_components/form';
import { PageHeader } from '../../_components/page-header';
import { EmptyState, ErrorState, ListSkeleton } from '../../_components/state-views';
import { AddMemberSheet } from './_components/add-member-sheet';
import { MemberCard, memberColumns } from './_components/member-columns';
import { MemberSheet } from './_components/member-sheet';
import { SecretSheet, type Secret } from './_components/secret-sheet';

// Thành viên của doanh nghiệp (API /access/members). Bấm một dòng để đổi vai trò, xem quyền, reset mật khẩu, khoá.
export default function RemakeMembersPage() {
  const qc = useQueryClient();
  const { can, canAny, isReady } = useCan();
  const members = useQuery({
    queryKey: ['access-members'],
    queryFn: getAccessMembers,
    enabled: isReady && canAny(['user:assign_role', 'user:create']),
  });
  const roles = useQuery({ queryKey: ['access-roles'], queryFn: getAccessRoles });
  const invitations = useQuery({ queryKey: ['access-invitations'], queryFn: getInvitations });
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<AccessMember | null>(null);
  const [secret, setSecret] = useState<Secret | null>(null);

  const refresh = () => ['access-members', 'access-invitations', 'access-roles'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  const resend = useMutation({
    mutationFn: resendInvitation,
    onSuccess: (r) => {
      toast.success(r.emailSent ? 'Đã gửi lại lời mời' : 'Đã làm mới lời mời nhưng email chưa gửi được');
      refresh();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  const revoke = useMutation({
    mutationFn: revokeInvitation,
    onSuccess: () => {
      toast.success('Đã thu hồi lời mời');
      refresh();
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  const pending = invitations.data ?? [];
  if (!isReady) return <ListSkeleton />;
  if (!canAny(['user:assign_role', 'user:create']))
    return <EmptyState title="Bạn chưa có quyền xem thành viên" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader
        title="Thành viên"
        description="Mời qua email hoặc tạo tài khoản, đổi vai trò, khoá và đặt lại mật khẩu."
        actionLabel={can('user:create') ? 'Thêm thành viên' : undefined}
        onAction={() => setAdding(true)}
      />

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 px-1 text-sm font-medium text-rm-muted">Lời mời đang chờ · {pending.length}</h2>
          <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge bg-rm-surface">
            {pending.map((inv) => (
              <li key={inv.id} className="flex min-h-rm-row flex-wrap items-center gap-x-3 gap-y-1 px-rm-gutter py-2">
                <Mail size={18} className="flex-none text-rm-muted" aria-hidden="true" />
                <span className="min-w-0 flex-1 basis-48">
                  <span className="block truncate text-sm font-medium">{inv.email}</span>
                  <span className="block truncate text-xs text-rm-muted">
                    {inv.roleName} · hết hạn {new Date(inv.expiresAt).toLocaleDateString('vi-VN')}
                  </span>
                </span>
                {can('user:create') && (
                  <span className="flex gap-1 text-sm">
                    <button
                      type="button"
                      onClick={() => resend.mutate(inv.id)}
                      className="h-rm-control rounded-rm px-3 text-rm-primary active:bg-rm-primary-soft"
                    >
                      Gửi lại
                    </button>
                    <button
                      type="button"
                      onClick={() => window.confirm(`Thu hồi lời mời gửi tới ${inv.email}?`) && revoke.mutate(inv.id)}
                      className="h-rm-control rounded-rm px-3 text-rm-danger active:bg-rm-danger-soft"
                    >
                      Thu hồi
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {members.isLoading && <ListSkeleton />}
      {members.isError && (
        <ErrorState
          title="Không tải được thành viên"
          description="Kiểm tra kết nối rồi thử lại."
          actionLabel="Thử lại"
          onAction={() => members.refetch()}
        />
      )}
      {members.data?.length === 0 && <EmptyState title="Chưa có thành viên" description="Thêm thành viên đầu tiên bằng nút phía trên." />}
      {members.data && members.data.length > 0 && (
        <DataList
          label="Danh sách thành viên"
          rows={members.data}
          rowKey={(m) => m.id}
          columns={memberColumns}
          card={(m) => <MemberCard m={m} />}
          onOpen={setOpen}
        />
      )}

      <AddMemberSheet
        open={adding}
        roles={roles.data ?? []}
        onClose={() => setAdding(false)}
        onDone={(created) => {
          setAdding(false);
          refresh();
          if (created) setSecret({ title: 'Tài khoản đã tạo', username: created.member.username, password: created.generatedPassword });
        }}
      />
      <MemberSheet member={open} roles={roles.data ?? []} onClose={() => setOpen(null)} onChanged={refresh} onSecret={setSecret} />
      <SecretSheet secret={secret} onClose={() => setSecret(null)} />
    </>
  );
}
