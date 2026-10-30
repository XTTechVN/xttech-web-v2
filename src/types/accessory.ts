import type { AccessoryCategory } from './accessory-category';
import type { Brand } from './brand';

export interface AccessoryUnitConfig {
  label: string;
  className: string;
}

export const ACCESSORY_UNIT_CONFIG: Record<string, AccessoryUnitConfig> = {
  set: {
    label: 'Bộ',
    className: 'bg-teal-50 text-teal-700 border-teal-200/70',
  },
  pcs: {
    label: 'Cái',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  },
  unit: {
    label: 'Chiếc',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
  },
  pair: {
    label: 'Đôi / Cặp',
    className: 'bg-purple-50 text-purple-700 border-purple-200/70',
  },
  roll: {
    label: 'Cuộn',
    className: 'bg-amber-50 text-amber-700 border-amber-200/70',
  },
  box: {
    label: 'Hộp',
    className: 'bg-sky-50 text-sky-700 border-sky-200/70',
  },
  meter: {
    label: 'Mét',
    className: 'bg-rose-50 text-rose-700 border-rose-200/70',
  },
  sheet: {
    label: 'Tấm',
    className: 'bg-orange-50 text-orange-700 border-orange-200/70',
  },
};

export const ACCESSORY_UNIT_MAP: Record<string, string> = {
  set: 'Bộ',
  pcs: 'Cái',
  unit: 'Chiếc',
  pair: 'Đôi / Cặp',
  roll: 'Cuộn',
  box: 'Hộp',
  meter: 'Mét',
  sheet: 'Tấm',
};

export const getAccessoryUnitConfig = (unit: string | null | undefined): AccessoryUnitConfig => {
  if (!unit) {
    return {
      label: '—',
      className: 'bg-gray-100 text-gray-500 border-gray-200',
    };
  }
  const key = unit.toLowerCase();
  return (
    ACCESSORY_UNIT_CONFIG[key] || {
      label: unit,
      className: 'bg-gray-100 text-gray-700 border-gray-200',
    }
  );
};

export const formatAccessoryUnit = (unit: string | null | undefined): string => {
  if (!unit) return '';
  return ACCESSORY_UNIT_MAP[unit.toLowerCase()] || unit;
};

export const ACCESSORY_COLOR_MAP: Record<string, string> = {
  black: 'Đen tuyền',
  white: 'Trắng sứ',
  silver: 'Bạc ánh kim',
  gold: 'Vàng champagne',
  grey: 'Xám ghi',
  gray: 'Xám ghi',
  brown: 'Nâu cafe',
};

export interface Accessory {
  id: number;
  code: string | null;
  categoryId?: number | null;
  category?: AccessoryCategory | null;
  brandId?: number | null;
  brand?: Brand | null;
  name: string;
  specification: string | null;
  unit: string | null;
  unitPrice?: number;
  color?: string | null;
  costPrice: number;
  retailPrice: number;
  salePrice: number;
  imagePath: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccessoryCreate {
  name: string;
  code?: string;
  categoryId?: number | null;
  brandId?: number | null;
  specification?: string;
  unit?: string;
  unitPrice?: number;
  color?: string;
  costPrice?: number;
  retailPrice?: number;
  salePrice?: number;
  imagePath?: string;
  isActive?: boolean;
}

export interface AccessoryUpdate {
  name?: string;
  code?: string;
  categoryId?: number | null;
  brandId?: number | null;
  specification?: string;
  unit?: string;
  unitPrice?: number;
  color?: string;
  costPrice?: number;
  retailPrice?: number;
  salePrice?: number;
  imagePath?: string;
  isActive?: boolean;
}

export interface AccessoryQueryParams {
  search?: string;
  code?: string;
  unit?: string;
  categoryId?: number;
  brandId?: number;
  isActive?: boolean;
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
