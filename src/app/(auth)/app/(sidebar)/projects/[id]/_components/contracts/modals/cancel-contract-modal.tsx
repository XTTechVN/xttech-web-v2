'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, Input, Modal } from '@/components';
import type { ProjectContractItem } from '@/types';

interface CancelContractModalProps {
  contract: ProjectContractItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (contract: ProjectContractItem, reason?: string) => void;
}

export function CancelContractModal({
  contract,
  isSubmitting,
  onClose,
  onConfirm,
}: CancelContractModalProps) {
  return (
    <Modal isOpen={!!contract} onClose={onClose} title="Hủy hợp đồng" className="max-w-md w-full">
      {contract && (
        <CancelContractForm
          contract={contract}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </Modal>
  );
}

interface CancelContractFormProps extends Omit<CancelContractModalProps, 'contract'> {
  contract: ProjectContractItem;
}

// State nằm ở component con, chỉ mount khi modal mở nên luôn bắt đầu từ giá trị rỗng
function CancelContractForm({ contract, isSubmitting, onClose, onConfirm }: CancelContractFormProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-4">
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <AlertCircle size={14} /> Hủy hợp đồng {contract.contractCode}?
        </div>
        <p className="text-[11px] text-red-700">
          Báo giá sẽ được mở khóa để chỉnh sửa. Các phiếu thu đã ghi nhận vẫn được giữ nguyên.
        </p>
      </div>
      <Input
        label="Lý do hủy (không bắt buộc)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        fullWidth
      />
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={isSubmitting}
          loading={isSubmitting}
          onClick={() => onConfirm(contract, reason.trim() || undefined)}
        >
          Xác nhận hủy
        </Button>
      </div>
    </div>
  );
}
