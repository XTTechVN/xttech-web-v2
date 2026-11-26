'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Download, Layers, PauseCircle, Plus, Settings2, Upload, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  deleteAccessory,
  deleteAccessoryCategory,
  exportAccessoriesExcel,
  getAccessories,
  getAccessoryCategories,
  getBrands,
} from '@/actions';
import { Button, ConfirmDelete, FilterDrawer, SearchField, StatGrid, TabState } from '@/components-remake';
import { useCan, useDebounce } from '@/hooks';
import { getDefaultBrandId, type Accessory, type AccessoryCategory } from '@/types';
import { showErrorToast } from '@/utils';
import queryClient from '@/utils/query';
import { BrandSidebar } from '../../_components';
import { AccessoryCategoryManagerDrawer } from './_components/accessory-category-manager-drawer';
import { AccessoryDeleteConfirm } from './_components/accessory-delete-confirm';
import { AccessoryDrawer } from './_components/accessory-drawer';
import { AccessoryFormDrawer } from './_components/accessory-form-drawer';
import { AccessoryList } from './_components/accessory-list';
import { CategoryFormDrawer } from './_components/category-form-drawer';
import { AccessoryExcelDrawer } from './_components/modals/accessory-excel-drawer';

const refreshAccessories = () => {
  ['accessories', 'accessories-list', 'accessory-combos', 'accessory-combos-list', 'all-accessories-dropdown'].forEach((k) =>
    queryClient.invalidateQueries({ queryKey: [k] }),
  );
};

