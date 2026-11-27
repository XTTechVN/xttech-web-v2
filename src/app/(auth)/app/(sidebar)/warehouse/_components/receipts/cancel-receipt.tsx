'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cancelWarehouseReceipt } from '@/actions';
import { Modal, Textarea } from '@/components';
import { Button } from '@/components-remake';
import type { WarehouseReceipt } from '@/types';
import { showErrorToast } from '@/utils';
import { refreshWarehouse } from '../format';

interface Props {
  receipt: WarehouseReceipt | null;
  onClose: () => void;
  onCancelled: () => void;
}

// Hủy phiếu kho bắt buộc có lý do; lý do được ghi vào phiếu và nhật ký
export function CancelReceipt({ receipt, onClose, onCancelled }: Props) {
  return (
    <Modal isOpen={!!receipt} onClose={onClose} title="Hủy phiếu kho" className="m-2 w-full max-w-md">
      {receipt && <CancelForm key={receipt.id} receipt={receipt} onClose={onClose} onCancelled={onCancelled} />}
    </Modal>
  );
}

function CancelForm({ receipt, onClose, onCancelled }: { receipt: WarehouseReceipt; onClose: () => void; onCancelled: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const cancel = useMutation({
    mutationFn: () => cancelWarehouseReceipt(receipt.id, reason.trim()),
    onSuccess: () => {
      refreshWarehouse();
      toast.success('Đã hủy phiếu kho và giải phóng vật tư giữ chỗ');
      onCancelled();
    },
    onError: (e) => showErrorToast(e, 'Không thể hủy phiếu kho'),
  });

  const submit = () => {
    if (reason.trim().length < 3) return setError('Vui lòng nhập lý do hủy (ít nhất 3 ký tự)');
    cancel.mutate();
  };

  return (
    <>
      <p className="mb-3 text-sm text-slate-600">
        Hủy phiếu <strong className="font-semibold text-slate-900">{receipt.code}</strong>? Lý do được ghi vào phiếu và nhật ký hệ thống.
      </p>
      <Textarea
        label="Lý do hủy *"
        rows={3}
        fullWidth
        value={reason}
        error={error}
        onChange={(e) => {
          setReason(e.target.value);
          setError('');
        }}
      />
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={cancel.isPending}>
          Đóng
        </Button>
        <Button variant="danger" loading={cancel.isPending} onClick={submit}>
          Hủy phiếu
        </Button>
      </div>
    </>
  );
}
