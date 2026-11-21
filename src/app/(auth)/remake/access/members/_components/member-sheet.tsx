'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getMemberEffectivePermissions, lockAccessMember, resetAccessMemberPassword, setAccessMemberRoles } from '@/actions';
import { useCan } from '@/hooks';
import type { AccessMember, AccessRole } from '@/types';
import { BTN_DANGER, BTN_LINE, BTN_PRIMARY, messageOf } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';
import type { Secret } from './secret-sheet';

interface Props {
  member: AccessMember | null;
  roles: AccessRole[];
  onClose: () => void;
  onChanged: () => void;
  onSecret: (s: Secret) => void;
}

const SCOPE = { own: 'Của mình', dept: 'Phòng ban', org: 'Cả doanh nghiệp' };

// Chi tiết một thành viên: đổi vai trò, xem quyền hiện có, reset mật khẩu, khoá/mở khoá.
export function MemberSheet({ member, roles, onClose, onChanged, onSecret }: Props) {
  return (
    <Sheet open={!!member} onClose={onClose} title={member?.fullName || member?.username || ''}>
      {member && <MemberBody key={member.id} member={member} roles={roles} onClose={onClose} onChanged={onChanged} onSecret={onSecret} />}
    </Sheet>
  );
}

function MemberBody({ member, roles, onClose, onChanged, onSecret }: Omit<Props, 'member'> & { member: AccessMember }) {
  const { can } = useCan();
  const [selected, setSelected] = useState(member.roles.map((r) => r.id));
  const [showPerms, setShowPerms] = useState(false);
  const perms = useQuery({ queryKey: ['member-effective', member.id], queryFn: () => getMemberEffectivePermissions(member.id), enabled: showPerms });
  const fail = (e: unknown) => toast.error(messageOf(e));

  const saveRoles = useMutation({
    mutationFn: () => setAccessMemberRoles(member.id, selected),
    onSuccess: () => {
      toast.success('Đã đổi vai trò, có hiệu lực ngay');
      onChanged();
      onClose();
    },
    onError: fail,
  });
  const reset = useMutation({
    mutationFn: () => resetAccessMemberPassword(member.id),
    onSuccess: (r) => {
      onChanged();
      onSecret({ title: 'Mật khẩu mới', username: r.member.username, password: r.generatedPassword });
      onClose();
    },
    onError: fail,
  });
  const lock = useMutation({
    mutationFn: () => lockAccessMember(member.id, member.status === 'active'),
    onSuccess: () => {
      toast.success(member.status === 'active' ? 'Đã khoá tài khoản' : 'Đã mở khoá');
      onChanged();
      onClose();
    },
    onError: fail,
  });

  const canRole = can('user:assign_role');
  const canEdit = can('user:update');
  const changed = selected.length !== member.roles.length || selected.some((id) => !member.roles.some((r) => r.id === id));

  return (
    <div className="flex flex-col gap-5 p-rm-gutter">
      <p className="text-sm text-rm-muted [overflow-wrap:anywhere]">
        {member.username} · {member.email}
        {member.status === 'locked' && ' · Đã khoá'}
        {member.mustChangePassword && ' · Chờ đổi mật khẩu'}
      </p>

      <section>
        <h3 className="mb-2 text-sm font-medium">Vai trò</h3>
        <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
          {roles.map((r) => (
            <li key={r.id}>
              <label className="flex min-h-rm-tap cursor-pointer items-center gap-3 px-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:text-rm-muted">
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  disabled={!canRole}
                  onChange={() => setSelected((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))}
                  className="size-5 accent-rm-primary"
                />
                <span className="min-w-0 truncate text-sm">{r.name}</span>
              </label>
            </li>
          ))}
        </ul>
        {canRole && (
          <button
            type="button"
            onClick={() => saveRoles.mutate()}
            disabled={!changed || saveRoles.isPending}
            className={`${BTN_PRIMARY} mt-3 w-full`}
          >
            {saveRoles.isPending ? 'Đang lưu…' : 'Lưu vai trò'}
          </button>
        )}
      </section>

      <section>
        <button type="button" onClick={() => setShowPerms((v) => !v)} aria-expanded={showPerms} className={`${BTN_LINE} w-full`}>
          {showPerms ? 'Ẩn quyền hiện có' : 'Xem quyền hiện có'}
        </button>
        {showPerms && (
          <div className="mt-3">
            {perms.isLoading && <p className="text-sm text-rm-muted">Đang tải…</p>}
            {perms.isError && <p className="text-sm text-rm-danger">Không tải được quyền.</p>}
            {perms.data?.length === 0 && <p className="text-sm text-rm-muted">Người này chưa có quyền nào.</p>}
            <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
              {perms.data?.map((p) => (
                <li key={p.code} className="flex min-h-rm-tap items-center justify-between gap-3 px-3 py-1.5">
                  <span className="min-w-0 truncate text-sm">{p.nameVi}</span>
                  <span className="flex-none text-xs text-rm-muted">{SCOPE[p.scope]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {canEdit && (
        <section className="flex flex-col gap-2">
          <button
            type="button"
            disabled={reset.isPending}
            onClick={() => window.confirm(`Sinh mật khẩu mới cho ${member.username}? Mật khẩu cũ sẽ không dùng được.`) && reset.mutate()}
            className={BTN_LINE}
          >
            Đặt lại mật khẩu
          </button>
          <button
            type="button"
            disabled={lock.isPending}
            onClick={() => (member.status === 'locked' || window.confirm(`Khoá tài khoản ${member.username}?`)) && lock.mutate()}
            className={member.status === 'active' ? BTN_DANGER : BTN_LINE}
          >
            {member.status === 'active' ? 'Khoá tài khoản' : 'Mở khoá'}
          </button>
        </section>
      )}
    </div>
  );
}
