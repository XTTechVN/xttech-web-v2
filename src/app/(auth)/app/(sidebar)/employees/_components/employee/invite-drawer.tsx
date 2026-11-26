'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import { createInvitation, getInvitations, resendInvitation, revokeInvitation } from '@/actions';
import { getRoles } from '@/actions/role';
import { Input } from '@/components';
import { Button, ConfirmDelete, Drawer, DrawerBody, DrawerHeader, DrawerSection, Select } from '@/components-remake';
import { useCan } from '@/hooks';
import { showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import type { Invitation } from '@/types';

const refresh = () => queryClient.invalidateQueries({ queryKey: ['access-invitations'] });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mời qua email (người được mời tự đặt tên đăng nhập, mật khẩu) và quản lý lời mời đang chờ.
export function InviteDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { can } = useCan();
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [revoking, setRevoking] = useState<Invitation | null>(null);

  const roles = useQuery({ queryKey: ['roles'], queryFn: () => getRoles({ limit: 100 }), enabled: isOpen && can('user:create') });
  const invitations = useQuery({ queryKey: ['access-invitations'], queryFn: getInvitations, enabled: isOpen });
  const pending = invitations.data ?? [];
  const emailError = email && !EMAIL.test(email.trim()) ? 'Email không hợp lệ' : undefined;

  const invite = useMutation({
    mutationFn: () => createInvitation({ email: email.trim(), roleId }),
    onSuccess: (res) => {
      refresh();
      setEmail('');
      setRoleId('');
      if (res.emailSent) showSuccessToast('Đã gửi lời mời qua email');
      else {
        void navigator.clipboard?.writeText(res.inviteLink);
        showSuccessToast('Email chưa gửi được, liên kết mời đã sao chép');
      }
    },
    onError: (e: Error) => showErrorToast(e?.message || 'Không gửi được lời mời'),
  });

  const resend = useMutation({
    mutationFn: (id: string) => resendInvitation(id),
    onSuccess: (r) => {
      refresh();
      showSuccessToast(r.emailSent ? 'Đã gửi lại lời mời' : 'Đã làm mới lời mời nhưng email chưa gửi được');
    },
    onError: (e: Error) => showErrorToast(e?.message || 'Không gửi lại được lời mời'),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeInvitation(id),
    onSuccess: () => {
      refresh();
      showSuccessToast('Đã thu hồi lời mời');
      setRevoking(null);
    },
    onError: (e: Error) => showErrorToast(e?.message || 'Không thu hồi được lời mời'),
  });

  if (!can('user:create')) return null;

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} label="Mời qua email">
        <DrawerHeader compact title="Mời qua email" onClose={onClose} />
        <DrawerBody>
          <form
            className="flex flex-col gap-4 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              invite.mutate();
            }}
          >
            <Input
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="off"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
            />
            <Select
              side
              label="Vai trò"
              placeholder="Chọn vai trò"
              loading={roles.isLoading}
              value={roleId}
              options={(roles.data?.items ?? []).map((r) => ({ value: String(r.id), label: r.name }))}
              onChange={setRoleId}
            />
            <p className="text-xs text-slate-500">Lời mời có hạn 7 ngày. Người được mời tự đặt tên đăng nhập và mật khẩu.</p>
            <Button type="submit" loading={invite.isPending} disabled={!email.trim() || !!emailError || !roleId}>
              Gửi lời mời
            </Button>
          </form>

          <div className="mt-6">
            <DrawerSection title={`Lời mời đang chờ (${pending.length})`}>
              {invitations.isLoading && <p className="text-sm text-slate-500">Đang tải...</p>}
              {invitations.isError && (
                <p className="text-sm text-red-600">
                  Không tải được lời mời.{' '}
                  <button type="button" onClick={() => invitations.refetch()} className="cursor-pointer font-medium underline">
                    Thử lại
                  </button>
                </p>
              )}
              {invitations.data && pending.length === 0 && <p className="text-sm text-slate-500">Chưa có lời mời nào đang chờ.</p>}
              {pending.length > 0 && (
                <ul className="divide-y divide-slate-100 rounded-control border border-slate-200">
                  {pending.map((inv) => (
                    <li key={inv.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
                      <Mail size={16} className="flex-none text-slate-500" aria-hidden="true" />
                      <span className="min-w-0 flex-1 basis-40">
                        <span className="block truncate text-sm font-medium text-slate-900" title={inv.email}>
                          {inv.email}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {inv.roleName} · hết hạn {new Date(inv.expiresAt).toLocaleDateString('vi-VN')}
                        </span>
                      </span>
                      <span className="flex flex-none gap-1">
                        <Button variant="outline" loading={resend.isPending && resend.variables === inv.id} onClick={() => resend.mutate(inv.id)}>
                          Gửi lại
                        </Button>
                        <Button variant="outline" className="text-red-700" onClick={() => setRevoking(inv)}>
                          Thu hồi
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DrawerSection>
          </div>
        </DrawerBody>
      </Drawer>

      <ConfirmDelete
        isOpen={!!revoking}
        title="Thu hồi lời mời"
        pending={revoke.isPending}
        confirmLabel="Thu hồi"
        warning="Liên kết mời đã gửi sẽ không dùng được nữa."
        onClose={() => setRevoking(null)}
        onConfirm={() => revoking && revoke.mutate(revoking.id)}
      >
        Thu hồi lời mời gửi tới <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{revoking?.email}</strong>?
      </ConfirmDelete>
    </>
  );
}
