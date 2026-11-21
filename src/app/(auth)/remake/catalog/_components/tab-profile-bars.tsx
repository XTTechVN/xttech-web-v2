'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createProfileBar, deleteProfileBar, getBrands, getDoorSeriesList, getProfileBars, getProfileSections, updateProfileBar } from '@/actions';
import { Shapes } from 'lucide-react';
import type { ProfileBar } from '@/types';
import { Badge } from '../../_components/badge';
import { ACTIVE } from './brand-sheet';
import { BTN_LINE } from '../../_components/form';
import { BarImport } from './excel-imports';
import { SectionLibrary } from './section-library';
import { EntityTab, type EntityConfig } from './entity-tab';

export const BAR_TYPES = [
  { value: 'FRAME', label: 'Khung bao' },
  { value: 'SASH', label: 'Cánh cửa' },
  { value: 'SCREEN_SASH', label: 'Cánh lưới muỗi' },
  { value: 'MULLION', label: 'Đố cố định / Đố chia' },
  { value: 'DYNAMIC_MULLION', label: 'Đố động' },
  { value: 'BEAD', label: 'Nẹp kính' },
  { value: 'TRACK', label: 'Ray trượt' },
  { value: 'COUPLING', label: 'Thanh ghép khung' },
  { value: 'REVERSAL', label: 'Thanh đảo chiều / Khuôn phụ' },
  { value: 'INTERLOCK', label: 'Thanh móc / Hèm đối đầu' },
  { value: 'SASH_JOINER', label: 'Thanh nối cánh' },
  { value: 'LOUVER', label: 'Lá sách / Chớp nhôm' },
  { value: 'PANO', label: 'Tấm pano nhôm' },
  { value: 'COVER', label: 'Ốp / Nắp đậy' },
  { value: 'CORNER', label: 'Ke góc liên kết' },
  { value: 'OTHER', label: 'Phụ trợ / Khác' },
];
const typeLabel = (t: string) => BAR_TYPES.find((x) => x.value === t.toUpperCase())?.label ?? t;
const n = (v: string) => (v.trim() === '' ? 0 : Number(v));

