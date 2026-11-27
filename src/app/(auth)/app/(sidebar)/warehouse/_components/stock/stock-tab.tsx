'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteWarehouseItem } from '@/actions';
import { Button, ConfirmDelete, FilterDrawer, SearchField, type FilterGroup } from '@/components-remake';
import { WAREHOUSE_ITEM_TYPE_MAP } from '@/config';
import { useCan } from '@/hooks';
import type { WarehouseItem, WarehouseReceiptItemCreatePayload } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import { refreshWarehouse } from '../format';
import { TabState } from '@/components-remake';
import { ItemDrawer } from './item-drawer';
import ItemFormDrawer from './item-form-drawer';
import ShortageDrawer from './shortage-drawer';
import { StockList, isLow } from './stock-list';

const GROUPS: FilterGroup[] = [
  { key: 'type', label: 'Phân loại', options: Object.entries(WAREHOUSE_ITEM_TYPE_MAP).map(([value, label]) => ({ value, label })) },
  { key: 'stock', label: 'Tồn kho', options: [{ value: 'low', label: 'Sắp hết hàng' }] },
];

interface Props {
  items: WarehouseItem[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  /** Mở phiếu nhập có sẵn các dòng mua bù từ kiểm tra thiếu hụt */
  onCreateReceipt: (items: WarehouseReceiptItemCreatePayload[]) => void;
}

export function StockTab({ items, loading, error, onRetry, onCreateReceipt }: Props) {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState<WarehouseItem | null>(null);

  const kw = search.trim();
  const rows = useMemo(
    () =>
      items.filter(
        (i) =>
          (!filters.type || i.itemType === filters.type) &&
          (!filters.stock || isLow(i)) &&
          (!kw || includesSearchText(i.itemName, kw) || includesSearchText(i.itemCode, kw) || includesSearchText(i.location ?? '', kw)),
      ),
    [items, filters, kw],
  );
  const selected = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId]);
  const filtered = !!kw || Object.values(filters).some(Boolean);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: number) => deleteWarehouseItem(id),
    onSuccess: () => {
      refreshWarehouse();
      toast.success('Đã xóa mặt hàng khỏi kho');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa mặt hàng'),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm mặt hàng" placeholder="Tìm theo mã, tên, vị trí..." />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer groups={GROUPS} value={filters} onChange={setFilters} />
          {can('stock_export:read') && (
            <Button variant="outline" icon={<AlertTriangle size={18} />} iconOnly="mobile" onClick={() => setChecking(true)}>
              Kiểm tra thiếu hụt
            </Button>
          )}
          {can('warehouse_item:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
              Thêm mặt hàng
            </Button>
          )}
        </div>
      </div>

      <TabState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={rows.length === 0}
        emptyText={filtered ? 'Không có mặt hàng khớp bộ lọc.' : 'Kho chưa có mặt hàng.'}
        emptyAction={
          !filtered &&
          can('warehouse_item:create') && (
            <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
              Thêm mặt hàng
            </Button>
          )
        }
      >
        <StockList rows={rows} onOpen={(i) => setSelectedId(i.id)} />
      </TabState>

      <ItemDrawer
        item={selected}
        canEdit={can('warehouse_item:update')}
        canDelete={can('warehouse_item:delete')}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <ItemFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ShortageDrawer
        isOpen={checking}
        onClose={() => setChecking(false)}
        canCreateReceipt={can('warehouse_receipt:create')}
        onCreateReceipt={onCreateReceipt}
      />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa mặt hàng"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa mặt hàng <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.itemName}</strong> khỏi kho?
      </ConfirmDelete>
    </div>
  );
}
