'use client';

import { createBrandColor, deleteBrandColor, getBrandColors, updateBrandColor } from '@/actions';
import type { Brand, BrandColor } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Sheet } from '../../_components/sheet';
import { ACTIVE } from './brand-sheet';
import { EntityTab, type EntityConfig } from './entity-tab';

const SURFACES = [
  { value: 'powder_coat', label: 'Sơn tĩnh điện' },
  { value: 'anodize', label: 'Anodize / Xi mạ' },
  { value: 'wood_grain', label: 'Sơn vân gỗ' },
  { value: 'pvdf', label: 'Sơn PVDF' },
  { value: 'other', label: 'Khác' },
];
// Dữ liệu cũ có thể ghi 'son_tinh_dien'
const surfaceLabel = (v?: string) => SURFACES.find((s) => s.value === (v === 'son_tinh_dien' ? 'powder_coat' : v))?.label ?? v ?? '–';
const HEX = /^#[0-9a-f]{6}$/i;

// Hệ màu và giá sơn theo kg của một hãng nhôm (cần quyền danh mục).
export function BrandColors({ brand, onClose }: { brand: Brand | null; onClose: () => void }) {
  const cfg: EntityConfig<BrandColor> = {
    queryKey: `brand-colors-of-${brand?.id}`,
    noun: 'màu',
    load: async () => (await getBrandColors({ brandId: brand!.id, limit: 1000 })).items,
    title: (c) => c.name,
    sub: (c) => `${c.code} · ${surfaceLabel(c.surfaceType)} · ${formatCurrency(c.pricePerKg)}/kg`,
    badge: (c) => (
      <span
        role="img"
        aria-label={`Màu ${c.colorHex}`}
        className="size-4 flex-none rounded-rm-sm border border-rm-line"
        style={{ backgroundColor: HEX.test(c.colorHex) ? c.colorHex : undefined }}
      />
    ),
    inactive: (c) => !c.isActive,
    cols: [
      { key: 'code', header: 'Mã', fit: true, cell: (c) => c.code },
      { key: 'surface', header: 'Bề mặt', fit: true, cell: (c) => surfaceLabel(c.surfaceType) },
      { key: 'price', header: 'Giá sơn/kg', fit: true, align: 'right', cell: (c) => formatCurrency(c.pricePerKg) },
    ],
    fields: [
      { key: 'name', label: 'Tên màu', required: true },
      { key: 'code', label: 'Mã màu', required: true, half: true },
      { key: 'colorHex', label: 'Mã màu hiển thị (#rrggbb)', required: true, half: true },
      { key: 'surfaceType', label: 'Bề mặt', type: 'select', options: SURFACES },
      { key: 'pricePerKg', label: 'Đơn giá (đ/kg)', type: 'number', half: true },
      { key: 'priceMultiplier', label: 'Hệ số giá', type: 'number', half: true },
      {
        key: 'isDefault',
        label: 'Màu mặc định',
        type: 'select',
        options: [
          { value: '0', label: 'Không' },
          { value: '1', label: 'Có' },
        ],
        half: true,
      },
      { key: 'isActive', label: 'Trạng thái', type: 'select', options: ACTIVE, half: true },
    ],
    toForm: (c) => ({
      name: c?.name ?? '',
      code: c?.code ?? '',
      colorHex: c?.colorHex ?? '#cccccc',
      surfaceType: c?.surfaceType === 'son_tinh_dien' ? 'powder_coat' : (c?.surfaceType ?? 'powder_coat'),
      pricePerKg: c ? String(c.pricePerKg) : '',
      priceMultiplier: String(c?.priceMultiplier ?? 1),
      isDefault: c?.isDefault ? '1' : '0',
      isActive: c?.isActive === false ? '0' : '1',
    }),
    save: (f, c) => {
      if (!HEX.test(f.colorHex.trim())) return Promise.reject(new Error('Mã màu hiển thị phải dạng #rrggbb'));
      const body = {
        brandId: brand!.id,
        name: f.name.trim(),
        code: f.code.trim(),
        colorHex: f.colorHex.trim(),
        surfaceType: f.surfaceType,
        pricePerKg: Number(f.pricePerKg) || 0,
        priceMultiplier: Number(f.priceMultiplier) || 1,
        isDefault: f.isDefault === '1',
        isActive: f.isActive === '1',
      };
      return c ? updateBrandColor(c.id, body) : createBrandColor(body);
    },
    remove: (c) => deleteBrandColor(c.id),
  };
  return (
    <Sheet open={!!brand} onClose={onClose} title={brand ? `Hệ màu · ${brand.name}` : 'Hệ màu'}>
      <div className="p-rm-gutter">{brand && <EntityTab cfg={cfg} compact />}</div>
    </Sheet>
  );
}
