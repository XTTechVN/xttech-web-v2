'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Layers, PauseCircle, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteAccessoryCombo, getAccessoryCombos, getBrands, updateAccessoryCombo } from '@/actions';
import { ComboModal } from '@/components';
import { Button, ConfirmDelete, FilterDrawer, SearchField, StatGrid, TabState } from '@/components-remake';
import { useCan } from '@/hooks';
import { COMBO_APPLY_FOR_OPTIONS, COMBO_DOOR_TYPE_OPTIONS, getDefaultBrandId, type AccessoryCombo } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { BrandTiles } from '../../_components';
import { ComboDrawer } from './_components/combo-drawer';
import { ComboList } from './_components/combo-list';

const refreshCombos = () => {
  queryClient.invalidateQueries({ queryKey: ['accessory-combos'] });
  queryClient.invalidateQueries({ queryKey: ['accessory-combos-list'] });
};

// Combo phụ kiện theo hãng; hãng chọn trong bộ lọc
export default function AccessoryCombosTab() {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [pickedBrandId, setPickedBrandId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<{ combo: AccessoryCombo | null; copy: boolean } | null>(null);
  const [deleting, setDeleting] = useState<AccessoryCombo | null>(null);

  const brandsQuery = useQuery({
    queryKey: ['brands', 'accessory'],
    queryFn: async () => {
      const res = await getBrands({ limit: 9999, offset: 0, allowDeleted: false, brandType: 'accessory' });
      if (res.items?.length) return res.items;
      return (await getBrands({ limit: 9999, offset: 0, allowDeleted: false })).items || [];
    },
  });
  const brands = useMemo(() => brandsQuery.data ?? [], [brandsQuery.data]);
  const sortedBrands = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })), [brands]);
  const brandId = pickedBrandId ?? getDefaultBrandId(sortedBrands);

  const combosQuery = useQuery({
    queryKey: ['accessory-combos', brandId],
    queryFn: async () => (await getAccessoryCombos({ brandId: brandId || undefined, limit: 9999, offset: 0 })).items || [],
    enabled: brandId !== null,
  });
  const all = useMemo(() => combosQuery.data ?? [], [combosQuery.data]);

  const kw = search.trim();
  const rows = useMemo(
    () =>
      all.filter(
        (c) =>
          (!filter.applyFor || (c.applyFor || 'khung') === filter.applyFor) &&
          (!filter.doorType || (c.doorTypes ?? []).includes(filter.doorType)) &&
          (!kw || includesSearchText(c.name, kw) || includesSearchText(c.code, kw)),
      ),
    [all, filter, kw],
  );
  const selected = useMemo(() => all.find((c) => c.id === selectedId) ?? null, [all, selectedId]);
  const brandName = brands.find((b) => b.id === brandId)?.name;
  const filtered = !!kw || !!filter.applyFor || !!filter.doorType;

  const remove = useMutation({
    mutationFn: (id: number) => deleteAccessoryCombo(id),
    onSuccess: () => {
      refreshCombos();
      toast.success('Đã xóa gói combo');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa gói combo'),
  });
  const toggleDefault = useMutation({
    mutationFn: (c: AccessoryCombo) => updateAccessoryCombo(c.id, { isDefault: !c.isDefault }),
    onSuccess: refreshCombos,
    onError: (e) => showErrorToast(e, 'Không thể cập nhật mặc định'),
  });

  const openForm = (combo: AccessoryCombo | null, copy = false) => {
    setSelectedId(null);
    setForm({ combo, copy });
  };

  const stats = [
    { label: 'Gói của hãng', value: all.length, icon: Layers },
    { label: 'Đang hoạt động', value: all.filter((c) => c.isActive).length, icon: CheckCircle2 },
    { label: 'Tạm ngưng', value: all.filter((c) => !c.isActive).length, icon: PauseCircle },
    { label: 'Mặc định', value: all.filter((c) => c.isDefault).length, icon: Star },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:pb-6">
      <StatGrid items={stats} />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm gói combo" placeholder="Tìm theo mã hoặc tên combo..." />
        <FilterDrawer
          groups={[
            { key: 'applyFor', label: 'Dành cho', options: COMBO_APPLY_FOR_OPTIONS },
            { key: 'doorType', label: 'Loại cửa áp dụng', options: COMBO_DOOR_TYPE_OPTIONS },
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
          <Button className="ml-auto" icon={<Plus size={18} />} iconOnly="mobile" onClick={() => openForm(null)}>
            Thêm combo
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full min-w-0 flex-1">
          <TabState
            loading={brandsQuery.isLoading || combosQuery.isLoading}
            error={brandsQuery.isError || combosQuery.isError}
            onRetry={() => {
              brandsQuery.refetch();
              combosQuery.refetch();
            }}
            empty={rows.length === 0}
            emptyText={filtered ? 'Không có gói combo khớp bộ lọc.' : `${brandName ? `Hãng ${brandName}` : 'Hãng này'} chưa có gói combo.`}
            emptyAction={
              !filtered &&
              can('catalog:create') && (
                <Button icon={<Plus size={18} />} onClick={() => openForm(null)}>
                  Thêm combo
                </Button>
              )
            }
          >
            <ComboList rows={rows} onOpen={(c) => setSelectedId(c.id)} />
          </TabState>
        </div>
      </div>

      <ComboDrawer
        combo={selected}
        canCreate={can('catalog:create')}
        canEdit={can('catalog:update')}
        canDelete={can('catalog:delete')}
        togglingDefault={toggleDefault.isPending}
        onClose={() => setSelectedId(null)}
        onCopy={(c) => openForm(c, true)}
        onEdit={(c) => openForm(c)}
        onDelete={(c) => {
          setSelectedId(null);
          setDeleting(c);
        }}
        onToggleDefault={(c) => toggleDefault.mutate(c)}
      />
      <ComboModal
        asDrawer
        isOpen={!!form}
        onClose={() => setForm(null)}
        combo={form?.combo ?? null}
        isCopy={form?.copy ?? false}
        brandId={brandId}
        defaultApplyFor={(filter.applyFor as 'khung' | 'canh' | 'huong_mo' | 'khac') || 'khung'}
      />
      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa gói combo"
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      >
        Xóa gói combo <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong> ({deleting?.code})?
      </ConfirmDelete>
    </div>
  );
}
