'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button, Modal } from '@/components';

// Mật khẩu sinh một lần: chỉ hiện ở đây, đóng khung là mất (admin phải reset nếu quên)
export const SecretModal = ({ title, username, secret, onClose }: { title: string; username: string; secret: string | null; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret ?? '');
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Modal isOpen={!!secret} onClose={onClose} title={title} size="sm" closeOnOverlayClick={false}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Gửi mật khẩu này cho <b>{username}</b>. Mật khẩu chỉ hiện <b>một lần</b>; người dùng phải đổi ngay ở lần đăng nhập đầu.
        </p>
        <code className="select-all rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-center font-mono text-base [overflow-wrap:anywhere]">{secret}</code>
        <Button variant="outline" onClick={copy} leftIcon={<Copy size={16} />} className="h-11">{copied ? 'Đã sao chép' : 'Sao chép'}</Button>
        <Button onClick={onClose} className="h-11">Đã gửi, đóng lại</Button>
      </div>
    </Modal>
  );
};
