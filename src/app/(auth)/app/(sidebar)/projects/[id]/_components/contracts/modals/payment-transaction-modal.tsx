'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button, CurrencyInput, Input, Modal, Select } from '@/components';
import { PAYMENT_METHOD_OPTIONS } from '@/config';
import type { PaymentTransactionCreatePayload, ProjectContractItem } from '@/types';

interface PaymentTransactionModalProps {
  isOpen: boolean;
  projectId: number;
  signedContract?: ProjectContractItem;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: PaymentTransactionCreatePayload) => void;
}

export function PaymentTransactionModal({ isOpen, ...formProps }: PaymentTransactionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={formProps.onClose} title="Tạo phiếu thu tiền" className="max-w-md w-full">
      <PaymentTransactionForm {...formProps} />
    </Modal>
  );
}

// State nằm ở component con, chỉ mount khi modal mở nên luôn bắt đầu từ giá trị mặc định
function PaymentTransactionForm({
  projectId,
  signedContract,
  isSubmitting,
  onClose,
  onSubmit,
}: Omit<PaymentTransactionModalProps, 'isOpen'>) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!amount || !signedContract) return;
    onSubmit({
      projectId,
      contractId: signedContract.id,
      amount,
      transactionType: 'collection',
      paymentMethod: method,
      bankReference: reference.trim() || undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {signedContract && (
        <p className="text-[11px] text-slate-500">
          Thu tiền cho hợp đồng <strong className="text-slate-700">{signedContract.contractCode}</strong>
        </p>
      )}
      <CurrencyInput
        label="Số tiền thu thực tế (VNĐ) *"
        fullWidth
        value={amount || ''}
        onChange={setAmount}
      />
      <Select
        label="Hình thức thanh toán *"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        options={PAYMENT_METHOD_OPTIONS}
        fullWidth
      />
      <Input
        label="Mã giao dịch ngân hàng (nếu có)"
        placeholder="VD: MBBANK-FT12345678"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        fullWidth
      />
      <Input
        label="Ghi chú"
        placeholder="VD: Thu tiền đặt cọc đợt 1..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        fullWidth
      />
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<CheckCircle2 size={16} />}
          disabled={!amount || !signedContract || isSubmitting}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Lưu phiếu thu
        </Button>
      </div>
    </div>
  );
}
