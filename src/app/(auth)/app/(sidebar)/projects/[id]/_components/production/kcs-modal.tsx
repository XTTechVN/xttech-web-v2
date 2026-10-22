'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkProductionOrderItems } from '@/actions';
import { Button, Input, Modal } from '@/components';
import queryClient from '@/utils/query';
import { showErrorToast } from '@/utils';
import type { ProductionOrder } from '@/types';

interface KcsModalProps {
  projectId: number;
  order: ProductionOrder | null;
  onClose: () => void;
}

export function KcsModal({ projectId, order, onClose }: KcsModalProps) {
  const [kcsNotes, setKcsNotes] = useState('');

  const { mutate: checkKcs, isPending } = useMutation({
    mutationFn: () =>
      checkProductionOrderItems(projectId, order!.id, {
        completedItemIds: (order?.items ?? []).map((item) => item.id),
        kcsNotes: kcsNotes.trim() || undefined,
      }),
    onSuccess: (updated) => {
      ['production_orders', 'progress_matrix'].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key, projectId] }),
      );
      toast.success(
        updated.status === 'completed'
          ? 'Đã nghiệm thu KCS 100% - Lệnh sản xuất tự động hoàn thành!'
          : 'Đã cập nhật KCS bộ cửa',
      );
      setKcsNotes('');
      onClose();
    },
    onError: (err) => showErrorToast(err, 'Lỗi nghiệm thu KCS'),
  });

  return (
    <Modal isOpen={!!order} onClose={onClose} title={`Nghiệm thu KCS - ${order?.code ?? ''}`} className="w-full max-w-md">
      <div className="space-y-4">
        <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <span className="block font-bold text-slate-800">Đợt sản xuất: {order?.name}</span>
          <span>Tổng số cửa: {order?.totalItems} bộ. Đã KCS: {order?.completedItems} bộ.</span>
        </div>
        <Input
          label="Ghi chú đánh giá chất lượng KCS"
          placeholder="VD: Mối ghép ép góc phẳng, keo silicon kín khít..."
          value={kcsNotes}
          onChange={(e) => setKcsNotes(e.target.value)}
          fullWidth
        />
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
          <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={16} />} loading={isPending} onClick={() => checkKcs()}>
            Nghiệm thu KCS Đạt 100%
          </Button>
        </div>
      </div>
    </Modal>
  );
}
