export interface MaterialUnitConfig {
  label: string;
  className: string;
}

export const MATERIAL_UNIT_CONFIG: Record<string, MaterialUnitConfig> = {
  set: {
    label: 'Bộ',
    className: 'bg-teal-50 text-teal-700 border-teal-200/70',
  },
  area: {
    label: 'm²',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
  },
  m2: {
    label: 'm²',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
  },
};

export const MATERIAL_UNIT_MAP: Record<string, string> = {
  set: 'Bộ',
  area: 'm²',
  m2: 'm²',
};

export const getMaterialUnitConfig = (unit: string | null | undefined): MaterialUnitConfig => {
  if (!unit) {
    return {
      label: '—',
      className: 'bg-gray-100 text-gray-500 border-gray-200',
    };
  }
  const key = unit.toLowerCase().trim();
  return (
    MATERIAL_UNIT_CONFIG[key] || {
      label: unit,
      className: 'bg-gray-100 text-gray-700 border-gray-200',
    }
  );
};

export const formatMaterialUnit = (unit: string | null | undefined): string => {
  if (!unit) return '';
  return getMaterialUnitConfig(unit).label;
};

export interface MaterialPrice {
  id?: number;
  materialId?: number;
  width: number;
  height: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialPriceCreate {
  width: number;
  height: number;
  price: number;
}

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
  prices?: MaterialPrice[];
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
  prices?: MaterialPriceCreate[];
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
  prices?: MaterialPriceCreate[];
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
