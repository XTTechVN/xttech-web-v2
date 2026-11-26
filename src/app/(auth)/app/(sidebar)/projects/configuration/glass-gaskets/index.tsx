'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Download, Grid2x2, Layers, PanelTop, Plus, Settings2, Square, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteGlass, deleteGlassCategory, exportGlassGasketsExcel, getGlassCategories, getGlasses, setDefaultGlass } from '@/actions';
import { Button, ConfirmDelete, SearchField, StatGrid, TabState } from '@/components-remake';
import { useCan } from '@/hooks';
import type { Glass, GlassCategory } from '@/types';
import { includesSearchText, showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { GlassCategoryFormDrawer } from './_components/glass-category-form-drawer';
import { GlassCategoryManagerDrawer } from './_components/glass-category-manager-drawer';
import { GlassCategorySidebar, getCategoryMaterialType, type GlassGasketCategoryFilter, type MaterialTypeFilter } from './_components/glass-category-sidebar';
import { GlassDrawer } from './_components/glass-drawer';
import { GlassFormDrawer } from './_components/glass-form-drawer';
import { GlassList } from './_components/glass-list';
import { GlassGasketExcelDrawer } from './_components/modals/glass-gasket-excel-drawer';

const ADD_LABEL: Record<MaterialTypeFilter, string> = { all: 'Thêm quy cách', glass: 'Thêm kính', panel: 'Thêm tấm', screen_mesh: 'Thêm lưới' };

// Kính, tấm panel và lưới muỗi; cột chủng loại bên trái
export default function GlassGasketsTab() {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<MaterialTypeFilter>('all');
  const [categoryId, setCategoryId] = useState<GlassGasketCategoryFilter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<{ glass: Glass | null } | null>(null);
  const [deleting, setDeleting] = useState<Glass | null>(null);
  const [managing, setManaging] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{ category: GlassCategory | null } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<GlassCategory | null>(null);
  const [excelOpen, setExcelOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ['glass-categories'],
    queryFn: async () => (await getGlassCategories({ limit: 999 })).items,
  });
  const glassesQuery = useQuery({
    queryKey: ['glasses'],
    queryFn: async () => (await getGlasses({ limit: 999 })).items,
  });
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const all = useMemo(() => glassesQuery.data ?? [], [glassesQuery.data]);

  const typeOf = useMemo(() => new Map(categories.map((c) => [c.id, getCategoryMaterialType(c)])), [categories]);
  const counts = useMemo(() => {
    const n = { glass: 0, panel: 0, screen_mesh: 0 };
    all.forEach((g) => (n[typeOf.get(g.categoryId) ?? 'glass'] += 1));
    return n;
  }, [all, typeOf]);

  const kw = search.trim();
  const rows = useMemo(
    () =>
      all.filter(
        (g) =>
          (type === 'all' || (typeOf.get(g.categoryId) ?? 'glass') === type) &&
          (categoryId === 'all' || g.categoryId === categoryId) &&
          (!kw || includesSearchText(g.name, kw) || includesSearchText(g.code, kw) || includesSearchText(g.glassType || '', kw)),
      ),
    [all, type, categoryId, kw, typeOf],
  );
  const selected = useMemo(() => all.find((g) => g.id === selectedId) ?? null, [all, selectedId]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['glasses'] });

  const remove = useMutation({
    mutationFn: (id: number) => deleteGlass(id),
    onSuccess: () => {
      refresh();
      toast.success('Đã xóa quy cách');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa quy cách'),
  });
  const makeDefault = useMutation({
    mutationFn: (id: number) => setDefaultGlass(id),
    onSuccess: (g) => {
      refresh();
      toast.success(`Đã đặt "${g.name}" làm mặc định`);
    },
    onError: (e) => showErrorToast(e, 'Không thể đặt mặc định'),
  });
  const removeCategory = useMutation({
    mutationFn: (id: number) => deleteGlassCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glass-categories'] });
      toast.success('Đã xóa nhóm chủng loại');
      setDeletingCategory(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa nhóm chủng loại'),
  });

  const exportExcel = async () => {
    try {
      setExporting(true);
      await exportGlassGasketsExcel({ categoryId: typeof categoryId === 'number' ? categoryId : null });
      toast.success('Đã xuất file Excel');
    } catch (e) {
      showErrorToast(e, 'Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const openForm = (glass: Glass | null) => {
    setSelectedId(null);
    setForm({ glass });
  };

  const stats = [
    { label: 'Tổng quy cách', value: all.length, icon: Layers },
    { label: 'Kính', value: counts.glass, icon: Square },
    { label: 'Tấm', value: counts.panel, icon: PanelTop },
    { label: 'Lưới', value: counts.screen_mesh, icon: Grid2x2 },
  ];
  const currentCategory = typeof categoryId === 'number' ? categories.find((c) => c.id === categoryId) : null;

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:pb-6">
      <StatGrid items={stats} />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm quy cách" placeholder="Tìm theo mã hoặc tên quy cách..." />
        <div className="ml-auto flex flex-none items-center gap-2">
          <Button variant="outline" icon={<Download size={16} />} iconOnly="mobile" loading={exporting} onClick={exportExcel}>
            Xuất Excel
          </Button>
          {can('catalog:create') && (
            <Button variant="outline" icon={<Upload size={16} />} iconOnly="mobile" onClick={() => setExcelOpen(true)}>
              Nhập Excel
            </Button>
          )}
          {can('catalog:update') && (
            <Button variant="outline" icon={<Settings2 size={16} />} iconOnly="mobile" onClick={() => setManaging(true)}>
              Nhóm chủng loại
            </Button>
          )}
          {can('catalog:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => openForm(null)}>
              {ADD_LABEL[type]}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <GlassCategorySidebar
          categories={categories}
          selectedType={type}
          onSelectType={setType}
          selectedCategory={categoryId}
          onSelectCategory={setCategoryId}
          glassCount={all.length}
          glassTypeCounts={counts}
        />
        <div className="w-full min-w-0 flex-1">
          <TabState
            loading={categoriesQuery.isLoading || glassesQuery.isLoading}
            error={categoriesQuery.isError || glassesQuery.isError}
            onRetry={() => {
              categoriesQuery.refetch();
              glassesQuery.refetch();
            }}
            empty={rows.length === 0}
            emptyText={kw ? 'Không có quy cách khớp từ khóa.' : currentCategory ? `Nhóm ${currentCategory.name} chưa có quy cách.` : 'Chưa có quy cách nào.'}
            emptyAction={
              !kw &&
              can('catalog:create') && (
                <Button icon={<Plus size={18} />} onClick={() => openForm(null)}>
                  {ADD_LABEL[type]}
                </Button>
              )
            }
          >
            <GlassList rows={rows} categories={categories} onOpen={(g) => setSelectedId(g.id)} />
          </TabState>
        </div>
      </div>

      <GlassDrawer
        glass={selected}
        categories={categories}
        canEdit={can('catalog:update')}
        canDelete={can('catalog:delete')}
        settingDefault={makeDefault.isPending}
        onClose={() => setSelectedId(null)}
        onEdit={openForm}
        onDelete={(g) => {
          setSelectedId(null);
          setDeleting(g);
        }}
        onSetDefault={(g) => makeDefault.mutate(g.id)}
      />
      <GlassFormDrawer
        isOpen={!!form}
        onClose={() => setForm(null)}
        glass={form?.glass ?? null}
        categories={categories}
        defaultMaterialType={type !== 'all' ? type : 'glass'}
        defaultCategoryId={typeof categoryId === 'number' ? categoryId : undefined}
      />
      <GlassCategoryManagerDrawer
        isOpen={managing}
        onClose={() => setManaging(false)}
        categories={categories}
        onAdd={() => setCategoryForm({ category: null })}
        onEdit={(category) => setCategoryForm({ category })}
        onDelete={setDeletingCategory}
      />
      <GlassCategoryFormDrawer isOpen={!!categoryForm} onClose={() => setCategoryForm(null)} category={categoryForm?.category ?? null} />
      <GlassGasketExcelDrawer isOpen={excelOpen} onClose={() => setExcelOpen(false)} categories={categories} existingGlasses={all} />

      <ConfirmDelete
        isOpen={!!deleting}
        title="Xác nhận xóa quy cách"
        pending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      >
        Xóa quy cách <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deleting?.name}</strong> ({deleting?.code})?
      </ConfirmDelete>
      <ConfirmDelete
        isOpen={!!deletingCategory}
        title="Xác nhận xóa nhóm chủng loại"
        pending={removeCategory.isPending}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => deletingCategory && removeCategory.mutate(deletingCategory.id)}
      >
        Xóa nhóm <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deletingCategory?.name}</strong>?
      </ConfirmDelete>
    </div>
  );
}
