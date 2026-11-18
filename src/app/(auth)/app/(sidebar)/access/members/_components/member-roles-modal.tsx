'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button, Modal } from '@/components';
import { setAccessMemberRoles } from '@/actions';
import type { AccessMember, AccessRole } from '@/types';

const messageOf = (e: unknown) => (e as { response?: { data?: { details?: { message?: string } } } })?.response?.data?.details?.message ?? 'Có lỗi xảy ra';

export const MemberRolesModal = ({ member, roles, onClose, onSaved }: { member: AccessMember | null; roles: AccessRole[]; onClose: () => void; onSaved: () => void }) => {
  const [selected, setSelected] = useState<string[]>(member?.roles.map((r) => r.id) ?? []);
  const save = useMutation({
    mutationFn: () => setAccessMemberRoles(member!.id, selected),
    onSuccess: () => { toast.success('Đã đổi vai trò, có hiệu lực ngay'); onSaved(); },
    onError: (e) => toast.error(messageOf(e)),
  });
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Modal isOpen={!!member} onClose={onClose} title={`Vai trò của ${member?.fullName || member?.username || ''}`} size="sm">
      <div className="flex flex-col gap-3">
        <ul className="flex max-h-[50dvh] flex-col divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
          {roles.map((r) => (
            <li key={r.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 px-3">
                <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} className="h-5 w-5" />
                <span className="min-w-0 truncate text-sm">{r.name}</span>
              </label>
            </li>
          ))}
        </ul>
        <Button onClick={() => save.mutate()} loading={save.isPending} className="h-11">Lưu</Button>
      </div>
    </Modal>
  );
};
