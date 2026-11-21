'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  createGasket,
  createGlass,
  deleteGasket,
  deleteGlass,
  getGaskets,
  getGlassCategories,
  getGlasses,
  updateGasket,
  updateGlass,
} from '@/actions';
import type { Gasket, Glass } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { Badge } from '../../_components/badge';
import { ACTIVE } from './brand-sheet';
import { Layers } from 'lucide-react';
import { BTN_LINE } from '../../_components/form';
import { GlassCategoryManager } from './category-manager';
import { GlassImport } from './excel-imports';
import { EntityTab, type EntityConfig } from './entity-tab';

const GLASS_TYPES = [
  { value: 'trang', label: 'Kính trắng' },
  { value: 'cuong_luc', label: 'Cường lực' },
  { value: 'dan_an_toan', label: 'Dán an toàn' },
  { value: 'kinh_hop', label: 'Kính hộp' },
  { value: 'panel_alu', label: 'Panel nhôm' },
  { value: 'luoi_muoi', label: 'Lưới muỗi' },
  { value: 'nan_chop', label: 'Nan chớp' },
];
const GASKET_UNITS = [
  { value: 'm', label: 'Mét (m)' },
  { value: 'chai', label: 'Chai' },
  { value: 'cai', label: 'Cái' },
  { value: 'roll', label: 'Cuộn' },
  { value: 'set', label: 'Bộ' },
];
const n = (v: string) => (v.trim() === '' ? 0 : Number(v));
const opt = (v: string) => (v.trim() === '' ? null : Number(v));

