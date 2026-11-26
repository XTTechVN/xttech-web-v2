import axios from 'axios';
import { SIGN_ACCESSORY_CATEGORY_FALLBACK, SIGN_ACCESSORY_CATEGORY_LABEL, SIGN_EXTRA_UNIT_LABEL, SIGN_STATUS_LABEL } from '@/config/sign';
import { ACCESSORY_UNIT_MAP, DOOR_TYPE_LABELS, MATERIAL_UNIT_MAP } from '@/types';
import type { PublicSigningItem } from '@/types';

export const formatVnd = (value?: number | null): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value ?? 0);

export const formatNumber = (value?: number | null, digits = 2): string =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: digits }).format(value ?? 0);

export const getSignErrorMessage = (error: unknown): string =>
  axios.isAxiosError(error)
    ? (error.response?.data?.details?.message ?? 'Không thể xử lý yêu cầu')
    : 'Không thể xử lý yêu cầu';

export interface SignFloorGroup {
  key: string;
  floorName: string;
  items: PublicSigningItem[];
}

/** Gom các bộ cửa theo tầng, giữ thứ tự `sortIndex` đã sắp từ backend. */
export const groupItemsByFloor = (items: PublicSigningItem[]): SignFloorGroup[] => {
  const groups = new Map<string, SignFloorGroup>();
  for (const item of items) {
    const key = item.floorId != null ? String(item.floorId) : 'none';
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, { key, floorName: item.floorName || 'Khác', items: [item] });
    }
  }
  return Array.from(groups.values());
};

/** Chuỗi trông như mã kỹ thuật tiếng Anh (vd glass_wall, pcs) chứ không phải tên hiển thị. */
const isRawCode = (value: string): boolean => /^[a-z0-9_\-./]+$/.test(value);

/** Tra map; nếu không có và giá trị là mã thô thì trả allback để không lộ tiếng Anh. */
const lookupLabel = (value: string | null | undefined, map: Record<string, string>, fallback: string | null): string | null => {
  const raw = value?.trim();
  if (!raw) return null;
  const mapped = map[raw.toLowerCase()];
  if (mapped) return mapped;
  return isRawCode(raw) ? fallback : raw;
};

export const getSignDoorTypeLabel = (value?: string | null): string | null =>
  lookupLabel(value, DOOR_TYPE_LABELS, null);

export const getSignUnitLabel = (value?: string | null): string =>
  lookupLabel(value, { ...ACCESSORY_UNIT_MAP, ...MATERIAL_UNIT_MAP, ...SIGN_EXTRA_UNIT_LABEL }, '') ?? '';

export const getSignCategoryLabel = (value?: string | null): string =>
  lookupLabel(value, SIGN_ACCESSORY_CATEGORY_LABEL, SIGN_ACCESSORY_CATEGORY_FALLBACK) ??
  SIGN_ACCESSORY_CATEGORY_FALLBACK;

export const getSignStatusLabel = (value?: string | null): string | null =>
  lookupLabel(value, SIGN_STATUS_LABEL, null);