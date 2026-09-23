export interface GlassCategory {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GlassCategoryCreate {
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface GlassCategoryUpdate {
  code?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface GlassCategoryQueryParams {
  search?: string;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}

export interface Glass {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  glassType: 'cuong_luc' | 'dan_an_toan' | 'kinh_hop' | 'trang' | string;
  thicknessMm: number;
  unitPrice: number;
  weightPerM2: number;
  maxWidthMm?: number | null;
  maxHeightMm?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: GlassCategory | null;
}

export interface GlassCreate {
  categoryId: number;
  code: string;
  name: string;
  glassType?: string;
  thicknessMm: number;
  unitPrice: number;
  weightPerM2?: number;
  maxWidthMm?: number | null;
  maxHeightMm?: number | null;
  isActive?: boolean;
}

export interface GlassUpdate {
  categoryId?: number;
  code?: string;
  name?: string;
  glassType?: string;
  thicknessMm?: number;
  unitPrice?: number;
  weightPerM2?: number;
  maxWidthMm?: number | null;
  maxHeightMm?: number | null;
  isActive?: boolean;
}

export interface GlassQueryParams {
  search?: string;
  categoryId?: number;
  glassType?: string;
  isActive?: boolean;
  offset?: number;
  limit?: number;
}
