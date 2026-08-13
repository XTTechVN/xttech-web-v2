import type { Material } from './material';

export interface ExtraOption {
  id: number;
  code: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtraOptionDetail extends ExtraOption {
  materials: Material[];
}

export interface ExtraOptionCreate {
  code: string;
  name: string;
  price: number;
}

export interface ExtraOptionUpdate {
  code?: string;
  name?: string;
  price?: number;
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
