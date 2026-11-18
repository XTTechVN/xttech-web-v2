'use client';

import { useState } from 'react';
import { Button, Modal } from '@/components';

export interface CancelReceiptModalProps {
  receiptId: number;
  onClose: () => void;
  onConfirm: (receiptId: number, reason: string) => Promise<void>;
}

// Huỷ phiếu kho bắt buộc có lý do (README 8.2); lý do được ghi vào ghi chú phiếu và nhật ký.
export function CancelReceiptModal({ receiptId, onClose, onConfirm }: CancelReceiptModalProps) {
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const valid = reason.trim().length >= 3;

  const submit = async () => {
    setPending(true);
    try {
      await onConfirm(receiptId, reason.trim());
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Huỷ phiếu kho" className="m-2 w-full max-w-md" disabled={pending}>
      <div className="flex flex-col gap-1.5 py-1">
        <label htmlFor="cancel-receipt-reason" className="text-sm font-medium text-slate-700">
          Lý do huỷ <span className="text-red-600">*</span>
        </label>
        <textarea
          id="cancel-receipt-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-describedby="cancel-receipt-hint"
          className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm"
        />
        <p id="cancel-receipt-hint" className="text-xs text-slate-500">
          Ít nhất 3 ký tự. Lý do được ghi vào phiếu và nhật ký hệ thống.
        </p>
      </div>
      <div className="mt-5 flex w-full justify-end gap-3 border-t border-slate-100 pt-3">
        <Button variant="outline" className="h-11 md:h-10" onClick={onClose} disabled={pending}>
          Đóng
        </Button>
        <Button variant="danger" className="h-11 md:h-10" loading={pending} disabled={!valid} onClick={submit}>
          Huỷ phiếu
        </Button>
      </div>
    </Modal>
  );
}
