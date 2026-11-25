'use client';

import React, { useState } from 'react';
import { Button, Input, Modal } from '@/components';
import type { SignatureInput } from '@/types';
import { SignatureFields } from '../../shared';

export type ReasonAction = 'return' | 'reject';

export function ReasonModal({
  action,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  action: ReasonAction | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const title = action === 'return' ? 'Trả lại báo giá cho sale' : 'Khách từ chối báo giá';
  return (
    <Modal isOpen={!!action} onClose={onClose} title={title} className="max-w-md w-full">
      {action && <ReasonForm isSubmitting={isSubmitting} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  );
}

// State nằm ở component con, chỉ mount khi modal mở nên luôn bắt đầu từ giá trị rỗng
function ReasonForm({
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="space-y-4">
      <Input label="Lý do (bắt buộc)" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth />
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          disabled={reason.trim().length < 3 || isSubmitting}
          loading={isSubmitting}
          onClick={() => onConfirm(reason.trim())}
        >
          Xác nhận
        </Button>
      </div>
    </div>
  );
}

export function AcceptModal({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (signature: SignatureInput | undefined, note: string | undefined) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Khách đồng ý báo giá" className="max-w-lg w-full">
      {isOpen && <AcceptForm isSubmitting={isSubmitting} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  );
}

function AcceptForm({
  isSubmitting,
  onClose,
  onConfirm,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (signature: SignatureInput | undefined, note: string | undefined) => void;
}) {
  const [signature, setSignature] = useState<SignatureInput | null>(null);
  const [note, setNote] = useState('');
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Khách ký trực tiếp trên màn hình, hoặc bỏ trống chữ ký và ghi chú cách khách đồng ý (văn bản, Zalo...).
      </p>
      <SignatureFields title="Khách hàng ký đồng ý" defaultTitle="Chủ nhà" onChange={setSignature} />
      <Input label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          size="sm"
          disabled={(!signature && note.trim().length < 3) || isSubmitting}
          loading={isSubmitting}
          onClick={() => onConfirm(signature ?? undefined, note.trim() || undefined)}
        >
          Xác nhận khách đồng ý
        </Button>
      </div>
    </div>
  );
}

