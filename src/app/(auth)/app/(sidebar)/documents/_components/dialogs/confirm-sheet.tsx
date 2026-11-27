'use client';

import { Button } from '@/components-remake';
import { Sheet } from '../sheet';

interface Props {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Xác nhận ngắn cho thao tác phá hủy (xóa, thu hồi quyền)
export function ConfirmSheet({ open, title, message, confirmLabel, busy, onClose, onConfirm }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 py-4">
        <p className="text-sm text-slate-600 [overflow-wrap:anywhere]">{message}</p>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Hủy
          </Button>
          <Button variant="danger" loading={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