type Kind = 'glass' | 'gasket';
// Kính / panel / lưới muỗi và gioăng, keo: hai nhóm chọn bằng chip.
export function TabGlass() {
  const [kind, setKind] = useState<Kind>('glass');
  const [importing, setImporting] = useState(false);
  const [groups, setGroups] = useState(false);
  const { data: cats } = useQuery({ queryKey: ['glass-categories', 'all'], queryFn: () => getGlassCategories({ limit: 200 }) });

  const glassCfg: EntityConfig<Glass> = {
    queryKey: 'glasses',
    noun: 'kính',
    load: async () => (await getGlasses({ limit: 500 })).items,
    title: (g) => g.name,
    sub: (g) => `${g.code} · dày ${g.thicknessMm} mm · ${formatCurrency(g.unitPrice)}/m²${g.category?.name ? ` · ${g.category.name}` : ''}`,
    cols: [
      { key: 'code', header: 'Mã', fit: true, cell: (g) => g.code },
      { key: 'cat', header: 'Nhóm', wideOnly: true, fit: true, cell: (g) => g.category?.name ?? '–' },
      { key: 'thick', header: 'Dày (mm)', fit: true, align: 'right', cell: (g) => g.thicknessMm },
      { key: 'price', header: 'Đơn giá/m²', fit: true, align: 'right', cell: (g) => formatCurrency(g.unitPrice) },
    ],
    badge: (g) => <Badge tone="primary">{GLASS_TYPES.find((t) => t.value === g.glassType)?.label ?? g.glassType}</Badge>,
    inactive: (g) => !g.isActive,
    fields: [
      {
        key: 'categoryId',
        label: 'Nhóm',
        type: 'select',
        required: true,
        options: (cats?.items ?? []).map((c) => ({ value: String(c.id), label: c.name })),
      },
      { key: 'code', label: 'Mã', required: true, half: true },
      { key: 'glassType', label: 'Loại', type: 'select', options: GLASS_TYPES, half: true },
      { key: 'name', label: 'Tên', required: true },
      { key: 'thicknessMm', label: 'Độ dày (mm)', type: 'number', required: true, half: true },
      { key: 'unitPrice', label: 'Đơn giá (đ/m²)', type: 'number', required: true, half: true },
      { key: 'weightPerM2', label: 'Nặng (kg/m²)', type: 'number', half: true },
      { key: 'isActive', label: 'Trạng thái', type: 'select', options: ACTIVE, half: true },
      { key: 'maxWidthMm', label: 'Rộng tối đa (mm)', type: 'number', half: true },
      { key: 'maxHeightMm', label: 'Cao tối đa (mm)', type: 'number', half: true },
    ],
    toForm: (g) => ({
      categoryId: g ? String(g.categoryId) : '',
      code: g?.code ?? '',
      glassType: g?.glassType ?? 'trang',
      name: g?.name ?? '',
      thicknessMm: g ? String(g.thicknessMm) : '',
      unitPrice: g ? String(g.unitPrice) : '',
      weightPerM2: g ? String(g.weightPerM2) : '',
      maxWidthMm: g?.maxWidthMm != null ? String(g.maxWidthMm) : '',
      maxHeightMm: g?.maxHeightMm != null ? String(g.maxHeightMm) : '',
      isActive: g?.isActive === false ? '0' : '1',
    }),
    save: (f, g) => {
      const body = {
        categoryId: Number(f.categoryId),
        code: f.code.trim(),
        name: f.name.trim(),
        glassType: f.glassType,
        thicknessMm: n(f.thicknessMm),
        unitPrice: n(f.unitPrice),
        weightPerM2: n(f.weightPerM2),
        maxWidthMm: opt(f.maxWidthMm),
        maxHeightMm: opt(f.maxHeightMm),
        isActive: f.isActive === '1',
      };
      return g ? updateGlass(g.id, body) : createGlass(body);
    },
    remove: (g) => deleteGlass(g.id),
  };

  const gasketCfg: EntityConfig<Gasket> = {
    queryKey: 'gaskets',
    noun: 'gioăng, keo',
    load: async () => (await getGaskets({ limit: 500 })).items,
    title: (g) => g.name,
    sub: (g) => `${g.code} · ${formatCurrency(g.pricePerUnit)}/${GASKET_UNITS.find((u) => u.value === g.unit)?.label ?? g.unit}`,
    cols: [
      { key: 'code', header: 'Mã', fit: true, cell: (g) => g.code },
      { key: 'unit', header: 'Đơn vị', fit: true, cell: (g) => GASKET_UNITS.find((u) => u.value === g.unit)?.label ?? g.unit },
      { key: 'price', header: 'Đơn giá', fit: true, align: 'right', cell: (g) => formatCurrency(g.pricePerUnit) },
    ],
    inactive: (g) => !g.isActive,
    fields: [
      { key: 'code', label: 'Mã', required: true, half: true },
      { key: 'unit', label: 'Đơn vị', type: 'select', options: GASKET_UNITS, half: true },
      { key: 'name', label: 'Tên', required: true },
      { key: 'pricePerUnit', label: 'Đơn giá (đ)', type: 'number', required: true, half: true },
      { key: 'isActive', label: 'Trạng thái', type: 'select', options: ACTIVE, half: true },
    ],
    toForm: (g) => ({
      code: g?.code ?? '',
      unit: g?.unit ?? 'm',
      name: g?.name ?? '',
      pricePerUnit: g ? String(g.pricePerUnit) : '',
      isActive: g?.isActive === false ? '0' : '1',
    }),
    save: (f, g) => {
      const body = { code: f.code.trim(), name: f.name.trim(), unit: f.unit, pricePerUnit: n(f.pricePerUnit), isActive: f.isActive === '1' };
      return g ? updateGasket(g.id, body) : createGasket(body);
    },
    remove: (g) => deleteGasket(g.id),
  };

  return (
    <>
      <div role="tablist" className="mb-3 flex gap-2">
        {(
          [
            ['glass', 'Kính, panel, lưới'],
            ['gasket', 'Gioăng, keo'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            className={cn(
              'h-9 rounded-rm border px-3 text-xs font-medium active:scale-95',
              kind === k ? 'border-rm-primary bg-rm-primary-soft text-rm-primary' : 'border-rm-line text-rm-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {kind === 'glass' ? (
        <EntityTab
          cfg={glassCfg}
          onImport={() => setImporting(true)}
          filter={
            <button
              type="button"
              onClick={() => setGroups(true)}
              aria-label="Quản lý nhóm kính"
              className={`${BTN_LINE} w-rm-tap px-0 md:w-auto md:px-4`}
            >
              <Layers size={18} aria-hidden="true" />
              <span className="hidden md:inline">Nhóm</span>
            </button>
          }
        />
      ) : (
        <EntityTab cfg={gasketCfg} onImport={() => setImporting(true)} />
      )}
      <GlassCategoryManager open={groups} onClose={() => setGroups(false)} />
      <GlassImport open={importing} onClose={() => setImporting(false)} />
    </>
  );
}
