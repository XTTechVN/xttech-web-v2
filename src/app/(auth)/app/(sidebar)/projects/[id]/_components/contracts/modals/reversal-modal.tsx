'use client';

import React, { useState } from 'react';
import { Button, Input, Modal } from '@/components';
import { formatCurrency } from '@/utils';
import type { PaymentTransactionItem } from '@/types';

const MIN_REASON_LENGTH = 5;

interface ReversalModalProps {
  transaction: PaymentTransactionItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (transaction: PaymentTransactionItem, note: string) => void;
}

export function ReversalModal({ transaction, isSubmitting, onClose, onConfirm }: ReversalModalProps) {
  return (
    <Modal isOpen={!!transaction} onClose={onClose} title="Tạo phiếu hoàn tiền" className="max-w-md w-full">
      {transaction && (
        <ReversalForm
          transaction={transaction}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </Modal>
  );
}

interface ReversalFormProps extends Omit<ReversalModalProps, 'transaction'> {
  transaction: PaymentTransactionItem;
}

// State nằm ở component con, chỉ mount khi modal mở nên luôn bắt đầu từ giá trị rỗng
function ReversalForm({ transaction, isSubmitting, onClose, onConfirm }: ReversalFormProps) {
  const [reason, setReason] = useState('');
  const isReasonValid = reason.trim().length >= MIN_REASON_LENGTH;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
        <span className="font-bold block">Xác nhận hoàn tiền cho giao dịch:</span>
        <span>Mã GD: {transaction.transactionCode}</span>
        <span className="block font-bold">Số tiền hoàn trả: -{formatCurrency(transaction.amount)}</span>
      </div>
      <Input
        label="Lý do hoàn tiền (bắt buộc) *"
        placeholder="VD: Khách chuyển thừa tiền cần hoàn trả lại..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        fullWidth
      />
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={!isReasonValid || isSubmitting}
          loading={isSubmitting}
          onClick={() => onConfirm(transaction, reason.trim())}
        >
          Xác nhận hoàn tiền
        </Button>
      </div>
    </div>
  );
}
