import type { Material } from './material';

export type ExtraOptionUnit = 'set' | 'pcs' | 'unit' | 'pair' | 'm2';

export const EXTRA_OPTION_UNIT_MAP: Record<ExtraOptionUnit, string> = {
  set: 'Bộ',
  pcs: 'Cái',
  unit: 'Chiếc',
  pair: 'Đôi',
  m2: 'm2',
};

export interface ExtraOption {
  id: number;
  code: string;
  name: string;
  costPrice: number;
  retailPrice: number;
  salePrice: number;
  unit?: ExtraOptionUnit;
  createdAt: string;
  updatedAt: string;
}

export interface ExtraOptionDetail extends ExtraOption {
  materials: Material[];
}

export interface ExtraOptionCreate {
  code: string;
  name: string;
  costPrice?: number;
  retailPrice?: number;
  salePrice?: number;
  unit?: ExtraOptionUnit;
}

export interface ExtraOptionUpdate {
  code?: string;
  name?: string;
  costPrice?: number;
  retailPrice?: number;
  salePrice?: number;
  unit?: ExtraOptionUnit;
}

export interface ExtraOptionQueryParams {
  search?: string;
  code?: string;
  offset?: number;
  limit?: number;
}

export interface ExtraOptionAssignMaterials {
  materialIds: number[];
}

export interface ExtraOptionUnassignMaterials {
  materialIds: number[];
}
