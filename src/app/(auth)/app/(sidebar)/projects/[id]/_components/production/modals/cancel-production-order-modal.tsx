'use client';

import React, { useEffect, useState } from 'react';
import { Button, Modal } from '@/components';
import type { ProductionOrder } from '@/types';

export interface CancelProductionOrderModalProps {
  order: ProductionOrder | null;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (orderId: number, note: string) => void;
}

export function CancelProductionOrderModal({
  order,
  isPending = false,
  onClose,
  onConfirm,
}: CancelProductionOrderModalProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (order) {
      setNote('');
    }
  }, [order]);

  return (
    <Modal
      isOpen={Boolean(order)}
      onClose={onClose}
      title="Xác nhận hủy lệnh sản xuất"
      className="m-2 max-w-md w-full"
    >
      <div className="space-y-3 py-1">
        <p className="text-slate-600 text-sm leading-relaxed">
          Bạn có chắc chắn muốn hủy lệnh sản xuất{' '}
          <strong className="text-slate-900 font-semibold">{order?.code}</strong> ({order?.name})? Các bộ
          cửa chưa hoàn thành sẽ được nhả về trạng thái chờ sản xuất.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Lý do hủy lệnh (Ghi chú)
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập lý do hủy lệnh sản xuất (VD: Thay đổi thiết kế, gộp đợt thi công...)"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end w-full mt-5 pt-3 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Đóng
        </Button>
        <Button
          variant="danger"
          size="sm"
          loading={isPending}
          onClick={() => {
            if (order) {
              onConfirm(order.id, note.trim());
            }
          }}
        >
          Xác nhận hủy lệnh
        </Button>
      </div>
    </Modal>
  );
}
