'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { approveWarehouseReceipt, cancelWarehouseReceipt, getWarehouseReceiptDetail } from '@/actions';
import type { WarehouseReceipt } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Badge } from '../../_components/badge';
import { BTN_DANGER, BTN_PRIMARY, messageOf } from '../../_components/form';
import { Sheet } from '../../_components/sheet';
import { REASONS, RECEIPT_STATUS, num } from './labels';
import { vnDay } from './receipts-tab';

// Chi tiết phiếu kho: danh sách vật tư, Duyệt / Huỷ khi API cho phép (`_can`).
export function ReceiptSheet({ target, onClose }: { target: WarehouseReceipt | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['wh-receipt', target?.id],
    queryFn: () => getWarehouseReceiptDetail(target!.id),
    enabled: !!target,
  });
  const r = data ?? target;
  const can = r?._can ?? {};
  const s = r ? RECEIPT_STATUS[r.status] : undefined;

  const done = (msg: string) => {
    toast.success(msg);
    qc.invalidateQueries({ queryKey: ['wh-receipts'] });
    qc.invalidateQueries({ queryKey: ['wh-items'] });
    onClose();
  };
  const approve = useMutation({
    mutationFn: () => approveWarehouseReceipt(target!.id),
    onSuccess: () => done('Đã duyệt phiếu, tồn kho đã cập nhật'),
    onError: (e) => toast.error(messageOf(e)),
  });
  const cancel = useMutation({
    mutationFn: (reason: string) => cancelWarehouseReceipt(target!.id, reason),
    onSuccess: () => done('Đã huỷ phiếu'),
    onError: (e) => toast.error(messageOf(e)),
  });
  const askCancel = () => {
    const reason = window.prompt('Lý do huỷ phiếu?')?.trim();
    if (reason) cancel.mutate(reason);
  };

  return (
    <Sheet open={!!target} onClose={onClose} title={r?.code ?? 'Phiếu kho'}>
      {r && (
        <div className="flex flex-col gap-4 p-rm-gutter">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={s?.tone}>{s?.label ?? r.status}</Badge>
            <span className="text-sm text-rm-muted">
              {r.receiptType === 'import' ? 'Nhập' : 'Xuất'} · {REASONS[r.receiptReason] ?? r.receiptReason} · {vnDay(r.createdAt)}
            </span>
          </div>
          {(r.supplierName || r.projectName) && <p className="text-sm">{r.supplierName ?? r.projectName}</p>}
          {r.note && <p className="text-sm text-rm-muted [overflow-wrap:anywhere]">{r.note}</p>}

          {isLoading && !r.items && <div className="h-24 animate-pulse rounded-rm bg-rm-bg" />}
          {r.items && (
            <ul className="divide-y divide-rm-line rounded-rm-xl border border-rm-edge">
              {r.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 px-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{i.itemName}</span>
                    <span className="block truncate text-xs text-rm-muted">{i.itemCode}</span>
                  </span>
                  <span className="flex-none text-right">
                    <span className="block text-sm font-semibold">
                      {num(i.quantity)} {i.unit}
                    </span>
                    {i.totalPrice > 0 && <span className="block text-xs text-rm-muted">{formatCurrency(i.totalPrice)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {r.totalAmount > 0 && (
            <p className="flex justify-between text-sm font-semibold">
              <span>Tổng tiền</span>
              <span>{formatCurrency(r.totalAmount)}</span>
            </p>
          )}

          {(can.approve || can.cancel) && (
            <div className="flex gap-2">
              {can.cancel && (
                <button type="button" disabled={cancel.isPending} onClick={askCancel} className={`${BTN_DANGER} flex-1`}>
                  Huỷ phiếu
                </button>
              )}
              {can.approve && (
                <button type="button" disabled={approve.isPending} onClick={() => approve.mutate()} className={`${BTN_PRIMARY} flex-1`}>
                  {approve.isPending ? 'Đang duyệt…' : 'Duyệt phiếu'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
