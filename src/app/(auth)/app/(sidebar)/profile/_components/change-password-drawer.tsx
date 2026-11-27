'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { changeMyPassword } from '@/actions';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components-remake';
import { showErrorToast, showSuccessToast } from '@/utils';
import { PasswordField } from './password-field';
import { signOutApp } from './use-account-actions';

const MIN_LENGTH = 8;

// Đổi mật khẩu: nhập mật khẩu hiện tại + mật khẩu mới. Thành công thì mọi phiên bị thu hồi nên đăng nhập lại.
export function ChangePasswordDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} label="Đổi mật khẩu">
      <ChangePasswordForm onClose={onClose} />
    </Drawer>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const tooShort = next.length > 0 && next.length < MIN_LENGTH ? `Tối thiểu ${MIN_LENGTH} ký tự` : undefined;
  const sameAsOld = next.length > 0 && next === current ? 'Mật khẩu mới phải khác mật khẩu hiện tại' : undefined;
  const mismatch = confirm.length > 0 && confirm !== next ? 'Mật khẩu nhập lại chưa khớp' : undefined;
  const valid = !!current && next.length >= MIN_LENGTH && !sameAsOld && confirm === next;

  const change = useMutation({
    mutationFn: () => changeMyPassword(current, next),
    onSuccess: () => {
      showSuccessToast('Đã đổi mật khẩu, vui lòng đăng nhập lại');
      void signOutApp();
    },
    onError: (e: Error) => showErrorToast(e, 'Không đổi được mật khẩu'),
  });

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) change.mutate();
      }}
    >
      <DrawerHeader compact title="Đổi mật khẩu" onClose={onClose} />
      <DrawerBody>
        <div className="flex flex-col gap-4 pt-4">
          <PasswordField label="Mật khẩu hiện tại" autoComplete="current-password" value={current} onChange={setCurrent} />
          <PasswordField label="Mật khẩu mới" autoComplete="new-password" value={next} onChange={setNext} error={tooShort ?? sameAsOld} />
          <PasswordField label="Nhập lại mật khẩu mới" autoComplete="new-password" value={confirm} onChange={setConfirm} error={mismatch} />
          <p className="text-xs text-slate-500">Sau khi đổi, bạn sẽ được đăng xuất khỏi mọi thiết bị.</p>
        </div>
      </DrawerBody>
      <DrawerFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" loading={change.isPending} disabled={!valid}>
            Đổi mật khẩu
          </Button>
        </div>
      </DrawerFooter>
    </form>
  );
}
