'use client';

import { BTN_DANGER, BTN_LINE } from '../../../_components/form';
import { Sheet } from '../../../_components/sheet';

interface Props {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Xác nhận ngắn cho thao tác phá huỷ (xoá, thu hồi quyền).
export function ConfirmSheet({ open, title, message, confirmLabel, busy, onClose, onConfirm }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 p-rm-gutter">
        <p className="text-sm [overflow-wrap:anywhere]">{message}</p>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
          <button type="button" disabled={busy} onClick={onClose} className={BTN_LINE}>
            Huỷ
          </button>
          <button type="button" disabled={busy} onClick={onConfirm} className={BTN_DANGER}>
            {busy ? 'Đang xử lý…' : confirmLabel}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
