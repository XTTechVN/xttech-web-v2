'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Modal, Textarea } from '@/components';
import { unpostVoucher, voidVoucher } from '@/actions/finance';
import { formatCurrency } from '@/utils/currency';
import { showErrorToast, showSuccessToast } from '@/utils/error';
import type { VoucherDetail, VoucherSummary } from '@/types';

export interface VoidVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: VoucherSummary | VoucherDetail | null;
  onSuccess?: (voucher: VoucherDetail) => void;
}

function VoidVoucherFormBody({
  voucher,
  onClose,
  onSuccess,
}: {
  voucher: VoucherSummary | VoucherDetail;
  onClose: () => void;
  onSuccess?: (voucher: VoucherDetail) => void;
}) {
  const queryClient = useQueryClient();
  const [unpostReason, setUnpostReason] = useState('');
  const [reason, setReason] = useState('');
  const [isPostedLocally, setIsPostedLocally] = useState(voucher.status === 'posted');
  const [submitting, setSubmitting] = useState(false);

  const handleUnpostFirst = async () => {
    const trimmed = unpostReason.trim();
    if (trimmed.length < 5) {
      showErrorToast('Vui lòng nhập lý do bỏ ghi sổ cái (tối thiểu 5 ký tự).');
      return;
    }
    setSubmitting(true);
    try {
      await unpostVoucher(voucher.id, { reason: trimmed });
      setIsPostedLocally(false);
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast('Đã bỏ ghi sổ cái, bạn có thể nhập lý do để hủy chứng từ.');
    } catch (err) {
      showErrorToast(err, 'Không thể bỏ ghi sổ chứng từ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmVoid = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      showErrorToast('Vui lòng nhập lý do hủy chứng từ (tối thiểu 3 ký tự).');
      return;
    }
    setSubmitting(true);
    try {
      const result = await voidVoucher(voucher.id, { voidReason: trimmed });
      await queryClient.invalidateQueries({ queryKey: ['finance'] });
      showSuccessToast(`Đã hủy chứng từ ${result.voucherNo}`);
      onSuccess?.(result);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Lỗi khi hủy chứng từ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono font-bold text-slate-900">{voucher.voucherNo}</span>
          <span className="font-mono font-bold text-primary tabular-nums">
            {formatCurrency(voucher.totalAmount)}
          </span>
        </div>
        <div className="text-slate-600">{voucher.description}</div>
      </div>

      {isPostedLocally && (
        <Alert variant="warning" title="Chứng từ đang ở trạng thái Đã ghi sổ cái">
          <div className="space-y-2.5">
            <p>
              Để đảm bảo tính toàn vẹn Sổ Cái và Sổ Quỹ, cần <strong>Bỏ ghi sổ</strong> trước khi hủy chứng từ này.
            </p>
            <Textarea
              label="Lý do bỏ ghi sổ (tối thiểu 5 ký tự) *"
              rows={2}
              fullWidth
              disabled={submitting}
              value={unpostReason}
              placeholder="VD: Gỡ ghi sổ để hủy chứng từ lập nhầm ngày..."
              onChange={(e) => setUnpostReason(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="xs"
              loading={submitting}
              onClick={handleUnpostFirst}
            >
              Bỏ ghi sổ ngay
            </Button>
          </div>
        </Alert>
      )}

      <Textarea
        label="Lý do hủy chứng từ *"
        rows={3}
        fullWidth
        disabled={submitting || isPostedLocally}
        value={reason}
        placeholder="VD: Nhập trùng phiếu thu, sai số tiền hoặc khách hàng hủy giao dịch..."
        onChange={(e) => setReason(e.target.value)}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
          Đóng
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          loading={submitting}
          disabled={isPostedLocally}
          onClick={handleConfirmVoid}
        >
          Xác nhận hủy chứng từ
        </Button>
      </div>
    </div>
  );
}

export function VoidVoucherModal({
  isOpen,
  onClose,
  voucher,
  onSuccess,
}: VoidVoucherModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Hủy chứng từ kế toán"
    >
      {isOpen && voucher && (
        <VoidVoucherFormBody
          key={`${voucher.id}-${voucher.status}`}
          voucher={voucher}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
