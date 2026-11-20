'use client';

import React, { useState } from 'react';
import { Button, Modal, Textarea } from '@/components';
import type { CashCountMinute } from '@/types';

export interface VoidCashCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  minute: CashCountMinute | null;
  loading?: boolean;
  onConfirm: (reason: string) => Promise<void>;
}

export function VoidCashCountModal({
  isOpen,
  onClose,
  minute,
  loading = false,
  onConfirm,
}: VoidCashCountModalProps) {
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setErrorMsg('Vui lòng nhập lý do hủy biên bản kiểm kê (tối thiểu 3 ký tự).');
      return;
    }
    setErrorMsg(null);
    await onConfirm(trimmed);
    setReason('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={`Hủy biên bản kiểm kê ${minute?.minuteNo || ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Lý do hủy biên bản kiểm kê (≥ 3 ký tự) *"
          rows={3}
          fullWidth
          disabled={loading}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="VD: Kiểm đếm lại sai mệnh giá tiền, lập lại biên bản mới..."
        />
        {errorMsg && <p className="text-xs font-medium text-rose-600">{errorMsg}</p>}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Đóng
          </Button>
          <Button type="submit" variant="danger" size="sm" loading={loading}>
            Xác nhận hủy
          </Button>
        </div>
      </form>
    </Modal>
  );
}
