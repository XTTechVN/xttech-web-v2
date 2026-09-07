export const MATERIAL_UNIT_MAP: Record<string, string> = {
  set: 'Bộ',
  area: 'Diện tích (m²)',
  m2: 'm²',
};

export const formatMaterialUnit = (unit: string | null | undefined): string => {
  if (!unit) return '';
  return MATERIAL_UNIT_MAP[unit.toLowerCase()] || unit;
};

export interface Material {
  id: number;
  code: string | null;
  name: string;
  specification: string | null;
  description: string | null;
  costPrice: number;
  retailPrice: number;
  salePrice: number;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCreate {
  name: string;
  code?: string;
  specification?: string;
  description?: string;
  costPrice?: number;
  retailPrice?: number;
  salePrice?: number;
  unit?: string;
}

export interface MaterialUpdate {
  name?: string;
  code?: string;
  specification?: string;
  description?: string;
  costPrice?: number;
  retailPrice?: number;
  salePrice?: number;
  unit?: string;
}

export interface MaterialQueryParams {
  search?: string;
  code?: string;
  offset?: number;
  limit?: number;
}

export interface MaterialAssignAccessories {
  accessoryIds: number[];
}

export interface MaterialUnassignAccessories {
  accessoryIds: number[];
}

export interface MaterialAssignExtraOptions {
  extraOptionIds: number[];
}

export interface MaterialUnassignExtraOptions {
  extraOptionIds: number[];
}

export interface MaterialAssignFormulas {
  formulaIds: number[];
}

export interface MaterialUnassignFormulas {
  formulaIds: number[];
}
