'use client';

import { useQuery } from '@tanstack/react-query';
import {
  bulkUpsertAccessories,
  bulkUpsertGlassGaskets,
  bulkUpsertProfileBars,
  exportAccessoriesExcel,
  exportGlassGasketsExcel,
  exportProfileBarsExcel,
  getAccessories,
  getAccessoryCategories,
  getBrands,
  getDoorSeriesList,
  getGaskets,
  getGlassCategories,
  getGlasses,
  getProfileBars,
  getProfileSections,
  previewAccessoriesExcel,
  previewGlassGasketsExcel,
  previewProfileBarsExcel,
} from '@/actions';
import { ExcelImport, type Dataset, type Rec, type Rows, type XRow } from './excel-import';
import { BAR_TYPES } from './tab-profile-bars';

interface Common {
  open: boolean;
  onClose: () => void;
}
type Opt = { value: string; label: string };
const num = (v: unknown) => Number(v) || 0;
const up = (v: unknown) =>
  String(v ?? '')
    .trim()
    .toUpperCase();
const rowsOf = <
  T extends { rowIndex: number; action: XRow['action']; existingId: number | null; data: object; errors: string[]; warnings: string[] },
>(
  l?: T[],
): XRow[] =>
  (l ?? []).map((r) => ({
    rowIndex: r.rowIndex,
    action: r.action,
    existingId: r.existingId,
    data: { ...r.data } as Rec,
    errors: r.errors ?? [],
    warnings: r.warnings ?? [],
  }));
const validOf = (rows: XRow[] | undefined) => (rows ?? []).filter((r) => r.action !== 'ERROR');
const idOpts = (l: { id: number; name: string }[] | undefined): Opt[] => (l ?? []).map((x) => ({ value: String(x.id), label: x.name }));
const UNITS: Opt[] = [
  { value: 'set', label: 'Bộ' },
  { value: 'pcs', label: 'Cái' },
  { value: 'unit', label: 'Chiếc' },
  { value: 'pair', label: 'Đôi / Cặp' },
  { value: 'roll', label: 'Cuộn' },
  { value: 'box', label: 'Hộp' },
  { value: 'bag', label: 'Túi' },
  { value: 'meter', label: 'Mét' },
];

export function AccessoryImport({ open, onClose }: Common) {
  const brands = useQuery({
    queryKey: ['brands', 'accessory-all'],
    queryFn: () => getBrands({ limit: 9999, brandType: 'accessory' }),
    enabled: open,
  });
  const cats = useQuery({ queryKey: ['accessory-categories', 'all'], queryFn: () => getAccessoryCategories({ limit: 200 }), enabled: open });
  const existing = useQuery({
    queryKey: ['accessories', 'for-excel'],
    queryFn: async () => (await getAccessories({ limit: 5000, offset: 0 })).items,
    enabled: open,
  });
  const ds: Dataset = {
    id: 'acc',
    label: 'Phụ kiện',
    columns: [
      { key: 'code', label: 'Mã', kind: 'text' },
      { key: 'name', label: 'Tên phụ kiện', kind: 'text' },
      { key: 'brandId', label: 'Hãng', kind: 'select', options: () => idOpts(brands.data?.items) },
      { key: 'categoryId', label: 'Nhóm', kind: 'select', options: () => idOpts(cats.data?.items) },
      { key: 'unit', label: 'Đơn vị', kind: 'select', options: () => UNITS },
      { key: 'color', label: 'Màu', kind: 'text' },
      { key: 'specification', label: 'Quy cách', kind: 'text' },
      { key: 'costPrice', label: 'Giá nhập (đ)', kind: 'number' },
      { key: 'isActive', label: 'Trạng thái', kind: 'bool' },
    ],
    blank: () => ({
      code: '',
      name: '',
      brandId: brands.data?.items[0]?.id ?? null,
      categoryId: cats.data?.items[0]?.id ?? null,
      unit: 'pcs',
      color: '',
      specification: null,
      costPrice: 0,
      isActive: true,
    }),
    check: (d) => {
      const errors: string[] = [];
      if (!String(d.code ?? '').trim()) errors.push('Thiếu mã phụ kiện');
      if (!String(d.name ?? '').trim()) errors.push('Thiếu tên phụ kiện');
      if (!brands.data?.items.some((b) => b.id === Number(d.brandId))) errors.push('Chưa chọn hãng phụ kiện');
      if (num(d.costPrice) < 0) errors.push('Giá nhập không được âm');
      const hit = existing.data?.find((a) => up(a.code) === up(d.code));
      return { errors, existingId: d.code && hit ? hit.id : null };
    },
  };
  return (
    <ExcelImport
      open={open}
      onClose={onClose}
      title="Nhập Excel phụ kiện"
      datasets={[ds]}
      invalidate={['accessories']}
      template={() => exportAccessoriesExcel({ templateOnly: true })}
      preview={async (f): Promise<Rows> => ({ acc: rowsOf((await previewAccessoriesExcel(f)).rows) })}
      save={(r) =>
        bulkUpsertAccessories({
          items: validOf(r.acc).map((x) => ({
            existingId: x.existingId,
            code: String(x.data.code).trim(),
            name: String(x.data.name).trim(),
            brandId: x.data.brandId ? Number(x.data.brandId) : null,
            categoryId: x.data.categoryId ? Number(x.data.categoryId) : null,
            unit: String(x.data.unit ?? 'pcs'),
            color: String(x.data.color ?? ''),
            specification: (x.data.specification as string | null) ?? null,
            costPrice: num(x.data.costPrice),
            isActive: x.data.isActive !== false,
          })),
        })
      }
    />
  );
}

