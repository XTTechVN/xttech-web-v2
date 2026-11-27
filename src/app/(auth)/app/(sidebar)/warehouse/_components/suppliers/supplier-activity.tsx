'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWarehouseSupplierAnalytics } from '@/actions';
import { Skeleton } from '@/components';
import { Button, Tabs, Tag, type TagTone } from '@/components-remake';
import { GLASS_ORDER_STATUS_MAP } from '@/config';
import type { WarehouseSupplier } from '@/types';
import { toDisplayUnit } from '../../_utils/unit-mapping';
import { RECEIPT_STATUS, fmtDate, money, num } from '../format';

const GLASS_TONE: Record<string, TagTone> = { ordered: 'blue', delivered: 'green', assembled: 'violet', cancelled: 'red', scrapped: 'amber' };

const ROW = 'flex flex-col gap-1 p-3';
const Empty = ({ children }: { children: string }) => (
  <p className="rounded-block border border-slate-200/80 py-8 text-center text-sm text-slate-500">{children}</p>
);

// Hai danh sách của một nhà cung cấp: mặt hàng đã nhập (hoặc đơn kính) và lịch sử phiếu nhập
export function SupplierActivity({ supplier }: { supplier: WarehouseSupplier }) {
  const glass = supplier.supplierType === 'glass';
  const [tab, setTab] = useState<'main' | 'receipts'>('main');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['warehouse', 'supplier', supplier.id, 'analytics'],
    queryFn: () => getWarehouseSupplierAnalytics(supplier.id),
  });

  const items = data?.suppliedItems ?? [];
  const orders = data?.glassOrders ?? [];
  const receipts = data?.receipts ?? [];
  const mainCount = glass ? orders.length : items.length;

  let body;
  if (isLoading) {
    body = (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-block" />
        ))}
      </div>
    );
  } else if (isError) {
    body = (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-sm text-slate-600">Không tải được dữ liệu cung ứng.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    );
  } else if (tab === 'receipts') {
    body = receipts.length ? (
      <ul className="divide-y divide-slate-100 rounded-block border border-slate-200/80">
        {receipts.map((r) => (
          <li key={r.id} className={ROW}>
            <div className="flex items-center justify-between gap-2">
              <Tag tone="blue">{r.code}</Tag>
              <Tag tone={RECEIPT_STATUS[r.status]?.tone}>{RECEIPT_STATUS[r.status]?.label ?? r.status}</Tag>
            </div>
            <p className="text-xs text-slate-500">
              {fmtDate(r.createdAt)} · {r.totalItemsCount || r.items?.length || 0} mặt hàng ·{' '}
              <strong className="font-semibold text-slate-900">{money(r.totalAmount)}</strong>
            </p>
            {r.note && <p className="truncate text-xs text-slate-500">{r.note}</p>}
          </li>
        ))}
      </ul>
    ) : (
      <Empty>Chưa có phiếu nhập từ nhà cung cấp này.</Empty>
    );
  } else if (glass) {
    body = orders.length ? (
      <ul className="divide-y divide-slate-100 rounded-block border border-slate-200/80">
        {orders.map((o) => (
          <li key={o.id} className={ROW}>
            <div className="flex items-center justify-between gap-2">
              <Tag tone="blue">{o.code}</Tag>
              <Tag tone={GLASS_TONE[o.status]}>{GLASS_ORDER_STATUS_MAP[o.status]?.label ?? o.status}</Tag>
            </div>
            <p className="truncate text-sm font-medium text-slate-900">{o.projectName || '–'}</p>
            <p className="text-xs text-slate-500">
              {o.totalPanes} tấm · {money(o.totalAmount)} · Hạn giao {fmtDate(o.expectedDate)}
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <Empty>Chưa có đơn đặt kính gửi nhà máy này.</Empty>
    );
  } else {
    body = items.length ? (
      <ul className="divide-y divide-slate-100 rounded-block border border-slate-200/80">
        {items.map((it) => (
          <li key={it.itemCode} className={ROW}>
            <p className="text-sm font-semibold text-slate-900 [overflow-wrap:anywhere]">{it.itemName}</p>
            <p className="flex flex-wrap items-center gap-1.5">
              <Tag tone="blue">{it.itemCode}</Tag>
            </p>
            <p className="text-xs text-slate-500">
              Đã nhập {num(it.totalImportedQty)} {toDisplayUnit(it.unit)} · Giá gần nhất {money(it.lastUnitPrice)} ({fmtDate(it.lastImportDate)}) ·
              Tồn {num(it.currentStock)}
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <Empty>Chưa nhập mặt hàng nào từ nhà cung cấp này.</Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        label="Hoạt động cung ứng"
        value={tab}
        onChange={setTab}
        className="px-0"
        tabs={[
          { value: 'main', label: glass ? `Đơn đặt kính (${orders.length})` : `Mặt hàng đã nhập (${mainCount})` },
          { value: 'receipts', label: `Phiếu nhập (${receipts.length})` },
        ]}
      />
      {body}
    </div>
  );
}
