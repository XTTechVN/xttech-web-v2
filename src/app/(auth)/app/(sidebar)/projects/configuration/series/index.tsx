'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Layers, PauseCircle, Plus, Tag as TagIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteDoorSeries, getBrands, getDoorSeriesList } from '@/actions';
import { Button, ConfirmDelete, SearchField, StatGrid, TabState } from '@/components-remake';
import { useCan } from '@/hooks';
import { getDefaultBrandId, type DoorSeries } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import { BrandSidebar } from '../../_components';
import { refreshSeries } from './_components/format';
import { SeriesDrawer } from './_components/series-drawer';
import SeriesFormDrawer from './_components/series-form-drawer';
import { SeriesList } from './_components/series-list';

// Hệ nhôm theo từng hãng; cột hãng bên trái giữ nguyên
export default function SeriesTab() {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [pickedBrandId, setPickedBrandId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<DoorSeries | null>(null);

  const brandsQuery = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => (await getBrands({ offset: 0, limit: 9999, brandType: 'aluminum' })).items,
  });
  const seriesQuery = useQuery({
    queryKey: ['door-series'],
    queryFn: async () => (await getDoorSeriesList({ offset: 0, limit: 9999 })).items,
  });

  const brands = useMemo(() => brandsQuery.data ?? [], [brandsQuery.data]);
  const all = useMemo(() => seriesQuery.data ?? [], [seriesQuery.data]);
  const sortedBrands = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })), [brands]);
  const brandId = pickedBrandId ?? getDefaultBrandId(sortedBrands);

  const kw = search.trim();
  const rows = useMemo(
    () =>
      all
        .filter((s) => (brandId === null || s.brandId === brandId) && (!kw || includesSearchText(s.name, kw) || includesSearchText(s.code, kw)))
        .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })),
    [all, brandId, kw],
  );
  const selected = useMemo(() => all.find((s) => s.id === selectedId) ?? null, [all, selectedId]);

  const remove = useMutation({
    mutationFn: (id: number) => deleteDoorSeries(id),
    onSuccess: () => {
      refreshSeries();
      toast.success('Đã xóa hệ nhôm');
      setDeleting(null);
      setSelectedId(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa hệ nhôm'),
  });

  const stats = [
    { label: 'Tổng hệ nhôm', value: all.length, icon: Layers },
    { label: 'Của hãng đang chọn', value: all.filter((s) => s.brandId === brandId).length, icon: TagIcon },
    { label: 'Đang hoạt động', value: all.filter((s) => s.isActive !== false).length, icon: CheckCircle2 },
    { label: 'Tạm ngưng', value: all.filter((s) => s.isActive === false).length, icon: PauseCircle },
  ];
  const brandName = brands.find((b) => b.id === brandId)?.name;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:pb-6">
      <StatGrid items={stats} />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm hệ nhôm" placeholder="Tìm theo mã hoặc tên hệ..." />
        {can('catalog:create') && (
          <Button className="ml-auto" icon={<Plus size={18} />} iconOnly="mobile" onClick={() => setAdding(true)}>
            Thêm hệ nhôm
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <BrandSidebar brands={brands} selectedBrandId={brandId} onSelectBrand={setPickedBrandId} />

        <div className="w-full min-w-0 flex-1">
          <TabState
            loading={brandsQuery.isLoading || seriesQuery.isLoading}
            error={brandsQuery.isError || seriesQuery.isError}
            onRetry={() => {
              brandsQuery.refetch();
              seriesQuery.refetch();
            }}
            empty={rows.length === 0}
            emptyText={kw ? 'Không có hệ nhôm khớp từ khóa.' : `${brandName ? `Hãng ${brandName}` : 'Hãng này'} chưa có hệ nhôm.`}
            emptyAction={
              !kw &&
              can('catalog:create') && (
                <Button icon={<Plus size={18} />} onClick={() => setAdding(true)}>
                  Thêm hệ nhôm
                </Button>
              )
            }
          >
            <SeriesList rows={rows} onOpen={(s) => setSelectedId(s.id)} />
          </TabState>
        </div>
      </div>

      <SeriesDrawer
        series={selected}
        brands={brands}
        canEdit={can('catalog:update')}
        canDelete={can('catalog:delete')}
        onClose={() => setSelectedId(null)}
        onDelete={setDeleting}
      />
      <SeriesFormDrawer isOpen={adding} onClose={() => setAdding(false)} brands={brands} defaultBrandId={brandId} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa hệ nhôm"
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      >
        Xóa hệ nhôm <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong>?
      </ConfirmDelete>
    </div>
  );
}
