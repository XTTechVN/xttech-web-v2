'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { BTN_LINE, BTN_PRIMARY } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';

export interface Secret {
  title: string;
  username: string;
  password: string;
}

// Mật khẩu sinh một lần: chỉ hiện ở đây, đóng là mất (quên thì reset lại)
export function SecretSheet({ secret, onClose }: { secret: Secret | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret?.password ?? '');
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Sheet open={!!secret} onClose={onClose} title={secret?.title ?? ''}>
      <div className="flex flex-col gap-4 p-rm-gutter">
        <p className="text-sm text-rm-muted">
          Gửi mật khẩu này cho <b className="text-rm-text">{secret?.username}</b>. Mật khẩu chỉ hiện <b className="text-rm-text">một lần</b>; người
          dùng phải đổi khi đăng nhập lần đầu.
        </p>
        <code className="select-all rounded-rm border border-rm-line bg-rm-bg px-3 py-3 text-center text-base [overflow-wrap:anywhere]">
          {secret?.password}
        </code>
        <button type="button" onClick={copy} className={BTN_LINE}>
          <Copy size={16} aria-hidden="true" /> {copied ? 'Đã sao chép' : 'Sao chép'}
        </button>
        <button type="button" onClick={onClose} className={BTN_PRIMARY}>
          Đã gửi, đóng lại
        </button>
      </div>
    </Sheet>
  );
}