// Thanh profile: mã, loại thanh, trọng lượng, tiết diện và các số trừ khi tính cắt.
export function TabProfileBars() {
  const [importing, setImporting] = useState(false);
  const [library, setLibrary] = useState(false);
  const { data: sections } = useQuery({ queryKey: ['profile-sections', 'options'], queryFn: () => getProfileSections({ limit: 500 }) });
  const { data: brands } = useQuery({ queryKey: ['brands', 'aluminum-all'], queryFn: () => getBrands({ limit: 9999, brandType: 'aluminum' }) });
  const { data: series } = useQuery({ queryKey: ['door-series', 'all'], queryFn: () => getDoorSeriesList({ limit: 200 }) });
  const cfg: EntityConfig<ProfileBar> = {
    queryKey: 'profile-bars',
    noun: 'thanh profile',
    load: async () => (await getProfileBars({ limit: 500 })).items,
    title: (b) => b.name,
    sub: (b) => `${b.code} · ${b.weightPerM} kg/m · ${b.barLengthMm} mm${b.doorSeries?.name ? ` · ${b.doorSeries.name}` : ''}`,
    cols: [
      { key: 'code', header: 'Mã', fit: true, cell: (b) => b.code },
      { key: 'series', header: 'Hệ nhôm', wideOnly: true, fit: true, cell: (b) => b.doorSeries?.name ?? '–' },
      { key: 'weight', header: 'kg/m', fit: true, align: 'right', cell: (b) => b.weightPerM },
      { key: 'len', header: 'Dài cây (mm)', fit: true, align: 'right', cell: (b) => b.barLengthMm },
    ],
    badge: (b) => <Badge tone="primary">{typeLabel(b.barType)}</Badge>,
    inactive: (b) => !b.isActive,
    fields: [
      {
        key: 'brandId',
        label: 'Hãng',
        type: 'select',
        required: true,
        options: (brands?.items ?? []).map((b) => ({ value: String(b.id), label: b.name })),
      },
      {
        key: 'seriesId',
        label: 'Hệ nhôm',
        type: 'select',
        required: true,
        options: (series?.items ?? []).map((s) => ({ value: String(s.id), label: s.name })),
      },
      { key: 'code', label: 'Mã thanh', required: true, half: true },
      { key: 'barType', label: 'Loại thanh', type: 'select', required: true, options: BAR_TYPES, half: true },
      { key: 'name', label: 'Tên thanh', required: true },
      { key: 'weightPerM', label: 'Trọng lượng (kg/m)', type: 'number', required: true, half: true },
      { key: 'sectionHeightMm', label: 'Cao tiết diện (mm)', type: 'number', required: true, half: true },
      { key: 'barLengthMm', label: 'Dài cây (mm)', type: 'number', half: true },
      { key: 'isActive', label: 'Trạng thái', type: 'select', options: ACTIVE, half: true },
      {
        key: 'sectionLibraryId',
        label: 'Mặt cắt (thư viện SVG)',
        type: 'select',
        options: [{ value: '', label: 'Chưa chọn' }, ...(sections ?? []).map((s) => ({ value: String(s.id), label: `${s.code} · ${s.name}` }))],
      },
      { key: 'deductMullionMm', label: 'Trừ đố (mm)', type: 'number', half: true },
      { key: 'deductSashMm', label: 'Trừ cánh (mm)', type: 'number', half: true },
      { key: 'deductBeadMm', label: 'Trừ nẹp (mm)', type: 'number', half: true },
      { key: 'deductGlassMm', label: 'Trừ kính (mm)', type: 'number', half: true },
    ],
    toForm: (b) => ({
      brandId: b ? String(b.brandId) : '',
      seriesId: b ? String(b.seriesId) : '',
      code: b?.code ?? '',
      name: b?.name ?? '',
      barType: b?.barType.toUpperCase() ?? 'FRAME',
      weightPerM: b ? String(b.weightPerM) : '',
      sectionHeightMm: b ? String(b.sectionHeightMm) : '',
      barLengthMm: b ? String(b.barLengthMm) : '6000',
      sectionLibraryId: b?.sectionLibraryId ? String(b.sectionLibraryId) : '',
      deductMullionMm: String(b?.deductMullionMm ?? 0),
      deductSashMm: String(b?.deductSashMm ?? 0),
      deductBeadMm: String(b?.deductBeadMm ?? 0),
      deductGlassMm: String(b?.deductGlassMm ?? 0),
      isActive: b?.isActive === false ? '0' : '1',
    }),
    save: (f, b) => {
      const body = {
        brandId: Number(f.brandId),
        seriesId: Number(f.seriesId),
        code: f.code.trim(),
        name: f.name.trim(),
        barType: f.barType,
        weightPerM: n(f.weightPerM),
        sectionHeightMm: n(f.sectionHeightMm),
        barLengthMm: n(f.barLengthMm),
        deductMullionMm: n(f.deductMullionMm),
        deductSashMm: n(f.deductSashMm),
        deductBeadMm: n(f.deductBeadMm),
        deductGlassMm: n(f.deductGlassMm),
        sectionLibraryId: f.sectionLibraryId ? Number(f.sectionLibraryId) : null,
        isActive: f.isActive === '1',
      };
      return b ? updateProfileBar(b.id, body) : createProfileBar(body);
    },
    remove: (b) => deleteProfileBar(b.id),
  };
  return (
    <>
      <EntityTab
        cfg={cfg}
        onImport={() => setImporting(true)}
        filter={
          <button
            type="button"
            onClick={() => setLibrary(true)}
            aria-label="Thư viện mặt cắt"
            className={`${BTN_LINE} w-rm-tap px-0 md:w-auto md:px-4`}
          >
            <Shapes size={18} aria-hidden="true" />
            <span className="hidden md:inline">Mặt cắt</span>
          </button>
        }
      />
      <SectionLibrary open={library} onClose={() => setLibrary(false)} />
      <BarImport open={importing} onClose={() => setImporting(false)} />
    </>
  );
}
