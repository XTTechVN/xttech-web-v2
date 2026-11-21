'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCan } from '@/hooks';
import type { WarehouseItem, WarehouseReceipt } from '@/types';
import { cn } from '@/utils/cn';
import { PageHeader } from '../_components/page-header';
import { EmptyState, ListSkeleton } from '../_components/state-views';
import { GlassOrdersTab } from './_components/glass-orders-tab';
import { ItemSheet } from './_components/item-sheet';
import { KpiRow } from './_components/kpi-row';
import { OffcutSheet } from './_components/offcut-sheet';
import { OffcutsTab } from './_components/offcuts-tab';
import { ReceiptSheet } from './_components/receipt-sheet';
import { ReceiptsTab } from './_components/receipts-tab';
import { StockTab } from './_components/stock-tab';

const TABS = [
  { id: 'stock', label: 'Tồn kho', perm: 'warehouse_item:read' },
  { id: 'receipts', label: 'Phiếu kho', perm: 'warehouse_receipt:read' },
  { id: 'offcuts', label: 'Nhôm thừa', perm: 'offcut:read' },
  { id: 'glass', label: 'Đặt kính', perm: 'glass_order:read' },
];

// Kho vật tư: tồn kho (thêm / sửa / xoá), phiếu nhập xuất (xem, duyệt, huỷ), nhôm thừa (xem).
export default function RemakeWarehousePage() {
  const { can, isReady } = useCan();
  const router = useRouter();
  const [offcut, setOffcut] = useState(false);
  const [makeGlass, setMakeGlass] = useState(false);
  const tabs = TABS.filter((t) => can(t.perm));
  const [picked, setTab] = useState('');
  const tab = tabs.find((t) => t.id === picked)?.id ?? tabs[0]?.id;
  const [item, setItem] = useState<WarehouseItem | 'new' | null>(null);
  const [receipt, setReceipt] = useState<WarehouseReceipt | null>(null);

  if (!isReady) return <ListSkeleton />;
  if (tabs.length === 0) return <EmptyState title="Bạn chưa có quyền xem kho vật tư" description="Liên hệ quản trị viên để được cấp quyền." />;

  return (
    <>
      <PageHeader
        title="Kho vật tư"
        description="Tồn kho, phiếu nhập xuất và nhôm thừa."
        actionLabel={
          tab === 'stock' && can('warehouse_item:create')
            ? 'Thêm vật tư'
            : tab === 'receipts' && can('warehouse_receipt:create')
              ? 'Tạo phiếu'
              : tab === 'offcuts' && can('offcut:create')
                ? 'Thêm nhôm thừa'
                : tab === 'glass' && can('glass_order:create')
                  ? 'Tạo đơn kính'
                  : undefined
        }
        onAction={() =>
          tab === 'stock'
            ? setItem('new')
            : tab === 'receipts'
              ? router.push('/remake/warehouse/receipts/new')
              : tab === 'glass'
                ? setMakeGlass(true)
                : setOffcut(true)
        }
      />
      <KpiRow />

      <div role="tablist" className="no-scrollbar -mx-rm-gutter mb-3 flex gap-2 overflow-x-auto px-rm-gutter md:flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'h-rm-tap flex-none rounded-rm border px-4 text-sm font-medium transition-[background-color,transform] duration-(--rm-dur-fast) active:scale-95 md:h-rm-control',
              tab === t.id ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line bg-rm-surface text-rm-text',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stock' && <StockTab onOpen={setItem} />}
      {tab === 'receipts' && <ReceiptsTab onOpen={setReceipt} />}
      {tab === 'offcuts' && <OffcutsTab />}
      {tab === 'glass' && <GlassOrdersTab makeOpen={makeGlass} onMakeClose={() => setMakeGlass(false)} />}

      <OffcutSheet open={offcut} onClose={() => setOffcut(false)} />
      <ItemSheet key={`item-${item === 'new' ? 'new' : (item?.id ?? 'none')}`} target={item} onClose={() => setItem(null)} />
      <ReceiptSheet key={`receipt-${receipt?.id ?? 'none'}`} target={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}
