'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Alert, Button, Modal, Textarea } from '@/components';
import { formatCurrency } from '@/utils/currency';
import type { VoucherDetail, VoucherSummary } from '@/types';

export interface UnpostVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: VoucherSummary | VoucherDetail | null;
  loading?: boolean;
  onConfirm: (reason: string) => Promise<void>;
}

function UnpostVoucherFormBody({
  voucher,
  loading = false,
  onClose,
  onConfirm,
}: {
  voucher: VoucherSummary | VoucherDetail;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = reason.trim();
    if (cleaned.length < 5) {
      setValidationError('Vui lòng nhập lý do bỏ ghi sổ (tối thiểu 5 ký tự).');
      return;
    }
    setValidationError(null);
    await onConfirm(cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono font-bold text-slate-900">{voucher.voucherNo}</span>
          <span className="font-mono font-bold text-primary tabular-nums">
            {formatCurrency(voucher.totalAmount)}
          </span>
        </div>
        <div className="text-slate-600">{voucher.description}</div>
      </div>

      <Alert variant="warning" title="Ghi nhận Nhật ký Kiểm toán & Bảo vệ Tồn quỹ">
        Thao tác <strong>Bỏ ghi sổ</strong> sẽ gỡ bút toán Sổ Cái, kiểm tra dòng thời gian tồn quỹ tiền mặt (TK 111*) để tránh âm quỹ, kiểm tra khóa cứng tờ khai thuế và lưu vết bất biến vào Audit Log.
      </Alert>

      <div className="space-y-1.5">
        <Textarea
          label="Lý do bỏ ghi sổ cái (Bắt buộc ≥ 5 ký tự) *"
          rows={3}
          fullWidth
          disabled={loading}
          value={reason}
          placeholder="VD: Nhập sai số tiền thuế GTGT trên hóa đơn đầu vào, cần gỡ ra để chỉnh sửa..."
          onChange={(e) => {
            setReason(e.target.value);
            if (validationError) setValidationError(null);
          }}
        />
        {validationError && (
          <p className="text-xs font-medium text-rose-600">{validationError}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Đóng
        </Button>
        <Button
          type="submit"
          variant="danger"
          size="sm"
          loading={loading}
          leftIcon={<RotateCcw size={14} />}
        >
          Xác nhận Bỏ ghi sổ
        </Button>
      </div>
    </form>
  );
}

export function UnpostVoucherModal({
  isOpen,
  onClose,
  voucher,
  loading = false,
  onConfirm,
}: UnpostVoucherModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Bỏ ghi sổ cái chứng từ"
    >
      {isOpen && voucher && (
        <UnpostVoucherFormBody
          key={`${voucher.id}-${voucher.updatedAt}`}
          voucher={voucher}
          loading={loading}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </Modal>
  );
}
