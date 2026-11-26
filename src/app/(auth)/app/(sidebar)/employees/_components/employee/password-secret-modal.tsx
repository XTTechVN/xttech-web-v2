'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Modal } from '@/components';
import { Button } from '@/components-remake';

export interface PasswordSecret {
  username: string;
  password: string;
}

// Mật khẩu sinh một lần: chỉ hiện ở đây, đóng là mất (quên thì đặt lại)
export function PasswordSecretModal({ secret, onClose }: { secret: PasswordSecret | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret?.password ?? '');
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const close = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={!!secret} onClose={close} title="Mật khẩu mới" className="m-2 w-full max-w-md">
      <p className="py-2 text-sm leading-relaxed text-slate-600 [overflow-wrap:anywhere]">
        Gửi mật khẩu này cho <strong className="font-semibold text-slate-900">{secret?.username}</strong>. Mật khẩu chỉ hiện một lần, người dùng phải đổi
        khi đăng nhập lần đầu.
      </p>
      <code className="mt-2 block select-all rounded-control border border-slate-200 bg-slate-50 px-3 py-3 text-center text-base text-slate-900 [overflow-wrap:anywhere]">
        {secret?.password}
      </code>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" icon={<Copy size={16} />} onClick={copy}>
          {copied ? 'Đã sao chép' : 'Sao chép'}
        </Button>
        <Button onClick={close}>Đã gửi, đóng lại</Button>
      </div>
    </Modal>
  );
}
