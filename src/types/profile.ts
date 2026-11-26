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

export interface ProfileBarVariant {
  id?: number;
  profileBarId?: number;
  role: string;
  code: string;
  name?: string | null;
  note?: string | null;
  sectionHeightMm?: number | null;
  deductSashMm?: number | null;
  deductBeadMm?: number | null;
  deductGlassMm?: number | null;
  deductMullionMm?: number | null;
  sortOrder?: number;
}

export interface ProfileBarCompanion {
  id?: number;
  profileBarId?: number;
  companionBarId: number;
  code?: string | null;
  name?: string | null;
  offsetMm: number;
  qty: number;
  goc1?: number | null;
  goc2?: number | null;
  note?: string | null;
  sortOrder?: number;
  companionCode?: string | null;
  companionName?: string | null;
  companionBarType?: string | null;
  companionWeightPerM?: number | null;
  companionSectionHeightMm?: number | null;
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
  note?: string | null;
  isVirtual: boolean;
  isFullCompanion: boolean;
  isActive: boolean;
  variants: ProfileBarVariant[];
  companions: ProfileBarCompanion[];
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
  note?: string | null;
  isVirtual?: boolean;
  isFullCompanion?: boolean;
  isActive?: boolean;
  variants?: ProfileBarVariant[];
  companions?: ProfileBarCompanion[];
}

export type ProfileBarUpdate = Partial<ProfileBarCreate>;
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

export interface ProfileSectionQueryParams {
  search?: string;
  category?: string;
  offset?: number;
  limit?: number;
}
