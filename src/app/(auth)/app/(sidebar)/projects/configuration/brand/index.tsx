'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteBrand, getBrands } from '@/actions';
import { Button, ConfirmDelete, FilterDrawer, SearchField, TabState, type FilterGroup } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Brand } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import { BrandDrawer } from './_components/brand-drawer';
import BrandFormDrawer from './_components/brand-form-drawer';
import { BrandCard } from './_components/brand-card';
import { BRAND_TYPES, refreshBrands } from './_components/format';

const GROUPS: FilterGroup[] = [{ key: 'type', label: 'Phân loại', options: BRAND_TYPES }];

// Hãng "cả hai" nằm trong cả hai nhóm khi lọc
const inGroup = (b: Brand, type: string) => b.brandType === type || b.brandType === 'both' || (type === 'aluminum' && !b.brandType);

export default function BrandTab() {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Brand | null>(null);

  const query = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: async () => (await getBrands({ offset: 0, limit: 9999 })).items,
  });
  const brands = useMemo(() => [...(query.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })), [query.data]);

  const kw = search.trim();
  const rows = useMemo(
    () =>
      brands.filter((b) => (!filters.type || inGroup(b, filters.type)) && (!kw || includesSearchText(b.name, kw) || includesSearchText(b.code, kw))),
    [brands, filters, kw],
  );
  const sections = useMemo(
    () =>
      [
        { type: 'accessory', title: 'Hãng phụ kiện', rows: rows.filter((b) => inGroup(b, 'accessory')) },
        { type: 'aluminum', title: 'Hãng nhôm', rows: rows.filter((b) => inGroup(b, 'aluminum')) },
      ].filter((g) => g.rows.length > 0),
    [rows],
  );
  const selected = useMemo(() => brands.find((b) => b.id === selectedId) ?? null, [brands, selectedId]);
  const filtered = !!kw || !!filters.type;

  const remove = useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: () => {
      refreshBrands();
      toast.success('Đã xóa thương hiệu');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa thương hiệu'),
  });

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:pb-6">
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm thương hiệu" placeholder="Tìm theo mã hoặc tên hãng..." />
        <div className="ml-auto flex flex-none items-center gap-2">
          <FilterDrawer groups={GROUPS} value={filters} onChange={setFilters} />
          {can('catalog:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
              Thêm thương hiệu
            </Button>
          )}
        </div>
      </div>

      <TabState
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        empty={rows.length === 0}
        emptyText={filtered ? 'Không có thương hiệu khớp bộ lọc.' : 'Chưa có thương hiệu.'}
        emptyAction={
          !filtered &&
          can('catalog:create') && (
            <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
              Thêm thương hiệu
            </Button>
          )
        }
      >
        <div className="flex flex-col gap-6">
          {sections.map((g) => (
            <section key={g.type} aria-label={g.title} className="flex flex-col gap-2">
              <h2 className="flex items-baseline gap-2 text-sm font-semibold text-slate-900">
                {g.title}
                <span className="text-xs font-normal text-slate-500">{g.rows.length} thương hiệu</span>
              </h2>
              <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:grid-cols-[repeat(3,minmax(0,1fr))] md:grid-cols-[repeat(4,minmax(0,1fr))] lg:grid-cols-[repeat(6,minmax(0,1fr))] xl:grid-cols-[repeat(8,minmax(0,1fr))]">
                {g.rows.map((b) => (
                  <li key={b.id}>
                    <BrandCard
                      brand={b}
                      brands={brands}
                      canFavorite={can('catalog:update')}
                      onDelete={can('catalog:delete') ? setDeleting : undefined}
                      onOpen={(x) => setSelectedId(x.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </TabState>

      <BrandDrawer
        brand={selected}
        brands={brands}
        canEdit={can('catalog:update')}
        canDelete={can('catalog:delete')}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <BrandFormDrawer isOpen={adding} onClose={() => setAdding(false)} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa thương hiệu"
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      >
        Xóa thương hiệu <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong>?
      </ConfirmDelete>
    </div>
  );
}
