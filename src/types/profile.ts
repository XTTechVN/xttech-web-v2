import type { Brand } from './brand';
import type { DoorSeries } from './door-series';

export interface ProfileSection {
  id: number;
  code: string;
  name: string;
  category: 'frame' | 'sash' | 'mullion' | 'bead' | string;
  svgPathData: string;
  viewBox: string;
  grooveWidthMm?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSectionCreate {
  code: string;
  name: string;
  category?: string;
  svgPathData: string;
  viewBox?: string;
  grooveWidthMm?: number | null;
}

export interface ProfileSectionUpdate {
  code?: string;
  name?: string;
  category?: string;
  svgPathData?: string;
  viewBox?: string;
  grooveWidthMm?: number | null;
}

export interface ProfileBar {
  id: number;
  brandId: number;
  seriesId: number;
  sectionLibraryId?: number | null;
  code: string;
  name: string;
  barType: string;
  weightPerM: number;
  sectionHeightMm: number;
  barLengthMm: number;
  deductMullionMm?: number;
  deductSashMm?: number;
  deductBeadMm?: number;
  deductGlassMm?: number;
  sectionImagePath?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  brand?: Brand | null;
  doorSeries?: DoorSeries | null;
  sectionLibrary?: ProfileSection | null;
}

export interface ProfileBarCreate {
  brandId: number;
  seriesId: number;
  code: string;
  name: string;
  barType: string;
  weightPerM: number;
  sectionHeightMm: number;
  barLengthMm?: number;
  deductMullionMm?: number;
  deductSashMm?: number;
  deductBeadMm?: number;
  deductGlassMm?: number;
  sectionLibraryId?: number | null;
  sectionImagePath?: string | null;
  isActive?: boolean;
}

export interface ProfileBarUpdate {
  brandId?: number;
  seriesId?: number;
  code?: string;
  name?: string;
  barType?: string;
  weightPerM?: number;
  sectionHeightMm?: number;
  barLengthMm?: number;
  deductMullionMm?: number;
  deductSashMm?: number;
  deductBeadMm?: number;
  deductGlassMm?: number;
  sectionLibraryId?: number | null;
  sectionImagePath?: string | null;
  isActive?: boolean;
}

export interface ProfileBarQueryParams {
  search?: string;
  brandId?: number;
  seriesId?: number;
  barType?: string;
  isActive?: boolean;
  allowDeleted?: boolean;
  offset?: number;
  limit?: number;
}
