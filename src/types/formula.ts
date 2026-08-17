export type FormulaType = 'door_trim' | 'circle' | 'semicircle' | 'wall_cladding';
export type DoorType = 'cd' | 'cs' | 'ck';

export const FORMULA_TYPE_MAP: Record<FormulaType, string> = {
  door_trim: 'Công thức phào',
  circle: 'Công thức cả đường tròn',
  semicircle: 'Công thức nửa đường tròn',
  wall_cladding: 'Khuôn bao phủ tường',
};

export const DOOR_TYPE_MAP: Record<DoorType, string> = {
  cd: 'Cửa đi',
  cs: 'Cửa sổ',
  ck: 'Cửa kính',
};

import type { Material } from './material';

export interface Formula {
  id: number;
  code: string | null;
  name: string | null;
  unit: string | null;
  type: FormulaType;
  materialId?: number | null;
  doorType: DoorType | null;
  wastageRate: number | null;
  widthAdd: number | null;
  heightAdd: number | null;
  createdAt: string;
  updatedAt: string;
  materials?: Material[];
  coefficientWidth?: number | null;
  coefficientHeight?: number | null;
}

export interface FormulaCreate {
  code?: string;
  name?: string;
  unit?: string;
  type: FormulaType;
  doorType?: DoorType;
  wastageRate?: number;
  widthAdd?: number;
  heightAdd?: number;
  coefficientWidth?: number;
  coefficientHeight?: number;
}

export interface FormulaUpdate {
  code?: string;
  name?: string;
  unit?: string;
  type?: FormulaType;
  doorType?: DoorType;
  wastageRate?: number;
  widthAdd?: number;
  heightAdd?: number;
  coefficientWidth?: number;
  coefficientHeight?: number;
}

export interface FormulaQueryParams {
  type?: FormulaType;
  materialId?: number;
  doorType?: DoorType;
  offset?: number;
  limit?: number;
  search?: string;
}
