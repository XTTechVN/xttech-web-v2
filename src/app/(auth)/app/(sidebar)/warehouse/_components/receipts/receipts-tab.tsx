'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, FilterDrawer, SearchField, type FilterGroup } from '@/components-remake';
import { useCan } from '@/hooks';
import type { WarehouseReceipt } from '@/types';
import { includesSearchText } from '@/utils';
import { RECEIPT_STATUS } from '../format';
import { TabState } from '@/components-remake';
import { CancelReceipt } from './cancel-receipt';
import { ReceiptDrawer } from './receipt-drawer';
import { ReceiptList } from './receipt-list';

const GROUPS: FilterGroup[] = [
  {
    key: 'type',
    label: 'Loại phiếu',
    options: [
      { value: 'import', label: 'Nhập kho' },
      { value: 'export', label: 'Xuất kho' },
    ],
  },
  { key: 'status', label: 'Trạng thái', options: Object.entries(RECEIPT_STATUS).map(([value, s]) => ({ value, label: s.label })) },
];

interface Props {
  receipts: WarehouseReceipt[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onCreate: () => void;
}

export function ReceiptsTab({ receipts, loading, error, onRetry, onCreate }: Props) {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<WarehouseReceipt | null>(null);

  const kw = search.trim();
  const rows = useMemo(
    () =>
      receipts.filter(
        (r) =>
          (!filters.type || r.receiptType === filters.type) &&
          (!filters.status || r.status === filters.status) &&
          (!kw || includesSearchText(r.code, kw) || includesSearchText(r.supplierName ?? '', kw) || includesSearchText(r.projectName ?? '', kw)),
      ),
    [receipts, filters, kw],
  );
  const selected = useMemo(() => receipts.find((r) => r.id === selectedId) ?? null, [receipts, selectedId]);
  const filtered = !!kw || Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm phiếu kho" placeholder="Tìm theo mã phiếu, nhà cung cấp, dự án..." />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer groups={GROUPS} value={filters} onChange={setFilters} />
          {can('warehouse_receipt:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={onCreate}>
              Lập phiếu kho
            </Button>
          )}
        </div>
      </div>

      <TabState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={rows.length === 0}
        emptyText={filtered ? 'Không có phiếu khớp bộ lọc.' : 'Chưa có phiếu kho.'}
        emptyAction={
          !filtered &&
          can('warehouse_receipt:create') && (
            <Button icon={<Plus size={18} />} onClick={onCreate}>
              Lập phiếu kho
            </Button>
          )
        }
      >
        <ReceiptList rows={rows} onOpen={(r) => setSelectedId(r.id)} />
      </TabState>

      <ReceiptDrawer receipt={selected} onClose={() => setSelectedId(null)} onCancel={setCancelling} />
      <CancelReceipt
        receipt={cancelling}
        onClose={() => setCancelling(null)}
        onCancelled={() => {
          setCancelling(null);
          setSelectedId(null);
        }}
      />
    </div>
  );
}
