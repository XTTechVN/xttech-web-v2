'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createAccessory, deleteAccessory, getAccessories, getAccessoryCategories, getBrands, updateAccessory } from '@/actions';
import type { Accessory } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Badge } from '../../_components/badge';
import { ACTIVE } from './brand-sheet';
import { Layers } from 'lucide-react';
import { BTN_LINE } from '../../_components/form';
import { AccessoryCategoryManager } from './category-manager';
import { AccessoryImport } from './excel-imports';
import { EntityTab, type EntityConfig } from './entity-tab';

const UNITS = [
  { value: 'set', label: 'Bộ' },
  { value: 'pcs', label: 'Cái' },
  { value: 'unit', label: 'Chiếc' },
  { value: 'pair', label: 'Đôi / Cặp' },
  { value: 'roll', label: 'Cuộn' },
  { value: 'box', label: 'Hộp' },
  { value: 'bag', label: 'Túi' },
  { value: 'meter', label: 'Mét' },
];

// Phụ kiện: tên, nhóm, hãng, đơn vị, giá vốn. (Ảnh phụ kiện chưa sửa ở bản này.)
export function TabAccessories() {
  const [importing, setImporting] = useState(false);
  const [groups, setGroups] = useState(false);
  const { data: cats } = useQuery({ queryKey: ['accessory-categories', 'all'], queryFn: () => getAccessoryCategories({ limit: 200 }) });
  const { data: brands } = useQuery({ queryKey: ['brands', 'accessory-all'], queryFn: () => getBrands({ limit: 9999, brandType: 'accessory' }) });
  const cfg: EntityConfig<Accessory> = {
    queryKey: 'accessories',
    noun: 'phụ kiện',
    load: async () => (await getAccessories({ limit: 500 })).items,
    title: (a) => a.name,
    sub: (a) =>
      `${a.code ?? '–'} · ${formatCurrency(a.costPrice)}/${UNITS.find((u) => u.value === a.unit)?.label ?? a.unit ?? '–'}${a.brand?.name ? ` · ${a.brand.name}` : ''}`,
    cols: [
      { key: 'code', header: 'Mã', fit: true, cell: (a) => a.code ?? '–' },
      { key: 'brand', header: 'Hãng', wideOnly: true, fit: true, cell: (a) => a.brand?.name ?? '–' },
      { key: 'unit', header: 'Đơn vị', fit: true, cell: (a) => UNITS.find((u) => u.value === a.unit)?.label ?? a.unit ?? '–' },
      { key: 'cost', header: 'Giá vốn', fit: true, align: 'right', cell: (a) => formatCurrency(a.costPrice) },
    ],
    badge: (a) => (a.category?.name ? <Badge>{a.category.name}</Badge> : null),
    inactive: (a) => a.isActive === false,
    fields: [
      { key: 'name', label: 'Tên phụ kiện', required: true },
      { key: 'code', label: 'Mã', half: true },
      { key: 'unit', label: 'Đơn vị', type: 'select', options: UNITS, half: true },
      { key: 'categoryId', label: 'Nhóm', type: 'select', options: (cats?.items ?? []).map((c) => ({ value: String(c.id), label: c.name })) },
      { key: 'brandId', label: 'Hãng', type: 'select', options: (brands?.items ?? []).map((b) => ({ value: String(b.id), label: b.name })) },
      { key: 'costPrice', label: 'Giá vốn (đ)', type: 'number', half: true },
      { key: 'color', label: 'Màu', half: true },
      { key: 'specification', label: 'Quy cách' },
      { key: 'isActive', label: 'Trạng thái', type: 'select', options: ACTIVE },
    ],
    toForm: (a) => ({
      name: a?.name ?? '',
      code: a?.code ?? '',
      unit: a?.unit ?? 'pcs',
      categoryId: a?.categoryId ? String(a.categoryId) : '',
      brandId: a?.brandId ? String(a.brandId) : '',
      costPrice: a ? String(a.costPrice) : '',
      color: a?.color ?? '',
      specification: a?.specification ?? '',
      isActive: a?.isActive === false ? '0' : '1',
    }),
    save: (f, a) => {
      const data = {
        name: f.name.trim(),
        code: f.code.trim() || undefined,
        unit: f.unit,
        categoryId: f.categoryId ? Number(f.categoryId) : null,
        brandId: f.brandId ? Number(f.brandId) : null,
        costPrice: f.costPrice ? Number(f.costPrice) : 0,
        color: f.color.trim() || undefined,
        specification: f.specification.trim() || undefined,
        isActive: f.isActive === '1',
      };
      return a ? updateAccessory(a.id, { data }) : createAccessory({ data });
    },
    remove: (a) => deleteAccessory(a.id),
  };
  return (
    <>
      <EntityTab
        cfg={cfg}
        onImport={() => setImporting(true)}
        filter={
          <button
            type="button"
            onClick={() => setGroups(true)}
            aria-label="Quản lý nhóm phụ kiện"
            className={`${BTN_LINE} w-rm-tap px-0 md:w-auto md:px-4`}
          >
            <Layers size={18} aria-hidden="true" />
            <span className="hidden md:inline">Nhóm</span>
          </button>
        }
      />
      <AccessoryCategoryManager open={groups} onClose={() => setGroups(false)} />
      <AccessoryImport open={importing} onClose={() => setImporting(false)} />
    </>
  );
}
