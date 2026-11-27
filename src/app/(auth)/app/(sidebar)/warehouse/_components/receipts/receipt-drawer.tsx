'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, FileSpreadsheet, Printer, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { approveWarehouseReceipt, getWarehouseReceiptDetail } from '@/actions';
import { Skeleton } from '@/components';
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerSection, IconAction, InfoRow, Tag } from '@/components-remake';
import { RECEIPT_REASON_MAP } from '@/config';
import type { WarehouseReceipt } from '@/types';
import { showErrorToast } from '@/utils';
import { exportReceiptToExcel, printReceiptDocument, toDisplayUnit } from '../../_utils';
import { RECEIPT_STATUS, fmtDateTime, money, num, refreshWarehouse } from '../format';

interface Props {
  receipt: WarehouseReceipt | null;
  onClose: () => void;
  onCancel: (r: WarehouseReceipt) => void;
}

// Xem một phiếu kho kèm danh sách vật tư; duyệt hoặc hủy khi phiếu còn chờ duyệt
export function ReceiptDrawer({ receipt, onClose, onCancel }: Props) {
  const detail = useQuery({
    queryKey: ['warehouse', 'receipt', receipt?.id],
    queryFn: () => getWarehouseReceiptDetail(receipt!.id),
    enabled: !!receipt,
  });
  const r = detail.data ?? receipt;

  const approve = useMutation({
    mutationFn: (id: number) => approveWarehouseReceipt(id),
    onSuccess: () => {
      refreshWarehouse();
      toast.success('Đã duyệt phiếu, tồn kho đã cập nhật');
      onClose();
    },
    onError: (e) => showErrorToast(e, 'Không thể duyệt phiếu kho'),
  });

  const items = r?.items ?? [];
  const canApprove = r?.status === 'draft' && r._can?.approve;
  const canCancel = r?.status === 'draft' && r._can?.cancel;

  return (
    <Drawer isOpen={!!receipt} onClose={onClose} label="Chi tiết phiếu kho" width={560}>
      {r && (
        <>
          <DrawerHeader
            compact
            title="Phiếu kho"
            onClose={onClose}
            actions={
              <>
                <IconAction label="Xuất Excel" onClick={() => exportReceiptToExcel(r)}>
                  <FileSpreadsheet size={16} />
                </IconAction>
                <IconAction label="In phiếu" onClick={() => printReceiptDocument(r)}>
                  <Printer size={16} />
                </IconAction>
              </>
            }
          />
          <DrawerBody>
            <div className="pt-4">
              <h3 className="text-base font-semibold text-slate-900">{r.code}</h3>
              <p className="mb-4 mt-2 flex flex-wrap items-center gap-1.5">
                {r.receiptType === 'import' ? <Tag tone="green">Nhập kho</Tag> : <Tag tone="amber">Xuất kho</Tag>}
                <Tag tone={RECEIPT_STATUS[r.status]?.tone}>{RECEIPT_STATUS[r.status]?.label ?? r.status}</Tag>
              </p>
              <DrawerSection title="Thông tin">
                <InfoRow label="Lý do">{RECEIPT_REASON_MAP[r.receiptReason] ?? r.receiptReason}</InfoRow>
                {r.supplierName && <InfoRow label="Nhà cung cấp">{r.supplierName}</InfoRow>}
                {r.projectName && <InfoRow label="Dự án">{r.projectName}</InfoRow>}
                {r.productionOrderCode && <InfoRow label="Lệnh sản xuất">{r.productionOrderCode}</InfoRow>}
                <InfoRow label="Tổng giá trị">
                  <strong className="font-semibold">{money(r.totalAmount)}</strong>
                </InfoRow>
                <InfoRow label="Ngày lập">{fmtDateTime(r.createdAt)}</InfoRow>
                {r.approvedAt && <InfoRow label="Ngày duyệt">{fmtDateTime(r.approvedAt)}</InfoRow>}
                {r.note && <InfoRow label="Ghi chú">{r.note}</InfoRow>}
              </DrawerSection>
              <DrawerSection title={`Vật tư (${items.length})`}>
                {detail.isLoading && !items.length ? (
                  <div className="flex flex-col gap-2" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-block" />
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">Phiếu không có mặt hàng.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-block border border-slate-200/80">
                    {items.map((it, idx) => (
                      <li key={it.id ?? idx} className="flex flex-col gap-1 p-3">
                        <p className="text-sm font-semibold text-slate-900 [overflow-wrap:anywhere]">{it.itemName}</p>
                        <p className="flex flex-wrap items-center gap-1.5">
                          <Tag tone="blue">{it.itemCode}</Tag>
                          {!!it.offcutLengthMm && <Tag tone="violet">{`Nhôm thừa ${it.offcutLengthMm} mm`}</Tag>}
                        </p>
                        <p className="text-xs text-slate-500">
                          {num(it.quantity)} {toDisplayUnit(it.unit)} × {money(it.unitPrice)} ={' '}
                          <strong className="font-semibold text-slate-900">{money(it.totalPrice)}</strong>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </DrawerSection>
            </div>
          </DrawerBody>
          {r.status === 'draft' && (
            <DrawerFooter>
              {canApprove || canCancel ? (
                <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
                  {canCancel && (
                    <Button variant="outline" icon={<XCircle size={18} />} disabled={approve.isPending} onClick={() => onCancel(r)}>
                      Hủy phiếu
                    </Button>
                  )}
                  {canApprove && (
                    <Button icon={<CheckCircle2 size={18} />} loading={approve.isPending} onClick={() => approve.mutate(r.id)}>
                      Duyệt phiếu
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500">Bạn không duyệt hay hủy được phiếu này (thiếu quyền hoặc là người lập phiếu).</p>
              )}
            </DrawerFooter>
          )}
        </>
      )}
    </Drawer>
  );
}
