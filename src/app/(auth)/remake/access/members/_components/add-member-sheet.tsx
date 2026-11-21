'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createAccessMember, createInvitation } from '@/actions';
import type { AccessRole, MemberSecret } from '@/types';
import { cn } from '@/utils/cn';
import { BTN_PRIMARY, Field, INPUT, messageOf } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';

interface Props {
  open: boolean;
  roles: AccessRole[];
  onClose: () => void;
  onDone: (created?: MemberSecret) => void;
}

// Hai cách thêm người: mời qua email (người được mời tự đặt mật khẩu) hoặc tạo luôn tài khoản (mật khẩu sinh một lần)
export function AddMemberSheet({ open, roles, onClose, onDone }: Props) {
  const [mode, setMode] = useState<'invite' | 'create'>('invite');
  const [form, setForm] = useState({ email: '', fullName: '', username: '', roleId: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const run = useMutation({
    mutationFn: async () => {
      if (mode === 'create')
        return createAccessMember({ username: form.username, email: form.email, fullName: form.fullName, roleIds: [form.roleId] });
      return createInvitation({ email: form.email, roleId: form.roleId });
    },
    onSuccess: (res) => {
      setForm({ email: '', fullName: '', username: '', roleId: '' });
      if ('generatedPassword' in res) return onDone(res);
      toast.success(res.emailSent ? 'Đã gửi lời mời qua email' : 'Đã tạo lời mời nhưng email chưa gửi được, liên kết đã sao chép');
      if (!res.emailSent) void navigator.clipboard?.writeText(res.inviteLink);
      onDone();
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open={open} onClose={onClose} title="Thêm thành viên">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          run.mutate();
        }}
      >
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-rm bg-rm-bg p-1 text-sm">
          {(['invite', 'create'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn('h-10 rounded-rm font-medium', mode === m ? 'bg-rm-surface text-rm-primary' : 'text-rm-muted')}
            >
              {m === 'invite' ? 'Mời qua email' : 'Tạo tài khoản'}
            </button>
          ))}
        </div>
        <Field label="Email" id="m-email">
          <input
            id="m-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            value={form.email}
            onChange={set('email')}
            required
            className={INPUT}
          />
        </Field>
        {mode === 'create' && (
          <>
            <Field label="Họ và tên" id="m-name">
              <input id="m-name" value={form.fullName} onChange={set('fullName')} required className={INPUT} />
            </Field>
            <Field label="Tên đăng nhập" id="m-user">
              <input
                id="m-user"
                value={form.username}
                onChange={set('username')}
                minLength={3}
                required
                autoCapitalize="none"
                autoComplete="off"
                className={INPUT}
              />
            </Field>
          </>
        )}
        <Field label="Vai trò" id="m-role">
          <select id="m-role" value={form.roleId} onChange={set('roleId')} required className={INPUT}>
            <option value="">Chọn vai trò</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-rm-muted">
          {mode === 'invite'
            ? 'Lời mời có hạn 7 ngày. Người được mời tự đặt tên đăng nhập và mật khẩu.'
            : 'Hệ thống sinh mật khẩu một lần; người dùng phải đổi khi đăng nhập lần đầu.'}
        </p>
        <button type="submit" disabled={run.isPending || !form.roleId} className={BTN_PRIMARY}>
          {run.isPending ? 'Đang xử lý…' : mode === 'invite' ? 'Gửi lời mời' : 'Tạo tài khoản'}
        </button>
      </form>
    </Sheet>
  );
}
