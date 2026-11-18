'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button, Input, Modal } from '@/components';
import { createAccessMember, createInvitation } from '@/actions';
import type { AccessRole, MemberSecret } from '@/types';

const messageOf = (e: unknown) => (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? 'Có lỗi xảy ra';

// Hai cách thêm thành viên: mời qua email (người được mời tự đặt mật khẩu) hoặc tạo luôn tài khoản (mật khẩu sinh một lần)
export const AddMemberModal = ({
  open,
  roles,
  onClose,
  onInvited,
  onCreated,
}: {
  open: boolean;
  roles: AccessRole[];
  onClose: () => void;
  onInvited: () => void;
  onCreated: (s: MemberSecret) => void;
}) => {
  const [mode, setMode] = useState<'invite' | 'create'>('invite');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setEmail('');
    setUsername('');
    setFullName('');
    setError('');
  };
  const run = useMutation({
    mutationFn: async () => {
      if (mode === 'invite') return { invited: await createInvitation({ email, roleId }) };
      return { created: await createAccessMember({ username, email, fullName, roleIds: [roleId] }) };
    },
    onSuccess: (res) => {
      reset();
      if (res.invited) {
        toast.success(res.invited.emailSent ? 'Đã gửi lời mời qua email' : 'Đã tạo lời mời (email chưa gửi được, hãy sao chép liên kết)');
        if (!res.invited.emailSent) void navigator.clipboard?.writeText(res.invited.inviteLink);
        onInvited();
      } else if (res.created) onCreated(res.created);
    },
    onError: (e) => setError(messageOf(e)),
  });

  return (
    <Modal isOpen={open} onClose={onClose} title="Thêm thành viên" size="sm">
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setError(''); run.mutate(); }}>
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 text-sm">
          {(['invite', 'create'] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`h-10 rounded-md font-medium ${mode === m ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}>
              {m === 'invite' ? 'Mời qua email' : 'Tạo tài khoản'}
            </button>
          ))}
        </div>
        <Input label="Email" type="email" inputMode="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
        {mode === 'create' && (
          <>
            <Input label="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-11" />
            <Input label="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} required autoCapitalize="none" className="h-11" />
          </>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="member-role" className="text-xs font-semibold text-gray-700">Vai trò</label>
          <select id="member-role" value={roleId} onChange={(e) => setRoleId(e.target.value)} required className="h-11 rounded-md border border-gray-300 bg-white px-3 text-sm">
            <option value="">Chọn vai trò</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-gray-500">
          {mode === 'invite' ? 'Lời mời có hạn 7 ngày. Người được mời tự đặt tên đăng nhập và mật khẩu.' : 'Hệ thống sinh mật khẩu một lần; người dùng phải đổi mật khẩu khi đăng nhập lần đầu.'}
        </p>
        <Button type="submit" loading={run.isPending} disabled={!roleId} className="h-11">{mode === 'invite' ? 'Gửi lời mời' : 'Tạo tài khoản'}</Button>
      </form>
    </Modal>
  );
};
