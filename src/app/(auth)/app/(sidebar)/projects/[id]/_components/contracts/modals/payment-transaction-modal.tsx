'use client';

import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, ImagePlus, Trash2 } from 'lucide-react';
import { uploadProgressEvidence } from '@/actions';
import { Button, CurrencyInput, Input, Modal, Select } from '@/components';
import { PAYMENT_METHOD_OPTIONS } from '@/config';
import type { PaymentTransactionCreatePayload, ProjectContractItem } from '@/types';
import { getFileUrl, showErrorToast } from '@/utils';

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
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadProgressEvidence(projectId, file);
      setReceiptImage(result.url);
    } catch (error) {
      showErrorToast(error, 'Lỗi khi tải ảnh chứng từ lên');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!amount || !signedContract || isUploading) return;
    onSubmit({
      projectId,
      contractId: signedContract.id,
      amount,
      transactionType: 'collection',
      paymentMethod: method,
      bankReference: reference.trim() || undefined,
      receiptImage: receiptImage || undefined,
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

      {/* Đính kèm ảnh chứng từ / UNC */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            Ảnh chứng từ / Ủy nhiệm chi (nếu có)
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => void handleFileChange(e.target.files)}
          />
          <Button
            type="button"
            size="xs"
            variant="outline"
            loading={isUploading}
            leftIcon={<Camera size={13} />}
            onClick={() => fileInputRef.current?.click()}
          >
            {receiptImage ? 'Đổi ảnh khác' : 'Chụp / chọn ảnh'}
          </Button>
        </div>

        {receiptImage ? (
          <div className="relative inline-block rounded-lg border border-slate-200 bg-slate-50 p-1.5">
            <img
              src={getFileUrl(receiptImage)}
              alt="Ảnh chứng từ thanh toán"
              className="h-28 w-auto max-w-full rounded object-contain"
            />
            <button
              type="button"
              onClick={() => setReceiptImage('')}
              className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-red-500 p-1 text-white shadow-xs hover:bg-red-600"
              title="Xóa ảnh chứng từ"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 py-3.5 text-xs text-slate-400 transition-colors hover:border-primary/40 hover:text-slate-600"
          >
            <ImagePlus size={15} />
            <span>Nhấn để tải ảnh chụp màn hình chuyển khoản hoặc phiếu thu</span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<CheckCircle2 size={16} />}
          disabled={!amount || !signedContract || isSubmitting || isUploading}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Lưu phiếu thu
        </Button>
      </div>
    </div>
  );
}
