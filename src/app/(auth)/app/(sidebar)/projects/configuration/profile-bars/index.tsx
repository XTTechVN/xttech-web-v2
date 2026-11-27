'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Download, Layers, Plus, Ruler, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteProfileBar, exportProfileBarsExcel, getBrands, getDoorSeriesList, getProfileBars } from '@/actions';
import { Button, ConfirmDelete, FilterDrawer, SearchField, StatGrid, TabState } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import { getDefaultBrandId, type ProfileBar } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { BrandTiles } from '../../_components';
import { ProfileBarDrawer } from './_components/profile-bar-drawer';
import { ProfileBarList } from './_components/profile-bar-list';
import { ProfileBarFormDrawer } from './_components/profile-bar-form-drawer';
import { ProfileBarExcelDrawer } from './_components/modals';

// Thanh profile theo hãng và hệ nhôm; hãng và hệ nhôm chọn trong bộ lọc
export default function ProfileBarsTab() {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<{ bar: ProfileBar | null; copy: boolean } | null>(null);
  const [excelOpen, setExcelOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState<ProfileBar | null>(null);
  const kw = useDebounce(search.trim(), 300);

  const brandsQuery = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => (await getBrands({ offset: 0, limit: 9999, brandType: 'aluminum' })).items,
  });
  const brands = useMemo(() => brandsQuery.data ?? [], [brandsQuery.data]);
  const sortedBrands = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })), [brands]);
  const brandId = filter.brand ? Number(filter.brand) : getDefaultBrandId(sortedBrands);
  const seriesId = filter.series ? Number(filter.series) : null;

  const seriesQuery = useQuery({
    queryKey: ['door-series', brandId],
    queryFn: async () => (await getDoorSeriesList({ offset: 0, limit: 9999, ...(brandId ? { brandId } : {}) })).items,
    enabled: brandId !== null,
  });
  const barsQuery = useQuery({
    queryKey: ['profile-bars', brandId, seriesId, kw],
    queryFn: async () =>
      (await getProfileBars({ brandId: brandId!, seriesId: seriesId || undefined, limit: 1000, offset: 0, allowDeleted: false, search: kw || undefined })).items,
    enabled: brandId !== null,
  });

  const rows = useMemo(() => barsQuery.data ?? [], [barsQuery.data]);
  const selected = useMemo(() => rows.find((b) => b.id === selectedId) ?? null, [rows, selectedId]);
  const brandName = brands.find((b) => b.id === brandId)?.name;

  const remove = useMutation({
    mutationFn: (id: number) => deleteProfileBar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-bars'] });
      toast.success('Đã xóa thanh profile');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa thanh profile'),
  });

  const exportExcel = async () => {
    try {
      setExporting(true);
      await exportProfileBarsExcel({ brandId, seriesId });
      toast.success('Đã xuất file Excel danh sách thanh profile');
    } catch (e) {
      showErrorToast(e, 'Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const openForm = (bar: ProfileBar | null, copy: boolean) => {
    setSelectedId(null);
    setForm({ bar, copy });
  };

  const stats = [
    { label: 'Thanh của hãng', value: rows.length, icon: Ruler },
    { label: 'Hệ nhôm', value: seriesQuery.data?.length ?? 0, icon: Layers },
    { label: 'Đang hoạt động', value: rows.filter((b) => b.isActive !== false).length, icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:pb-6">
      <StatGrid items={stats} />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm thanh profile" placeholder="Tìm theo mã hoặc tên thanh..." />
        <FilterDrawer
          groups={[
            {
              key: 'series',
              side: false,
              label: 'Hệ nhôm',
              options: (seriesQuery.data ?? []).map((s) => ({ value: String(s.id), label: `${s.name} (${s.code})` })),
            },
          ]}
          after={<BrandTiles brands={sortedBrands} value={brandId} onChange={(id) => setFilter({ brand: String(id) })} />}
          value={brandId ? { ...filter, brand: String(brandId) } : filter}
          onChange={(next) => setFilter(next.brand !== filter.brand ? { ...next, series: '' } : next)}
        />
        <div className="ml-auto flex flex-none items-center gap-2">
          {can('catalog:export') && (
            <Button variant="outline" icon={<Download size={16} />} iconOnly="mobile" loading={exporting} onClick={exportExcel}>
              Xuất Excel
            </Button>
          )}
          {can('catalog:import') && (
            <Button variant="outline" icon={<Upload size={16} />} iconOnly="mobile" onClick={() => setExcelOpen(true)}>
              Nhập Excel
            </Button>
          )}
          {can('catalog:create') && (
            <>
              <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => openForm(null, false)}>
                Thêm thanh profile
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full min-w-0 flex-1">
          <TabState
            loading={brandsQuery.isLoading || barsQuery.isLoading}
            error={brandsQuery.isError || barsQuery.isError}
            onRetry={() => {
              brandsQuery.refetch();
              barsQuery.refetch();
            }}
            empty={rows.length === 0}
            emptyText={kw || seriesId ? 'Không có thanh profile khớp bộ lọc.' : `${brandName ? `Hãng ${brandName}` : 'Hãng này'} chưa có thanh profile.`}
            emptyAction={
              !kw &&
              !seriesId &&
              can('catalog:create') && (
                <Button icon={<Plus size={18} />} onClick={() => openForm(null, false)}>
                  Thêm thanh profile
                </Button>
              )
            }
          >
            <ProfileBarList rows={rows} onOpen={(b) => setSelectedId(b.id)} />
          </TabState>
        </div>
      </div>

      <ProfileBarDrawer
        bar={selected}
        canCreate={can('catalog:create')}
        canEdit={can('catalog:update')}
        canDelete={can('catalog:delete')}
        onClose={() => setSelectedId(null)}
        onEdit={(b) => openForm(b, false)}
        onCopy={(b) => openForm(b, true)}
        onDelete={(b) => {
          setSelectedId(null);
          setDeleting(b);
        }}
      />
      <ProfileBarFormDrawer
        isOpen={!!form}
        onClose={() => setForm(null)}
        profileBar={form?.bar ?? null}
        isCopy={form?.copy ?? false}
        brands={brands}
        defaultBrandId={brandId}
      />
      <ProfileBarExcelDrawer isOpen={excelOpen} onClose={() => setExcelOpen(false)} brands={brands} defaultBrandId={brandId} />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa thanh profile"
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      >
        Xóa thanh profile <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong> ({deleting?.code})?
      </ConfirmDelete>
    </div>
  );
}
