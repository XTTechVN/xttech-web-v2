export interface Brand {
  /** Bản ghi dùng chung của nền tảng: org khác chỉ đọc, nhân bản về để chỉnh */
  isSystem?: boolean;
  id: number;
  code: string;
  name: string;
  brandType: 'aluminum' | 'accessory' | 'both' | string;
  originCountry?: string | null;
  website?: string | null;
  logoPath?: string | null;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  barLengthMm?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandCreate {
  code: string;
  name: string;
  brandType?: string;
  originCountry?: string | null;
  website?: string | null;
  logoPath?: string | null;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  barLengthMm?: number | null;
}

export interface BrandUpdate {
  code?: string;
  name?: string;
  brandType?: string;
  originCountry?: string | null;
  website?: string | null;
  logoPath?: string | null;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  barLengthMm?: number | null;
}

export interface BrandQueryParams {
  search?: string;
  brandType?: string;
  isActive?: boolean;
  allowDeleted?: boolean;
  offset?: number;
  limit?: number;
}

export interface BrandColor {
  id: number;
  brandId: number;
  code: string;
  name: string;
  colorHex: string;
  surfaceType: 'anodize' | 'powder_coat' | 'wood_grain' | string;
  pricePerKg: number;
  priceMultiplier: number;
  isDefault: boolean;
  isActive: boolean;
  brand?: Brand | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandColorCreate {
  brandId: number;
  code: string;
  name: string;
  colorHex: string;
  surfaceType?: string;
  pricePerKg: number;
  priceMultiplier?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface BrandColorUpdate {
  brandId?: number;
  code?: string;
  name?: string;
  colorHex?: string;
  surfaceType?: string;
  pricePerKg?: number;
  priceMultiplier?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface BrandColorQueryParams {
  search?: string;
  brandId?: number;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}

// Hãng của hệ thống không đặt mặc định được (doanh nghiệp không sửa được), nên không tính là mặc định
export function isBrandFavorite(brand: Pick<Brand, 'sortOrder' | 'isSystem'>): boolean {
  return !brand.isSystem && (brand.sortOrder ?? 0) > 0;
}

export function getDefaultBrandId<T extends Pick<Brand, 'id' | 'sortOrder' | 'isSystem'>>(brands: T[]): number | null {
  const favoriteBrand = brands.find(isBrandFavorite);
  return favoriteBrand?.id ?? brands[0]?.id ?? null;
}
