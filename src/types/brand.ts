export interface Brand {
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
}

export interface BrandQueryParams {
  search?: string;
  brandType?: string;
  isActive?: boolean;
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