const GLASS_TYPES: Opt[] = [
  { value: 'trang', label: 'Kính trắng' },
  { value: 'cuong_luc', label: 'Cường lực' },
  { value: 'dan_an_toan', label: 'Dán an toàn' },
  { value: 'kinh_hop', label: 'Kính hộp' },
  { value: 'panel_alu', label: 'Panel nhôm' },
  { value: 'luoi_muoi', label: 'Lưới muỗi' },
  { value: 'nan_chop', label: 'Nan chớp' },
];
const GASKET_UNITS: Opt[] = [
  { value: 'm', label: 'Mét (m)' },
  { value: 'chai', label: 'Chai' },
  { value: 'cai', label: 'Cái' },
  { value: 'roll', label: 'Cuộn' },
  { value: 'set', label: 'Bộ' },
];

export function GlassImport({ open, onClose }: Common) {
  const cats = useQuery({ queryKey: ['glass-categories', 'all'], queryFn: () => getGlassCategories({ limit: 200 }), enabled: open });
  const glasses = useQuery({
    queryKey: ['glasses', 'for-excel'],
    queryFn: async () => (await getGlasses({ limit: 5000, offset: 0 })).items,
    enabled: open,
  });
  const gaskets = useQuery({
    queryKey: ['gaskets', 'for-excel'],
    queryFn: async () => (await getGaskets({ limit: 5000, offset: 0 })).items,
    enabled: open,
  });
  const glass: Dataset = {
    id: 'glass',
    label: 'Kính, pano, lưới',
    columns: [
      { key: 'code', label: 'Mã', kind: 'text' },
      { key: 'name', label: 'Tên', kind: 'text' },
      { key: 'categoryId', label: 'Nhóm', kind: 'select', options: () => idOpts(cats.data?.items) },
      { key: 'glassType', label: 'Loại', kind: 'select', options: () => GLASS_TYPES },
      { key: 'thicknessMm', label: 'Dày (mm)', kind: 'number' },
      { key: 'unitPrice', label: 'Đơn giá (đ/m²)', kind: 'number' },
      { key: 'weightPerM2', label: 'Kg/m²', kind: 'number' },
      { key: 'maxWidthMm', label: 'Rộng tối đa', kind: 'number' },
      { key: 'maxHeightMm', label: 'Cao tối đa', kind: 'number' },
      { key: 'isActive', label: 'Trạng thái', kind: 'bool' },
    ],
    blank: () => ({
      code: '',
      name: '',
      materialType: 'glass',
      categoryId: cats.data?.items[0]?.id ?? null,
      glassType: 'cuong_luc',
      thicknessMm: 8,
      unitPrice: 0,
      weightPerM2: 0,
      maxWidthMm: null,
      maxHeightMm: null,
      isDefault: false,
      isActive: true,
    }),
    check: (d) => {
      const errors: string[] = [];
      if (!String(d.code ?? '').trim()) errors.push('Thiếu mã');
      if (!String(d.name ?? '').trim()) errors.push('Thiếu tên');
      if (!cats.data?.items.some((c) => c.id === Number(d.categoryId))) errors.push('Chưa chọn nhóm kính');
      if (num(d.thicknessMm) <= 0) errors.push('Độ dày phải > 0');
      if (num(d.unitPrice) < 0) errors.push('Đơn giá không được âm');
      const hit = glasses.data?.find((g) => up(g.code) === up(d.code));
      return { errors, existingId: d.code && hit ? hit.id : null };
    },
  };
  const gasket: Dataset = {
    id: 'gasket',
    label: 'Gioăng, keo',
    columns: [
      { key: 'code', label: 'Mã', kind: 'text' },
      { key: 'name', label: 'Tên', kind: 'text' },
      { key: 'unit', label: 'Đơn vị', kind: 'select', options: () => GASKET_UNITS },
      { key: 'pricePerUnit', label: 'Đơn giá (đ)', kind: 'number' },
      { key: 'isActive', label: 'Trạng thái', kind: 'bool' },
    ],
    blank: () => ({ code: '', name: '', unit: 'm', pricePerUnit: 0, isActive: true }),
    check: (d) => {
      const errors: string[] = [];
      if (!String(d.code ?? '').trim()) errors.push('Thiếu mã');
      if (!String(d.name ?? '').trim()) errors.push('Thiếu tên');
      if (num(d.pricePerUnit) < 0) errors.push('Đơn giá không được âm');
      const hit = gaskets.data?.find((g) => up(g.code) === up(d.code));
      return { errors, existingId: d.code && hit ? hit.id : null };
    },
  };
  return (
    <ExcelImport
      open={open}
      onClose={onClose}
      title="Nhập Excel kính, gioăng, keo"
      datasets={[glass, gasket]}
      invalidate={['glasses', 'gaskets']}
      template={() => exportGlassGasketsExcel({ templateOnly: true })}
      preview={async (f): Promise<Rows> => {
        const res = await previewGlassGasketsExcel(f);
        return { glass: rowsOf(res.glasses), gasket: rowsOf(res.gaskets) };
      }}
      save={(r) =>
        bulkUpsertGlassGaskets({
          glasses: validOf(r.glass).map((x) => ({
            existingId: x.existingId,
            categoryId: Number(x.data.categoryId),
            code: String(x.data.code).trim(),
            name: String(x.data.name).trim(),
            glassType: String(x.data.glassType || 'cuong_luc'),
            thicknessMm: num(x.data.thicknessMm),
            unitPrice: num(x.data.unitPrice),
            weightPerM2: num(x.data.weightPerM2),
            maxWidthMm: (x.data.maxWidthMm as number | null) ?? null,
            maxHeightMm: (x.data.maxHeightMm as number | null) ?? null,
            isDefault: x.data.isDefault === true,
            isActive: x.data.isActive !== false,
          })),
          gaskets: validOf(r.gasket).map((x) => ({
            existingId: x.existingId,
            code: String(x.data.code).trim(),
            name: String(x.data.name).trim(),
            unit: String(x.data.unit ?? 'm'),
            pricePerUnit: num(x.data.pricePerUnit),
            isActive: x.data.isActive !== false,
          })),
        })
      }
    />
  );
}

