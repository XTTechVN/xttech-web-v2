import type { ProfileBarCreate } from '@/types';

export const BAR_TYPE_OPTIONS = [
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
] as const;

export const BAR_TYPE_MAP: Record<string, string> = Object.fromEntries(
  BAR_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

export const DEFAULT_VALUES: ProfileBarCreate = {
  brandId: 0,
  seriesId: 0,
  code: '',
  name: '',
  barType: 'FRAME',
  weightPerM: 0,
  sectionHeightMm: 0,
  barLengthMm: 6000,
  deductMullionMm: 0,
  deductSashMm: 0,
  deductBeadMm: 0,
  deductGlassMm: 0,
  sectionLibraryId: null,
  note: '',
  isVirtual: false,
  isFullCompanion: false,
  isActive: true,
};

export const DEDUCTION_FIELDS: Array<{ name: 'deductSashMm' | 'deductBeadMm' | 'deductGlassMm' | 'deductMullionMm'; label: string }> = [
  { name: 'deductSashMm', label: 'Trừ cánh (mm)' },
  { name: 'deductBeadMm', label: 'Trừ nẹp (mm)' },
  { name: 'deductGlassMm', label: 'Trừ kính (mm)' },
  { name: 'deductMullionMm', label: 'Trừ đố chia (mm)' },
];

export const SELECT_CLASS =
  'w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition';

/** Chuyển giá trị ô nhập số (có thể rỗng) sang number | null. */
export function toNullableNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