// Phụ kiện, roan và keo theo hãng; cột hãng bên trái giữ nguyên
export default function AccessoriesTab() {
  const { can } = useCan();
  const [search, setSearch] = useState('');
  const [pickedBrandId, setPickedBrandId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<{ accessory: Accessory | null } | null>(null);
  const [deleting, setDeleting] = useState<Accessory | null>(null);
  const [managing, setManaging] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{ category: AccessoryCategory | null } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<AccessoryCategory | null>(null);
  const [excelOpen, setExcelOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const kw = useDebounce(search.trim(), 300);

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
  const categoryId = filter.category ? Number(filter.category) : null;

  const categoriesQuery = useQuery({
    queryKey: ['accessory-categories'],
    queryFn: async () => (await getAccessoryCategories({ offset: 0, limit: 9999 })).items,
  });
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const accessoriesQuery = useQuery({
    queryKey: ['accessories', brandId, categoryId, kw],
    queryFn: async () =>
      (await getAccessories({ brandId: brandId!, categoryId: categoryId || undefined, limit: 1000, offset: 0, allowDeleted: false, search: kw || undefined })).items,
    enabled: brandId !== null,
  });
  const rows = useMemo(() => accessoriesQuery.data ?? [], [accessoriesQuery.data]);
  const selected = useMemo(() => rows.find((a) => a.id === selectedId) ?? null, [rows, selectedId]);
  const brandName = brands.find((b) => b.id === brandId)?.name;

  const remove = useMutation({
    mutationFn: (id: number) => deleteAccessory(id),
    onSuccess: () => {
      refreshAccessories();
      toast.success('Đã xóa phụ kiện và các combo liên quan');
      setDeleting(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa phụ kiện'),
  });
  const removeCategory = useMutation({
    mutationFn: (id: number) => deleteAccessoryCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessory-categories'] });
      toast.success('Đã xóa danh mục');
      setDeletingCategory(null);
    },
    onError: (e) => showErrorToast(e, 'Không thể xóa danh mục'),
  });

  const exportExcel = async () => {
    try {
      setExporting(true);
      await exportAccessoriesExcel({ brandId, categoryId });
      toast.success('Đã xuất file Excel danh sách phụ kiện');
    } catch (e) {
      showErrorToast(e, 'Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const onImported = (brandIds: number[], categoryIds: Array<number | null>) => {
    if (brandIds.length > 0 && (!brandId || !brandIds.includes(brandId))) setPickedBrandId(brandIds[0]);
    if (categoryId !== null && categoryIds.some((c) => c !== categoryId)) setFilter({});
    setSearch('');
  };

  const openForm = (accessory: Accessory | null) => {
    setSelectedId(null);
    setForm({ accessory });
  };

  const stats = [
    { label: 'Phụ kiện của hãng', value: rows.length, icon: Wrench },
    { label: 'Đang hoạt động', value: rows.filter((a) => a.isActive !== false).length, icon: CheckCircle2 },
    { label: 'Tạm ngưng', value: rows.filter((a) => a.isActive === false).length, icon: PauseCircle },
    { label: 'Danh mục', value: categories.length, icon: Layers },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 md:px-6 md:pb-6">
      <StatGrid items={stats} />
      <div className="flex items-center gap-2">
        <SearchField value={search} onChange={setSearch} label="Tìm phụ kiện" placeholder="Tìm theo mã hoặc tên phụ kiện..." />
        <FilterDrawer
          groups={[{ key: 'category', label: 'Danh mục', options: categories.map((c) => ({ value: String(c.id), label: c.name })) }]}
          value={filter}
          onChange={setFilter}
        />
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
              Danh mục
            </Button>
          )}
          {can('catalog:create') && (
            <Button icon={<Plus size={18} />} iconOnly="mobile" onClick={() => openForm(null)}>
              Thêm phụ kiện
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <BrandSidebar
          brands={brands}
          selectedBrandId={brandId}
          onSelectBrand={(id) => {
            setPickedBrandId(id);
            setFilter({});
          }}
        />
        <div className="w-full min-w-0 flex-1">
          <TabState
            loading={brandsQuery.isLoading || accessoriesQuery.isLoading}
            error={brandsQuery.isError || accessoriesQuery.isError}
            onRetry={() => {
              brandsQuery.refetch();
              accessoriesQuery.refetch();
            }}
            empty={rows.length === 0}
            emptyText={kw || categoryId ? 'Không có phụ kiện khớp bộ lọc.' : `${brandName ? `Hãng ${brandName}` : 'Hãng này'} chưa có phụ kiện.`}
            emptyAction={
              !kw &&
              !categoryId &&
              can('catalog:create') && (
                <Button icon={<Plus size={18} />} onClick={() => openForm(null)}>
                  Thêm phụ kiện
                </Button>
              )
            }
          >
            <AccessoryList rows={rows} onOpen={(a) => setSelectedId(a.id)} />
          </TabState>
        </div>
      </div>

      <AccessoryDrawer
        accessory={selected}
        brands={brands}
        canEdit={can('catalog:update')}
        canDelete={can('catalog:delete')}
        onClose={() => setSelectedId(null)}
        onEdit={openForm}
        onDelete={(a) => {
          setSelectedId(null);
          setDeleting(a);
        }}
      />
      <AccessoryFormDrawer isOpen={!!form} onClose={() => setForm(null)} accessory={form?.accessory ?? null} brands={brands} defaultBrandId={brandId} />
      <AccessoryCategoryManagerDrawer
        isOpen={managing}
        onClose={() => setManaging(false)}
        categories={categories}
        canCreate={can('catalog:create')}
        canUpdate={can('catalog:update')}
        canDelete={can('catalog:delete')}
        onAdd={() => setCategoryForm({ category: null })}
        onEdit={(category) => setCategoryForm({ category })}
        onDelete={setDeletingCategory}
      />
      <CategoryFormDrawer isOpen={!!categoryForm} onClose={() => setCategoryForm(null)} category={categoryForm?.category ?? null} />
      <AccessoryExcelDrawer
        isOpen={excelOpen}
        onClose={() => setExcelOpen(false)}
        brands={brands}
        categories={categories}
        defaultBrandId={brandId}
        onImportSuccess={onImported}
      />
      <AccessoryDeleteConfirm accessory={deleting} pending={remove.isPending} onClose={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id)} />
      <ConfirmDelete
        isOpen={!!deletingCategory}
        title="Xác nhận xóa danh mục"
        pending={removeCategory.isPending}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => deletingCategory && removeCategory.mutate(deletingCategory.id)}
      >
        Xóa danh mục <strong className="font-semibold text-slate-900 [overflow-wrap:anywhere]">{deletingCategory?.name}</strong>?
      </ConfirmDelete>
    </div>
  );
}
