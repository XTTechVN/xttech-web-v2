'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { changePassword, updateEmployee } from '@/actions';
import { useAuthStore, useMeStore } from '@/stores';
import { BTN_PRIMARY, Field, INPUT, messageOf } from '../_components/form';
import { Sheet } from '../_components/sheet';

// Sửa hồ sơ của mình: họ tên, số điện thoại, ảnh đại diện.
export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [file, setFile] = useState<File | null>(null);
  const save = useMutation({
    mutationFn: () => updateEmployee(user!.id, { fullName: name.trim(), phoneNumber: phone.trim() }, file ?? undefined),
    onSuccess: async () => {
      toast.success('Đã lưu hồ sơ');
      await useMeStore.getState().load();
      onClose();
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open={open} onClose={onClose} title="Sửa hồ sơ">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Họ và tên" id="pf-name">
          <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={INPUT} />
        </Field>
        <Field label="Số điện thoại" id="pf-phone">
          <input
            id="pf-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className={INPUT}
          />
        </Field>
        <Field label="Ảnh đại diện" id="pf-avatar">
          <input id="pf-avatar" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        </Field>
        <button type="submit" disabled={save.isPending || !name.trim()} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </form>
    </Sheet>
  );
}

// Đổi mật khẩu: backend thu hồi phiên nên đăng nhập lại sau khi đổi.
export function PasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const [again, setAgain] = useState('');
  const short = pw.length > 0 && pw.length < 8;
  const mismatch = again.length > 0 && again !== pw;
  const save = useMutation({
    mutationFn: () => changePassword(pw),
    onSuccess: () => {
      toast.success('Đã đổi mật khẩu, vui lòng đăng nhập lại');
      window.location.replace('/signin');
    },
    onError: (e) => toast.error(messageOf(e)),
  });

  return (
    <Sheet open={open} onClose={onClose} title="Đổi mật khẩu">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <Field label="Mật khẩu mới (tối thiểu 8 ký tự)" id="pw-new">
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            aria-invalid={short}
            className={INPUT}
          />
          {short && (
            <span role="alert" className="mt-1 block text-xs text-rm-danger">
              Mật khẩu cần ít nhất 8 ký tự
            </span>
          )}
        </Field>
        <Field label="Nhập lại mật khẩu" id="pw-again">
          <input
            id="pw-again"
            type="password"
            autoComplete="new-password"
            value={again}
            onChange={(e) => setAgain(e.target.value)}
            aria-invalid={mismatch}
            className={INPUT}
          />
          {mismatch && (
            <span role="alert" className="mt-1 block text-xs text-rm-danger">
              Mật khẩu nhập lại chưa khớp
            </span>
          )}
        </Field>
        <button type="submit" disabled={save.isPending || pw.length < 8 || pw !== again} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang đổi…' : 'Đổi mật khẩu'}
        </button>
      </form>
    </Sheet>
  );
}
