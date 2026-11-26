'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Plus, Store, Tag as TagIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteSupplierDoor, getSupplierDoors, getWarehouseSuppliers } from '@/actions';
import { Button, ConfirmDelete, FilterDrawer, SearchField, StatGrid, TabState } from '@/components-remake';
import { useCan } from '@/hooks';
import type { SupplierDoor } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { SupplierDoorDrawer } from './_components/supplier-door-drawer';
import { SupplierDoorFormDrawer } from './_components/supplier-door-form-drawer';
import { SupplierDoorList } from './_components/supplier-door-list';
import { SUPPLIER_DOOR_STATUS_FILTER_OPTIONS } from './_constants/supplier-doors.constants';

// Cửa mua nguyên bộ từ nhà cung cấp, kèm đơn giá tham khảo
export default function SupplierDoorsTab() {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<{ door: SupplierDoor | null } | null>(null);
  const [deleting, setDeleting] = useState<SupplierDoor | null>(null);

  const doorsQuery = useQuery({
    queryKey: ['supplier-doors-stats'],
    queryFn: () => getSupplierDoors({ limit: 500 }),
  });
  const suppliersQuery = useQuery({
    queryKey: ['warehouse-suppliers', 'door_set'],
    queryFn: () => getWarehouseSuppliers({ supplier_type: 'door_set', limit: 200 }),
  });

  const all = useMemo(() => doorsQuery.data?.items ?? [], [doorsQuery.data]);
  const kw = search.trim();
  const rows = useMemo(
    () =>
      all.filter(
        (d) =>
          (!filter.supplier || d.supplierId === Number(filter.supplier)) &&
          (!filter.status || String(d.isActive) === filter.status) &&
          (!kw || includesSearchText(d.name, kw) || includesSearchText(d.code, kw)),
      ),
    [all, filter, kw],
  );
  const selected = useMemo(() => all.find((d) => d.id === selectedId) ?? null, [all, selectedId]);
  const filtered = !!kw || !!filter.supplier || !!filter.status;

  const remove = useMutation({
    mutationFn: (id: number) => deleteSupplierDoor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-doors'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-doors-stats'] });
      toast.success('Đã xóa mẫu cửa nhà cung cấp');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa mẫu cửa NCC'),
  });

  const openForm = (door: SupplierDoor | null) => {
    setSelectedId(null);
    setForm({ door });
  };

  const stats = [
    { label: 'Tổng mẫu cửa NCC', value: doorsQuery.data?.meta.total ?? all.length, icon: Store },
    { label: 'Đang sử dụng', value: all.filter((d) => d.isActive).length, icon: CheckCircle2 },
    { label: 'Nhà cung cấp', value: new Set(all.map((d) => d.supplierId)).size, icon: TagIcon },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:pb-6">
      <StatGrid items={stats} />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm mẫu cửa NCC" placeholder="Tìm theo mã hoặc tên mẫu cửa..." />
        <FilterDrawer
          groups={[
            { key: 'supplier', label: 'Nhà cung cấp', options: (suppliersQuery.data?.items ?? []).map((s) => ({ value: String(s.id), label: s.name })) },
            { key: 'status', label: 'Trạng thái', options: SUPPLIER_DOOR_STATUS_FILTER_OPTIONS.filter((o) => o.value !== undefined) as { value: string; label: string }[] },
          ]}
          value={filter}
          onChange={setFilter}
        />
        {can('catalog:create') && (
          <Button className="ml-auto" icon={<Plus size={18} />} iconOnly="mobile" onClick={() => openForm(null)}>
            Thêm mẫu cửa NCC
          </Button>
        )}
      </div>

      <TabState
        loading={doorsQuery.isLoading}
        error={doorsQuery.isError}
        onRetry={() => doorsQuery.refetch()}
        empty={rows.length === 0}
        emptyText={filtered ? 'Không có mẫu cửa khớp bộ lọc.' : 'Chưa có mẫu cửa nhà cung cấp.'}
        emptyAction={
          !filtered &&
          can('catalog:create') && (
            <Button icon={<Plus size={18} />} onClick={() => openForm(null)}>
              Thêm mẫu cửa NCC
            </Button>
          )
        }
      >
        <SupplierDoorList rows={rows} onOpen={(d) => setSelectedId(d.id)} />
      </TabState>

      <SupplierDoorDrawer
        door={selected}
        canEdit={can('catalog:update')}
        canDelete={can('catalog:delete')}
        onClose={() => setSelectedId(null)}
        onEdit={openForm}
        onDelete={(d) => {
          setSelectedId(null);
          setDeleting(d);
        }}
      />
      <SupplierDoorFormDrawer isOpen={!!form} onClose={() => setForm(null)} initialData={form?.door ?? null} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa mẫu cửa NCC"
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      >
        Xóa mẫu cửa <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.code} — {deleting?.name}</strong>? Nếu đã gắn vào vị trí dự án, thao tác có thể bị từ chối.
      </ConfirmDelete>
    </div>
  );
}
