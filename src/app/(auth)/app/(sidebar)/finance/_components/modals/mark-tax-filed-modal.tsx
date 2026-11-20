'use client';

import React, { useState } from 'react';
import { Alert, Button, Input, Modal, Textarea } from '@/components';

export interface MarkTaxFiledModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number | null;
  loading?: boolean;
  onConfirm: (payload: { taxFilingRef?: string; note?: string }) => Promise<void>;
}

export function MarkTaxFiledModal({
  isOpen,
  onClose,
  year,
  month,
  loading = false,
  onConfirm,
}: MarkTaxFiledModalProps) {
  const [taxFilingRef, setTaxFilingRef] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      taxFilingRef: taxFilingRef.trim() || undefined,
      note: note.trim() || undefined,
    });
    setTaxFilingRef('');
    setNote('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={`Đánh dấu Đã nộp tờ khai thuế Tháng ${month ?? ''}/${year}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert variant="danger" title="Cảnh báo Khóa cứng Vĩnh viễn">
          Sau khi đánh dấu <strong>Đã nộp tờ khai thuế</strong>, kỳ kế toán này sẽ bị khóa cứng vĩnh viễn: KHÔNG thể mở khóa lại, KHÔNG thể sửa, ghi sổ, bỏ ghi sổ hay hủy chứng từ thuộc kỳ. Mọi sai sót phát hiện sau phải lập chứng từ điều chỉnh ở kỳ hiện tại.
        </Alert>
        <Input
          label="Số hồ sơ / Mã giao dịch Thuế điện tử"
          value={taxFilingRef}
          placeholder="VD: 1102026-TK-01GTGT..."
          onChange={(e) => setTaxFilingRef(e.target.value)}
          disabled={loading}
          fullWidth
        />
        <Textarea
          label="Ghi chú quyết toán / nộp tờ khai"
          rows={2}
          value={note}
          placeholder="VD: Đã nộp tờ khai GTGT tháng 10/2026 lên Tổng cục Thuế..."
          onChange={(e) => setNote(e.target.value)}
          disabled={loading}
          fullWidth
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" variant="danger" size="sm" loading={loading}>
            Xác nhận Khóa cứng Thuế
          </Button>
        </div>
      </form>
    </Modal>
  );
}
