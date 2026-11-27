'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Layers, LayoutGrid, Plus, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteDoor, getBrands, getDoors, getDoorSeriesList } from '@/actions';
import { DoorStudioModal } from '@/components';
import { Button, ConfirmDelete, FilterDrawer, SearchField, StatGrid, TabState } from '@/components-remake';
import { useCan } from '@/hooks';
import { getDefaultBrandId, normalizeDoorType, type Door } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { BrandTiles } from '../../_components';
import { DoorCard } from './_components/door-card';
import { DoorTemplateDrawer } from './_components/door-template-drawer';

const DOOR_TYPES = [
  { value: 'casement_door', label: 'Cửa đi mở quay' },
  { value: 'sliding_door', label: 'Cửa đi lùa' },
  { value: 'casement_window', label: 'Cửa sổ mở quay' },
  { value: 'sliding_window', label: 'Cửa sổ lùa' },
  { value: 'folding_door', label: 'Cửa gấp xếp' },
  { value: 'sliding_casement_door', label: 'Cửa trượt quay' },
  { value: 'glass_wall', label: 'Vách kính' },
  { value: 'curtain_wall', label: 'Mặt dựng' },
  { value: 'composite', label: 'Tổng hợp' },
];

const NO_SERIES = 'Chưa phân hệ nhôm';

