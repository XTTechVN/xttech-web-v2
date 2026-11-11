import { DOOR_TYPE_MAP } from './formula';
import { DoorSeries } from './door-series';

export type DoorType =
  | 'glass_wall'
  | 'casement_window'
  | 'sliding_window'
  | 'casement_door'
  | 'sliding_door'
  | 'folding_door'
  | 'sliding_casement_door'
  | 'composite'
  | 'curtain_wall'
  // Legacy compatibility aliases
  | 'cd'
  | 'cs'
  | 'ck';

export interface DoorTypeConfig {
  label: string;
  className: string;
}

export const DOOR_TYPE_LABELS: Record<string, string> = {
  glass_wall: 'Vách kính',
  casement_window: 'Cửa sổ mở quay',
  sliding_window: 'Cửa sổ lùa',
  casement_door: 'Cửa đi mở quay',
  sliding_door: 'Cửa đi lùa',
  folding_door: 'Cửa gấp xếp',
  sliding_casement_door: 'Cửa trượt quay',
  composite: 'Tổng hợp',
  curtain_wall: 'Mặt dựng',
  // Legacy aliases
  cd: 'Cửa đi mở quay',
  cs: 'Cửa sổ mở quay',
  ck: 'Vách kính',
};

export const DOOR_TYPE_CONFIG: Record<string, DoorTypeConfig> = {
  glass_wall: {
    label: 'Vách kính',
    className: 'bg-amber-50 text-amber-700 border-amber-200/70',
  },
  casement_window: {
    label: 'Cửa sổ mở quay',
    className: 'bg-blue-50 text-blue-700 border-blue-200/70',
  },
  sliding_window: {
    label: 'Cửa sổ lùa',
    className: 'bg-sky-50 text-sky-700 border-sky-200/70',
  },
  casement_door: {
    label: 'Cửa đi mở quay',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  },
  sliding_door: {
    label: 'Cửa đi lùa',
    className: 'bg-teal-50 text-teal-700 border-teal-200/70',
  },
  folding_door: {
    label: 'Cửa gấp xếp',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
  },
  sliding_casement_door: {
    label: 'Cửa trượt quay',
    className: 'bg-purple-50 text-purple-700 border-purple-200/70',
  },
  composite: {
    label: 'Tổng hợp',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  curtain_wall: {
    label: 'Mặt dựng',
    className: 'bg-rose-50 text-rose-700 border-rose-200/70',
  },
  // Legacy aliases
  cd: {
    label: 'Cửa đi mở quay',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  },
  cs: {
    label: 'Cửa sổ mở quay',
    className: 'bg-blue-50 text-blue-700 border-blue-200/70',
  },
  ck: {
    label: 'Vách kính',
    className: 'bg-amber-50 text-amber-700 border-amber-200/70',
  },
};

export const LEGACY_DOOR_TYPE_MAP: Record<string, DoorType> = {
  cd: 'casement_door',
  cs: 'casement_window',
  ck: 'glass_wall',
  di_mo: 'casement_door',
  di_lua: 'sliding_door',
  so_mo: 'casement_window',
  so_lua: 'sliding_window',
  gap_xep: 'folding_door',
  truot_quay: 'sliding_casement_door',
  vach: 'glass_wall',
  mat_dung: 'curtain_wall',
  tong_hop: 'composite',
};

export const normalizeDoorType = (type: string | null | undefined): string => {
  if (!type) return '';
  const key = type.toLowerCase().trim();
  return LEGACY_DOOR_TYPE_MAP[key] || key;
};

export const getDoorTypeConfig = (type: string | null | undefined): DoorTypeConfig => {
  if (!type) {
    return {
      label: '—',
      className: 'bg-gray-50 text-gray-600 border-gray-200/70',
    };
  }
  const key = type.toLowerCase().trim();
  if (DOOR_TYPE_CONFIG[key]) {
    return DOOR_TYPE_CONFIG[key];
  }
  const normalized = normalizeDoorType(key);
  if (DOOR_TYPE_CONFIG[normalized]) {
    return DOOR_TYPE_CONFIG[normalized];
  }
  const mappedLabel = (DOOR_TYPE_MAP as Record<string, string>)[key] || type;
  return {
    label: mappedLabel,
    className: 'bg-gray-50 text-gray-700 border-gray-200/70',
  };
};

export const formatDoorType = (type: string | null | undefined): string => {
  if (!type) return '';
  return getDoorTypeConfig(type).label;
};

export interface DoorImage {
  id: number;
  doorId: number;
  imagePath: string;
  name?: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface Door {
  id: number;
  doorSeriesId?: number | null;
  doorSeries?: DoorSeries | null;
  type: string | null;
  code: string | null;
  name: string;
  imagePath: string | null;
  images?: DoorImage[];
  specification: string | null;
  systemConfig?: Record<string, any> | null;
  imageB64?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CalculationStepTone = 'neutral' | 'deduct' | 'add' | 'subtotal' | 'result';

export interface CalculationStep {
  label: string;
  formula?: string | null;
  value: string;
  tone: CalculationStepTone;
}

export interface ProfileBarCut {
  name: string;
  side?: number | null;
  length: number;
  goc1: number;
  goc2: number;
  formula?: string | null;
  category: string;
  frameEdge?: string | null;
  qty: number;
  weightPerM: number;
  profileId?: number | null;
  profileCode?: string | null;
  profileName?: string | null;
  positions?: string[];
  calcSteps?: CalculationStep[];
  calcNote?: string | null;
}

export interface BeadCut {
  name: string;
  length: number;
  goc1: number;
  goc2: number;
  formula?: string | null;
  thicknessMm: number;
  category: string;
  qty: number;
  profileId?: number | null;
  profileCode?: string | null;
  profileName?: string | null;
  weightPerM?: number;
  positions?: string[];
  calcSteps?: CalculationStep[];
  calcNote?: string | null;
}

export interface GlassCellBOM {
  path: string;
  w: number;
  h: number;
  glassW: number;
  glassH: number;
  areaM2: number;
  pricingAreaM2: number;
  openType?: string | null;
  glassName?: string | null;
  glassPrice?: number | null;
  calcSteps?: CalculationStep[];
  calcNote?: string | null;
}

export interface GroupedGlassCellBOM {
  glassName: string;
  glassW: number;
  glassH: number;
  areaM2: number;
  totalAreaM2: number;
  qty: number;
  glassPrice?: number;
}

export type CornerJointPosition = 'frame' | 'sash' | 'safety_frame';
export type CornerJointTypeCode = 'crimped' | 'permanent_screw' | 'spring_clip' | 'miter_45';

export interface CornerJointBOM {
  name: string;
  position: CornerJointPosition;
  qty: number;
  unit: string;
  jointType?: CornerJointTypeCode | string | null;
  formula?: string | null;
  comboId?: number | null;
  comboName?: string | null;
  baseQuantity?: number | null;
  accessoryId?: number | null;
  accessoryCode?: string | null;
  accessoryName?: string | null;
  unitPrice: number;
  totalPrice: number;
  isConfigured: boolean;
  note?: string | null;
}

export interface SelectedAccessoryItem {
  accessoryId: number;
  quantity: number;
  note?: string | null;
}

export interface GlassGrilleBOM {
  cellPath: string;
  barWidthMm: number;
  barColor: string;
  gridLengthM: number;
  borderLengthM: number;
  cornerLengthM: number;
  totalBarLengthM: number;
  motifQty: number;
  motifItems: Array<{ id: string; motifType: string; name?: string; qty: number }>;
  unitPricePerM: number;
  totalBarPrice: number;
  totalMotifPrice: number;
  totalPrice: number;
}

export interface AccessoryBOMItem {
  accessoryId?: number | null;
  comboId?: number | null;
  comboName?: string | null;
  code?: string | null;
  name: string;
  category?: string | null;
  brandName?: string | null;
  unit: string;
  baseQuantity?: number | null;
  quantity: number;
  scaleFormula?: string | null;
  unitPrice: number;
  totalPrice: number;
  note?: string | null;
}

export interface GasketBOMItem {
  gasketId?: number | null;
  code?: string | null;
  name: string;
  measure: string;
  lengthM: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  target: string;
  note?: string | null;
}

export interface DoorCalculateResponse {
  w: number;
  h: number;
  bars: ProfileBarCut[];
  groupedBars: ProfileBarCut[];
  beads: BeadCut[];
  groupedBeads: BeadCut[];
  cells: GlassCellBOM[];
  groupedCells: GroupedGlassCellBOM[];
  cornerJoints?: CornerJointBOM[];
  grilles?: GlassGrilleBOM[];
  accessories?: AccessoryBOMItem[];
  gaskets?: GasketBOMItem[];
  sashCounts: Record<string, number>;
  totalAluminumWeightKg: number;
  totalGlassAreaM2: number;
  totalJointQty?: number;
  totalJointPrice?: number;
  totalGrillePrice?: number;
  totalAccessoryQty?: number;
  totalAccessoryPrice?: number;
  totalGasketLengthM?: number;
  totalGasketPrice?: number;
  hasUnconfiguredJoints?: boolean;
}

export interface DoorCalculateRequest {
  doorId?: number;
  systemConfig?: Record<string, any>;
  width?: number;
  height?: number;
  glassPrice?: number;
}

export interface DoorCreate {
  name: string;
  doorSeriesId?: number | null;
  type?: string;
  code?: string;
  imagePath?: string;
  specification?: string;
  systemConfig?: Record<string, any>;
  imageB64?: string;
}

export interface DoorUpdate {
  name?: string;
  doorSeriesId?: number | null;
  type?: string;
  code?: string;
  imagePath?: string;
  specification?: string;
  systemConfig?: Record<string, any>;
  imageB64?: string;
}

export interface DoorQueryParams {
  search?: string;
  type?: string;
  code?: string;
  doorSeriesId?: number;
  brandId?: number;
  offset?: number;
  limit?: number;
}

export interface DoorAssignAccessories {
  accessoryIds: number[];
}

export interface DoorUnassignAccessories {
  accessoryIds: number[];
}
