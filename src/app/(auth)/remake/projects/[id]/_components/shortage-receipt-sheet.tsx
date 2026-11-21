'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createWarehouseReceipt, getWarehouseSuppliers } from '@/actions';
import type { ShortageItemDetail, WarehouseItemType } from '@/types';
import { BTN_PRIMARY, messageOf } from '../../../_components/form';
import { Select } from '../../../_components/select';
import { Sheet } from '../../../_components/sheet';

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: number;
  orderId: number;
  shortages: ShortageItemDetail[];
}

// Phiếu nhập mua bù: điền sẵn từ danh sách thiếu (bỏ mặt hàng chưa gán profile vì kho không nhận).
export function ShortageReceiptSheet({ open, onClose, projectId, orderId, shortages }: Props) {
  const qc = useQueryClient();
  const [supplier, setSupplier] = useState('');
  const buyable = shortages.filter((s) => s.isConfigured !== false);
  const suppliers = useQuery({ queryKey: ['wh-suppliers', 'all'], queryFn: () => getWarehouseSuppliers({ limit: 100, offset: 0 }), enabled: open });
  const save = useMutation({
    mutationFn: () =>
      createWarehouseReceipt({
        receiptType: 'import',
        receiptReason: 'purchase',
        projectId,
        productionOrderId: orderId,
        supplierId: supplier ? Number(supplier) : undefined,
        note: `Mua bù thiếu hụt dự án #${projectId}`,
        items: buyable.map((s) => ({
          itemId: s.itemId || undefined,
          itemCode: s.itemCode,
          itemName: s.itemName,
          itemType: (s.itemType as WarehouseItemType) || 'profile',
          profileBarId: s.profileBarId || undefined,
          unit: s.unit,
          colorId: s.colorId || undefined,
          colorName: s.colorName || undefined,
          quantity: s.shortageQty,
          unitPrice: s.estimatedPrice || 0,
        })),
      }),
    onSuccess: () => {
      toast.success('Đã tạo phiếu nhập mua bù');
      qc.invalidateQueries({ queryKey: ['order_shortage', projectId, orderId] });
      qc.invalidateQueries({ queryKey: ['wh-receipts'] });
      onClose();
    },
    onError: (e) => toast.error(messageOf(e)),
  });
  return (
    <Sheet open={open} onClose={onClose} title="Phiếu nhập mua bù">
      <form
        className="flex flex-col gap-4 p-rm-gutter"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge text-sm">
          {buyable.map((s) => (
            <li key={`${s.itemCode}-${s.colorId ?? ''}`} className="flex gap-2 px-3 py-2">
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                {s.itemCode} · {s.itemName}
                {s.colorName ? ` (${s.colorName})` : ''}
              </span>
              <span className="flex-none tabular-nums">+{s.shortageQty.toLocaleString('vi-VN')}</span>
            </li>
          ))}
        </ul>
        {buyable.length < shortages.length && (
          <p className="text-xs text-rm-warning">Có mặt hàng chưa gán profile nên không đưa vào phiếu; hoàn tất cấu hình trong trình vẽ cửa.</p>
        )}
        <Select
          id="sr-supplier"
          label="Nhà cung cấp (không bắt buộc)"
          value={supplier}
          onChange={setSupplier}
          options={[{ value: '', label: 'Chưa chọn' }, ...(suppliers.data?.items ?? []).map((x) => ({ value: String(x.id), label: x.name }))]}
        />
        <button type="submit" disabled={save.isPending || buyable.length === 0} className={BTN_PRIMARY}>
          {save.isPending ? 'Đang tạo…' : 'Tạo phiếu nhập'}
        </button>
      </form>
    </Sheet>
  );
}
