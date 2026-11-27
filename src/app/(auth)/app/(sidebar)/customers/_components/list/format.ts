import type { TagTone } from '@/components-remake';
import type { Customer } from '@/types';

export const TYPES: { value: string; label: string; tone: TagTone }[] = [
  { value: 'potential', label: 'Tiềm năng', tone: 'blue' },
  { value: 'active', label: 'Đang hoạt động', tone: 'green' },
  { value: 'inactive', label: 'Ngưng hoạt động', tone: 'slate' },
  { value: 'vip', label: 'VIP', tone: 'amber' },
];

export const typeOf = (t?: string | null) =>
  TYPES.find((o) => o.value === t) ?? { value: '', label: t || 'Chưa phân loại', tone: 'slate' as TagTone };

export const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '–');

export const staffName = (c: Customer) => c.staff?.fullName || c.staff?.username || c.staff?.email || '–';

export const mapUrl = (c: Customer) =>
  c.latitude != null && c.longitude != null ? `https://www.google.com/maps?q=${c.latitude},${c.longitude}` : null;
