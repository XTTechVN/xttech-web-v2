import { isBrandFavorite, type Brand } from '@/types';
import { getFileUrl } from '@/utils';
import queryClient from '@/utils/query';

export const BRAND_TYPES = [
  { value: 'aluminum', label: 'Hãng nhôm' },
  { value: 'accessory', label: 'Hãng phụ kiện' },
  { value: 'both', label: 'Cả hai (nhôm và phụ kiện)' },
];

export const SURFACE_TYPES = [
  { value: 'powder_coat', label: 'Sơn tĩnh điện' },
  { value: 'anodize', label: 'Anodize / Xi mạ' },
  { value: 'wood_grain', label: 'Sơn vân gỗ' },
  { value: 'pvdf', label: 'Sơn PVDF' },
  { value: 'other', label: 'Khác' },
];

export const typeLabel = (type: string) => BRAND_TYPES.find((t) => t.value === type)?.label ?? 'Hãng nhôm';
export const surfaceLabel = (type: string) => SURFACE_TYPES.find((t) => t.value === type)?.label ?? (type || '–');

// Thêm mốc cập nhật để trình duyệt tải lại logo khi vừa đổi
export function logoSrc(b: Pick<Brand, 'logoPath' | 'updatedAt'>) {
  if (!b.logoPath) return null;
  const url = getFileUrl(b.logoPath);
  return b.updatedAt ? `${url}${url.includes('?') ? '&' : '?'}t=${new Date(b.updatedAt).getTime()}` : url;
}

// Hãng yêu thích được chọn sẵn khi vào trang; mỗi nhóm (nhôm, phụ kiện) chỉ có một
export const groupOf = (b: Pick<Brand, 'brandType'>) => (b.brandType === 'accessory' ? 'accessory' : 'aluminum');
export const favoritesOf = (brands: Brand[], b: Brand) => brands.filter((x) => x.id !== b.id && groupOf(x) === groupOf(b) && isBrandFavorite(x));

export function refreshBrands() {
  ['brands', 'brands-picker', 'brands-list'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
}
