'use client';

import { Tag } from '@/components-remake';
import { RECEIPT_REASON_MAP } from '@/config';
import type { WarehouseReceipt } from '@/types';
import { DataTable, type Column } from '@/components-remake';
import { RECEIPT_STATUS, fmtDate, money } from '../format';

const status = (r: WarehouseReceipt) => <Tag tone={RECEIPT_STATUS[r.status]?.tone}>{RECEIPT_STATUS[r.status]?.label ?? r.status}</Tag>;
const kind = (r: WarehouseReceipt) => (r.receiptType === 'import' ? <Tag tone="green">Nhập kho</Tag> : <Tag tone="amber">Xuất kho</Tag>);
const reason = (r: WarehouseReceipt) => RECEIPT_REASON_MAP[r.receiptReason] ?? r.receiptReason;
const partner = (r: WarehouseReceipt) => r.supplierName || r.projectName || '';
const count = (r: WarehouseReceipt) => r.totalItemsCount || r.items?.length || 0;

const COLUMNS: Column<WarehouseReceipt>[] = [
  {
    key: 'code',
    header: 'Phiếu',
    className: 'w-44',
    render: (r) => (
      <span className="flex items-center gap-1.5">
        <Tag tone="blue">{r.code}</Tag>
        {kind(r)}
      </span>
    ),
  },
  { key: 'reason', header: 'Lý do', className: 'max-w-0 truncate', render: reason },
  { key: 'partner', header: 'Đối tác / Dự án', className: 'w-56 max-w-56 truncate', render: (r) => partner(r) || '–' },
  { key: 'count', header: 'Mặt hàng', className: 'w-24 text-right tabular-nums', render: count },
  {
    key: 'total',
    header: 'Tổng giá trị',
    className: 'w-36 text-right font-semibold tabular-nums text-slate-900',
    render: (r) => money(r.totalAmount),
  },
  { key: 'date', header: 'Ngày lập', className: 'w-28 tabular-nums', wide: true, render: (r) => fmtDate(r.createdAt) },
  { key: 'status', header: 'Trạng thái', className: 'w-32', render: status },
];

interface Props {
  rows: WarehouseReceipt[];
  onOpen: (r: WarehouseReceipt) => void;
}

export function ReceiptList({ rows, onOpen }: Props) {
  return (
    <DataTable
      caption="Danh sách phiếu nhập xuất kho. Bấm vào một dòng để xem chi tiết."
      rows={rows}
      rowKey={(r) => r.id}
      columns={COLUMNS}
      onOpen={onOpen}
      card={(r) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5">
              <Tag tone="blue">{r.code}</Tag>
              {kind(r)}
            </span>
            <span className="flex-none">{status(r)}</span>
          </div>
          <p className="truncate text-sm font-medium text-slate-900">{partner(r) || reason(r)}</p>
          <p className="truncate text-xs text-slate-500">
            {partner(r) && `${reason(r)} · `}
            {count(r)} mặt hàng · <strong className="font-semibold text-slate-900">{money(r.totalAmount)}</strong> · {fmtDate(r.createdAt)}
          </p>
        </div>
      )}
    />
  );
}