export function BarImport({ open, onClose }: Common) {
  const brands = useQuery({ queryKey: ['brands', 'aluminum-all'], queryFn: () => getBrands({ limit: 9999, brandType: 'aluminum' }), enabled: open });
  const series = useQuery({
    queryKey: ['door-series', 'all-excel'],
    queryFn: async () => (await getDoorSeriesList({ offset: 0, limit: 9999 })).items,
    enabled: open,
  });
  const sections = useQuery({ queryKey: ['profile-sections', 'all-excel'], queryFn: () => getProfileSections({ limit: 500 }), enabled: open });
  const existing = useQuery({
    queryKey: ['profile-bars', 'for-excel'],
    queryFn: async () => (await getProfileBars({ offset: 0, limit: 5000 })).items,
    enabled: open,
  });
  const ds: Dataset = {
    id: 'bar',
    label: 'Thanh profile',
    columns: [
      { key: 'code', label: 'Mã thanh', kind: 'text' },
      { key: 'name', label: 'Tên thanh', kind: 'text' },
      {
        key: 'brandId',
        label: 'Hãng',
        kind: 'select',
        options: () => idOpts(brands.data?.items),
        onChange: (patch) => ({ seriesId: series.data?.find((s) => s.brandId === Number(patch.brandId))?.id ?? null }),
      },
      {
        key: 'seriesId',
        label: 'Hệ nhôm',
        kind: 'select',
        options: (d) => idOpts(series.data?.filter((s) => !d.brandId || s.brandId === Number(d.brandId))),
      },
      { key: 'barType', label: 'Loại thanh', kind: 'select', options: () => BAR_TYPES },
      { key: 'weightPerM', label: 'Kg/m', kind: 'number' },
      { key: 'barLengthMm', label: 'Dài cây (mm)', kind: 'number' },
      { key: 'sectionHeightMm', label: 'Cao tiết diện', kind: 'number' },
      { key: 'deductSashMm', label: 'Trừ cánh', kind: 'number' },
      { key: 'deductBeadMm', label: 'Trừ nẹp', kind: 'number' },
      { key: 'deductGlassMm', label: 'Trừ kính', kind: 'number' },
      { key: 'deductMullionMm', label: 'Trừ đố', kind: 'number' },
      {
        key: 'sectionLibraryId',
        label: 'Tiết diện',
        kind: 'select',
        options: () => (sections.data ?? []).map((s) => ({ value: String(s.id), label: `${s.code} · ${s.name}` })),
      },
      { key: 'isActive', label: 'Trạng thái', kind: 'bool' },
    ],
    blank: () => {
      const b = brands.data?.items[0];
      return {
        code: '',
        name: '',
        brandId: b?.id ?? null,
        seriesId: series.data?.find((s) => s.brandId === b?.id)?.id ?? null,
        barType: 'FRAME',
        weightPerM: 1,
        barLengthMm: 6000,
        sectionHeightMm: 0,
        deductSashMm: 0,
        deductBeadMm: 0,
        deductGlassMm: 0,
        deductMullionMm: 0,
        sectionLibraryId: null,
        isActive: true,
      };
    },
    check: (d) => {
      const errors: string[] = [];
      if (!String(d.code ?? '').trim()) errors.push('Thiếu mã thanh');
      if (!String(d.name ?? '').trim()) errors.push('Thiếu tên thanh');
      const brand = brands.data?.items.find((b) => b.id === Number(d.brandId));
      if (!brand) errors.push('Chưa chọn hãng nhôm hợp lệ');
      const sr = series.data?.find((s) => s.id === Number(d.seriesId));
      if (!sr || (brand && sr.brandId !== brand.id)) errors.push('Hệ nhôm không thuộc hãng đã chọn');
      if (num(d.weightPerM) <= 0) errors.push('Tỷ trọng phải > 0');
      const hit = sr && d.code ? existing.data?.find((b) => b.seriesId === sr.id && up(b.code) === up(d.code)) : null;
      return { errors, existingId: hit?.id ?? null };
    },
  };
  return (
    <ExcelImport
      open={open}
      onClose={onClose}
      title="Nhập Excel thanh profile"
      datasets={[ds]}
      invalidate={['profile-bars']}
      template={() => exportProfileBarsExcel({ templateOnly: true })}
      preview={async (f): Promise<Rows> => ({ bar: rowsOf((await previewProfileBarsExcel(f)).rows) })}
      save={(r) =>
        bulkUpsertProfileBars({
          items: validOf(r.bar).map((x) => ({
            existingId: x.existingId,
            brandId: Number(x.data.brandId),
            seriesId: Number(x.data.seriesId),
            code: String(x.data.code).trim(),
            name: String(x.data.name).trim(),
            barType: String(x.data.barType),
            weightPerM: num(x.data.weightPerM),
            barLengthMm: num(x.data.barLengthMm),
            sectionHeightMm: num(x.data.sectionHeightMm),
            deductSashMm: num(x.data.deductSashMm),
            deductBeadMm: num(x.data.deductBeadMm),
            deductGlassMm: num(x.data.deductGlassMm),
            deductMullionMm: num(x.data.deductMullionMm),
            sectionLibraryId: x.data.sectionLibraryId ? Number(x.data.sectionLibraryId) : null,
            isActive: x.data.isActive !== false,
          })),
        })
      }
    />
  );
}
