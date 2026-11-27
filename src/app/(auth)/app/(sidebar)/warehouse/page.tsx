'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Layers, Package, RefreshCw, Sparkles } from 'lucide-react';
import { getWarehouseItems, getWarehouseOffcuts, getWarehouseReceipts, getWarehouseSuppliers } from '@/actions';
import { AccessDenied } from '@/components/access-denied';
import { Button, PageHeading, StatGrid, Tabs } from '@/components-remake';
import { useCan } from '@/hooks';
import type { WarehouseReceiptItemCreatePayload } from '@/types';
import { GlassOrdersTab } from './_components/glass-orders-tab';
import { refreshWarehouse } from './_components/format';
import { OffcutsTab } from './_components/offcuts/offcuts-tab';
import ReceiptFormDrawer from './_components/receipts/receipt-form-drawer';
import { ReceiptsTab } from './_components/receipts/receipts-tab';
import { isLow } from './_components/stock/stock-list';
import { StockTab } from './_components/stock/stock-tab';
import { SuppliersTab } from './_components/suppliers/suppliers-tab';

const WAREHOUSE_TABS = [
  { value: 'stock', label: 'Tồn kho & định mức' },
  { value: 'receipts', label: 'Phiếu nhập / xuất' },
  { value: 'offcuts', label: 'Nhôm thừa' },
  { value: 'suppliers', label: 'Nhà cung cấp' },
  { value: 'glass', label: 'Đặt kính nhà máy' },
];

// Mỗi tab cần quyền xem riêng của nhóm dữ liệu đó
const TAB_PERMISSION: Record<string, string> = {
  stock: 'warehouse_item:read',
  receipts: 'warehouse_receipt:read',
  offcuts: 'offcut:read',
  suppliers: 'warehouse_supplier:read',
  glass: 'glass_order:read',
};

export default function WarehouseManagementPage() {
  const { can, isReady } = useCan();
  const tabs = WAREHOUSE_TABS.filter((t) => can(TAB_PERMISSION[t.value]));
  const [requestedTab, setActiveTab] = useState<string>('stock');
  const activeTab = tabs.some((t) => t.value === requestedTab) ? requestedTab : (tabs[0]?.value ?? requestedTab);
  const [receiptForm, setReceiptForm] = useState<{ open: boolean; items?: WarehouseReceiptItemCreatePayload[] }>({ open: false });

  const items = useQuery({
    queryKey: ['warehouse', 'items'],
    queryFn: () => getWarehouseItems({ limit: 200 }),
    enabled: isReady && can('warehouse_item:read'),
  });
  const receipts = useQuery({
    queryKey: ['warehouse', 'receipts'],
    queryFn: () => getWarehouseReceipts({ limit: 100 }),
    enabled: isReady && can('warehouse_receipt:read'),
  });
  const offcuts = useQuery({
    queryKey: ['warehouse', 'offcuts'],
    queryFn: () => getWarehouseOffcuts({ limit: 100 }),
    enabled: isReady && can('offcut:read'),
  });
  const suppliers = useQuery({
    queryKey: ['warehouse', 'suppliers'],
    queryFn: () => getWarehouseSuppliers({ limit: 100 }),
    enabled: isReady && can('warehouse_supplier:read'),
  });

  const itemList = useMemo(() => items.data?.items ?? [], [items.data]);
  const receiptList = useMemo(() => receipts.data?.items ?? [], [receipts.data]);
  const offcutList = useMemo(() => offcuts.data?.items ?? [], [offcuts.data]);
  const supplierList = useMemo(() => suppliers.data?.items ?? [], [suppliers.data]);
  const profileItems = useMemo(() => itemList.filter((i) => i.itemType === 'profile'), [itemList]);

  if (!isReady) return null;
  if (tabs.length === 0) return <AccessDenied />;

  const stats = [
    { label: 'Mặt hàng trong kho', value: itemList.length, icon: Package, perm: 'warehouse_item:read' },
    { label: 'Cảnh báo thiếu hụt', value: itemList.filter(isLow).length, icon: AlertTriangle, perm: 'warehouse_item:read' },
    { label: 'Phiếu chờ duyệt', value: receiptList.filter((r) => r.status === 'draft').length, icon: Layers, perm: 'warehouse_receipt:read' },
    { label: 'Nhôm thừa tái dùng', value: offcutList.filter((o) => o.status === 'available').length, icon: Sparkles, perm: 'offcut:read' },
  ]
    .filter((x) => can(x.perm));
  const busy = items.isFetching || receipts.isFetching || offcuts.isFetching || suppliers.isFetching;

  return (
    <div className="w-full p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
      <PageHeading title="Quản lý kho" description="Tồn kho, nhập xuất và vật tư." />
      <div className="flex flex-col gap-4 text-slate-800">
        {stats.length > 0 && <StatGrid items={stats} />}

        <div className="flex items-center gap-2">
          <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} label="Nhóm kho vật tư" className="min-w-0 flex-1 px-0" />
          <Button
            variant="outline"
            icon={<RefreshCw size={16} className={busy ? 'animate-spin' : ''} />}
            iconOnly="mobile"
            onClick={refreshWarehouse}
          >
            Làm mới
          </Button>
        </div>

        {activeTab === 'stock' && (
          <StockTab
            items={itemList}
            loading={items.isLoading}
            error={items.isError}
            onRetry={() => items.refetch()}
            onCreateReceipt={(rows) => setReceiptForm({ open: true, items: rows })}
          />
        )}
        {activeTab === 'receipts' && (
          <ReceiptsTab
            receipts={receiptList}
            loading={receipts.isLoading}
            error={receipts.isError}
            onRetry={() => receipts.refetch()}
            onCreate={() => setReceiptForm({ open: true })}
          />
        )}
        {activeTab === 'offcuts' && (
          <OffcutsTab
            offcuts={offcutList}
            profileItems={profileItems}
            loading={offcuts.isLoading}
            error={offcuts.isError}
            onRetry={() => offcuts.refetch()}
          />
        )}
        {activeTab === 'suppliers' && (
          <SuppliersTab suppliers={supplierList} loading={suppliers.isLoading} error={suppliers.isError} onRetry={() => suppliers.refetch()} />
        )}
        {activeTab === 'glass' && <GlassOrdersTab suppliers={supplierList} />}

        <ReceiptFormDrawer
          isOpen={receiptForm.open}
          onClose={() => setReceiptForm((s) => ({ ...s, open: false }))}
          items={itemList}
          suppliers={supplierList}
          initialItems={receiptForm.items}
        />
      </div>
    </div>
  );
}
