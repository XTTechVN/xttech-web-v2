export const ACCESSORY_UNIT_MAP: Record<string, string> = {
  set: 'Bộ',
  pcs: 'Cái',
  unit: 'Chiếc',
  pair: 'Đôi',
};

export const formatAccessoryUnit = (unit: string | null | undefined): string => {
  if (!unit) return '';
  return ACCESSORY_UNIT_MAP[unit.toLowerCase()] || unit;
};

export interface Accessory {
  id: number;
  code: string | null;
  name: string;
  specification: string | null;
  unit: string | null;
  costPrice: number;
  retailPrice: number;
  salePrice: number;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccessoryCreate {
  name: string;
  code?: string;
  specification?: string;
  unit?: string;
  costPrice?: number;
  retailPrice?: number;
  salePrice?: number;
  imagePath?: string;
}

export interface AccessoryUpdate {
  name?: string;
  code?: string;
  specification?: string;
  unit?: string;
  costPrice?: number;
  retailPrice?: number;
  salePrice?: number;
  imagePath?: string;
}

export interface AccessoryQueryParams {
  search?: string;
  code?: string;
  unit?: string;
  offset?: number;
  limit?: number;
  allowDeleted?: boolean;
  materialId?: number;
  doorId?: number;
}

export interface AccessoryAssignDoors {
  doorIds: number[];
}

export interface AccessoryUnassignDoors {
  doorIds: number[];
}

export interface AccessoryAssignMaterials {
  materialIds: number[];
}

export interface AccessoryUnassignMaterials {
  materialIds: number[];
}
