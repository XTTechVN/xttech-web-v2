'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button, Input, Modal } from '@/components';

export interface ApproveInternalModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherNo: string;
  loading?: boolean;
  onConfirm: (approvalNote?: string) => Promise<void>;
}

export function ApproveInternalModal({
  isOpen,
  onClose,
  voucherNo,
  loading = false,
  onConfirm,
}: ApproveInternalModalProps) {
  const [approvalNote, setApprovalNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(approvalNote.trim() || undefined);
    setApprovalNote('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Duyệt nội bộ khoản chi không hóa đơn"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-600">
          Xác nhận duyệt chi nội bộ cho chứng từ <strong>{voucherNo}</strong>. Lưu ý: Duyệt nội bộ chỉ phục vụ kiểm soát chi tiêu và giải trình thanh tra, không biến chi phí B4 thành chi phí được trừ thuế TNDN.
        </p>
        <Input
          label="Ghi chú người duyệt (Tùy chọn)"
          value={approvalNote}
          placeholder="VD: Đã kiểm tra thực tế mua vật tư ngoài công trình..."
          onChange={(e) => setApprovalNote(e.target.value)}
          disabled={loading}
          fullWidth
        />
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            leftIcon={<ShieldCheck size={14} />}
          >
            Xác nhận duyệt nội bộ
          </Button>
        </div>
      </form>
    </Modal>
  );
}
