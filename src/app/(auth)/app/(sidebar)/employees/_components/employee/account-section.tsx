'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { KeyRound, Lock, LockOpen } from 'lucide-react';
import { getAccessMembers, lockAccessMember, resetAccessMemberPassword } from '@/actions';
import { Button, ConfirmDelete, DrawerSection, InfoRow, Tag } from '@/components-remake';
import { useCan } from '@/hooks';
import { showErrorToast, showSuccessToast } from '@/utils';
import queryClient from '@/utils/query';
import type { Employee } from '@/types';
import { PasswordSecretModal, type PasswordSecret } from './password-secret-modal';

type Confirm = 'lock' | 'reset' | null;

// Khóa/mở khóa (user:lock) và đặt lại mật khẩu (user:reset_password), mỗi nút xét quyền riêng.
export function AccountSection({ employee }: { employee: Employee }) {
  const { can } = useCan();
  const canLock = can('user:lock');
  const canReset = can('user:reset_password');
  const allowed = canLock || canReset;
  const name = employee.fullName || employee.username;
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [secret, setSecret] = useState<PasswordSecret | null>(null);

  const members = useQuery({ queryKey: ['access-members'], queryFn: getAccessMembers, enabled: allowed });
  const member = members.data?.find((m) => m.id === employee.id);
  const locked = member?.status === 'locked';

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['access-members'] });

  const lock = useMutation({
    mutationFn: () => lockAccessMember(employee.id, !locked),
    onSuccess: () => {
      refresh();
      showSuccessToast(locked ? `Đã mở khóa ${name}` : `Đã khóa tài khoản ${name}`);
      setConfirm(null);
    },
    onError: (e: Error) => showErrorToast(e?.message || 'Không đổi được trạng thái tài khoản'),
  });

  const reset = useMutation({
    mutationFn: () => resetAccessMemberPassword(employee.id),
    onSuccess: (r) => {
      refresh();
      setConfirm(null);
      setSecret({ username: r.member.username, password: r.generatedPassword });
    },
    onError: (e: Error) => showErrorToast(e?.message || 'Không đặt lại được mật khẩu'),
  });

  if (!allowed) return null;

  return (
    <>
      <DrawerSection>
        <InfoRow label="Trạng thái">
          {member ? <Tag tone={locked ? 'red' : 'green'}>{locked ? 'Đã khóa' : 'Đang hoạt động'}</Tag> : '–'}
        </InfoRow>
        {member?.mustChangePassword && <InfoRow label="Mật khẩu">Chờ người dùng đổi khi đăng nhập</InfoRow>}
        <div className="grid grid-cols-2 gap-2 md:flex">
          {canReset && (
            <Button variant="outline" className="min-w-0" icon={<KeyRound size={16} />} disabled={!member} onClick={() => setConfirm('reset')}>
              Đặt lại mật khẩu
            </Button>
          )}
          {canLock && (locked ? (
            <Button variant="outline" className="min-w-0" icon={<LockOpen size={16} />} loading={lock.isPending} onClick={() => lock.mutate()}>
              Mở khóa
            </Button>
          ) : (
            <Button variant="outline" className="min-w-0" icon={<Lock size={16} />} disabled={!member} onClick={() => setConfirm('lock')}>
              Khóa tài khoản
            </Button>
          ))}
        </div>
      </DrawerSection>

      <ConfirmDelete
        isOpen={confirm === 'lock'}
        title="Khóa tài khoản"
        pending={lock.isPending}
        confirmLabel="Khóa"
        warning="Người này sẽ không đăng nhập được cho tới khi mở khóa."
        onClose={() => setConfirm(null)}
        onConfirm={() => lock.mutate()}
      >
        Khóa tài khoản <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{name}</strong>?
      </ConfirmDelete>
      <ConfirmDelete
        isOpen={confirm === 'reset'}
        title="Đặt lại mật khẩu"
        pending={reset.isPending}
        confirmLabel="Đặt lại"
        warning="Mật khẩu cũ sẽ không dùng được nữa."
        onClose={() => setConfirm(null)}
        onConfirm={() => reset.mutate()}
      >
        Sinh mật khẩu mới cho <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{name}</strong>?
      </ConfirmDelete>
      <PasswordSecretModal secret={secret} onClose={() => setSecret(null)} />
    </>
  );
}
