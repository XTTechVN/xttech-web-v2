'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteWarehouseSupplier } from '@/actions';
import { Button, ConfirmDelete, FilterDrawer, SearchField, TabState, type FilterGroup } from '@/components-remake';
import { SUPPLIER_TYPE_MAP } from '@/config';
import { useCan } from '@/hooks';
import type { WarehouseSupplier } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import { refreshWarehouse } from '../format';
import { SupplierDrawer } from './supplier-drawer';
import SupplierFormDrawer from './supplier-form-drawer';
import { SupplierList } from './supplier-list';

const GROUPS: FilterGroup[] = [
  { key: 'type', label: 'Phân loại', options: Object.entries(SUPPLIER_TYPE_MAP).map(([value, label]) => ({ value, label })) },
];

interface Props {
  suppliers: WarehouseSupplier[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export function SuppliersTab({ suppliers, loading, error, onRetry }: Props) {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<WarehouseSupplier | null>(null);

  const kw = search.trim();
  const rows = useMemo(
    () =>
      suppliers.filter(
        (s) =>
          (!filters.type || s.supplierType === filters.type) &&
          (!kw ||
            includesSearchText(s.name, kw) ||
            includesSearchText(s.code, kw) ||
            s.phone.includes(kw) ||
            includesSearchText(s.contactName ?? '', kw)),
      ),
    [suppliers, filters, kw],
  );
  const selected = useMemo(() => suppliers.find((s) => s.id === selectedId) ?? null, [suppliers, selectedId]);
  const filtered = !!kw || Object.values(filters).some(Boolean);

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: number) => deleteWarehouseSupplier(id),
    onSuccess: () => {
      refreshWarehouse();
      toast.success('Đã xóa nhà cung cấp');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa nhà cung cấp'),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm nhà cung cấp" placeholder="Tìm theo tên, mã, điện thoại, người liên hệ..." />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer groups={GROUPS} value={filters} onChange={setFilters} />
          {can('warehouse_supplier:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
              Thêm nhà cung cấp
            </Button>
          )}
        </div>
      </div>

      <TabState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={rows.length === 0}
        emptyText={filtered ? 'Không có nhà cung cấp khớp bộ lọc.' : 'Chưa có nhà cung cấp.'}
        emptyAction={
          !filtered &&
          can('warehouse_supplier:create') && (
            <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
              Thêm nhà cung cấp
            </Button>
          )
        }
      >
        <SupplierList rows={rows} onOpen={(s) => setSelectedId(s.id)} />
      </TabState>

      <SupplierDrawer
        supplier={selected}
        canEdit={can('warehouse_supplier:update')}
        canDelete={can('warehouse_supplier:delete')}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <SupplierFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa nhà cung cấp"
        pending={isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting.id)}
      >
        Xóa nhà cung cấp <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong>?
      </ConfirmDelete>
    </div>
  );
}