// Mẫu cửa dựng sẵn theo hãng; hãng chọn trong bộ lọc
export default function DoorTemplatesTab() {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [pickedBrandId, setPickedBrandId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [studio, setStudio] = useState<{ door: Door | null } | null>(null);
  const [deleting, setDeleting] = useState<Door | null>(null);

  const brandsQuery = useQuery({
    queryKey: ['brands', 'aluminum'],
    queryFn: async () => (await getBrands({ limit: 9999, offset: 0, allowDeleted: false, brandType: 'aluminum' })).items || [],
  });
  const brands = useMemo(() => brandsQuery.data ?? [], [brandsQuery.data]);
  const sortedBrands = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })), [brands]);
  const brandId = pickedBrandId ?? getDefaultBrandId(sortedBrands);

  const seriesQuery = useQuery({
    queryKey: ['door-series', brandId],
    queryFn: () => getDoorSeriesList({ brandId: brandId || undefined, limit: 9999, offset: 0 }),
    enabled: brandId !== null,
  });
  const doorsQuery = useQuery({
    queryKey: ['door-templates', brandId],
    queryFn: () => getDoors({ brandId: brandId || undefined, limit: 9999, offset: 0 }),
    enabled: brandId !== null,
  });
  const all = useMemo(() => doorsQuery.data?.items ?? [], [doorsQuery.data]);
  const seriesOptions = useMemo(() => (seriesQuery.data?.items ?? []).map((s) => ({ value: String(s.id), label: s.name })), [seriesQuery.data]);

  const kw = search.trim();
  const rows = useMemo(
    () =>
      all.filter(
        (d) =>
          (!filter.series || d.doorSeriesId === Number(filter.series)) &&
          (!filter.type || (!!d.type && normalizeDoorType(d.type) === normalizeDoorType(filter.type))) &&
          (!kw || includesSearchText(d.name, kw) || includesSearchText(d.code || '', kw)),
      ),
    [all, filter, kw],
  );
  const groups = useMemo(() => {
    const map = new Map<string, Door[]>();
    rows.forEach((d) => {
      const key = d.doorSeries?.name || NO_SERIES;
      map.set(key, [...(map.get(key) ?? []), d]);
    });
    return [...map.entries()];
  }, [rows]);
  const selected = useMemo(() => all.find((d) => d.id === selectedId) ?? null, [all, selectedId]);
  const brandName = brands.find((b) => b.id === brandId)?.name;
  const filtered = !!kw || !!filter.series || !!filter.type;

  const remove = useMutation({
    mutationFn: (id: number) => deleteDoor(id),
    onSuccess: () => {
      ['door-templates', 'doors', 'doors-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      toast.success('Đã xóa mẫu cửa');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa mẫu cửa'),
  });

  const openStudio = (door: Door | null) => {
    setSelectedId(null);
    setStudio({ door });
  };
  const copyDoor = (door: Door) =>
    openStudio({
      ...door,
      id: 0,
      name: `${door.name}_COPY`,
      code: `${door.code || door.name}_COPY`,
      systemConfig: door.systemConfig ? (structuredClone(door.systemConfig) as Record<string, unknown>) : undefined,
    });

  const stats = [
    { label: 'Mẫu của hãng', value: all.length, icon: LayoutGrid },
    { label: 'Hệ nhôm', value: seriesOptions.length, icon: Layers },
    { label: 'Đang hiển thị', value: rows.length, icon: Ruler },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:pb-6">
      <StatGrid items={stats} />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm mẫu cửa" placeholder="Tìm theo mã hoặc tên mẫu..." />
        <FilterDrawer
          groups={[
            { key: 'series', label: 'Hệ nhôm', options: seriesOptions },
            { key: 'type', label: 'Loại cửa', options: DOOR_TYPES },
          ]}
          after={
            <BrandTiles
              brands={sortedBrands}
              value={brandId}
              onChange={(id) => {
                setPickedBrandId(id);
                setFilter({});
              }}
            />
          }
          value={filter}
          onChange={setFilter}
        />
        {can('catalog:create') && (
          <Button className="ml-auto" icon={<Plus size={18} />} iconOnly="mobile" onClick={() => openStudio(null)}>
            Tạo mẫu mới
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full min-w-0 flex-1">
          <TabState
            loading={brandsQuery.isLoading || doorsQuery.isLoading}
            error={brandsQuery.isError || doorsQuery.isError}
            onRetry={() => {
              brandsQuery.refetch();
              doorsQuery.refetch();
            }}
            empty={rows.length === 0}
            emptyText={filtered ? 'Không có mẫu cửa khớp bộ lọc.' : `${brandName ? `Hãng ${brandName}` : 'Hãng này'} chưa có mẫu cửa.`}
            emptyAction={
              !filtered &&
              can('catalog:create') && (
                <Button icon={<Plus size={18} />} onClick={() => openStudio(null)}>
                  Tạo mẫu mới
                </Button>
              )
            }
          >
            <div className="flex flex-col gap-6">
              {groups.map(([seriesName, doors]) => (
                <section key={seriesName}>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span className="min-w-0 truncate">{seriesName}</span>
                    <span className="flex-none text-xs font-normal text-slate-500">{doors.length} mẫu</span>
                  </h2>
                  <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))] xl:grid-cols-[repeat(4,minmax(0,1fr))] 2xl:grid-cols-[repeat(5,minmax(0,1fr))]">
                    {doors.map((d) => (
                      <li key={d.id}>
                        <DoorCard door={d} onOpen={(x) => setSelectedId(x.id)} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </TabState>
        </div>
      </div>

      <DoorTemplateDrawer
        door={selected}
        canCreate={can('catalog:create')}
        canEdit={can('catalog:update')}
        canDelete={can('catalog:delete')}
        onClose={() => setSelectedId(null)}
        onEdit={openStudio}
        onCopy={copyDoor}
        onDelete={(d) => {
          setSelectedId(null);
          setDeleting(d);
        }}
      />
      <DoorStudioModal
        key={studio?.door ? `studio-${studio.door.id}-${studio.door.code}` : `studio-new-${brandId}`}
        isOpen={!!studio}
        door={studio?.door ?? null}
        defaultBrandId={brandId}
        onClose={() => setStudio(null)}
      />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa mẫu cửa"
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      >
        Xóa mẫu cửa <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong>
        {deleting?.code ? ` (${deleting.code})` : ''}?
      </ConfirmDelete>
    </div>
  );
}
